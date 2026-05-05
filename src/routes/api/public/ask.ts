import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type Msg = { role: "user" | "assistant"; content: string };

const SYSTEM = `You are an AI guide to the writings of Professor F. Niyi Akinnaso — a retired Professor of Anthropology and Linguistics and longtime newspaper columnist whose essays appeared in The Nation, The Punch, Premium Times, Vanguard and other Nigerian outlets.

You answer questions strictly using the excerpts from his published essays provided in the context block below.

Rules:
- Ground every claim in the provided excerpts. Quote sparingly when helpful.
- When you draw on a specific essay, cite it inline as [n] using the source numbers from the context.
- If the excerpts don't address the question, say so plainly and suggest related themes that do appear in his work.
- Speak about Professor Akinnaso in the third person ("Akinnaso argues…", "He has written…"). Do not roleplay as him.
- Be concise (2–4 short paragraphs) and use markdown.`;

export const Route = createFileRoute("/api/public/ask")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { messages } = (await request.json()) as { messages: Msg[] };
          if (!Array.isArray(messages) || messages.length === 0) {
            return new Response(JSON.stringify({ error: "messages required" }), { status: 400 });
          }

          const lastUser = [...messages].reverse().find((m) => m.role === "user");
          const query = (lastUser?.content || "").slice(0, 500);

          // Retrieve top relevant essays
          const { data: results } = await supabaseAdmin.rpc("search_articles", {
            q: query,
            max_results: 6,
          });
          const sources = (results || []) as Array<{
            id: string;
            slug: string;
            title: string;
            source: string;
            source_url: string;
            published_at: string | null;
            snippet: string;
          }>;

          const contextBlock = sources.length
            ? sources
                .map((s, i) => {
                  const date = s.published_at
                    ? new Date(s.published_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "n.d.";
                  return `[${i + 1}] "${s.title}" (${date}, ${s.source})\n${s.snippet?.replace(/\s+/g, " ").trim()}`;
                })
                .join("\n\n")
            : "(No matching excerpts were found in the archive.)";

          const systemWithContext = `${SYSTEM}\n\n--- Excerpts from his archive ---\n${contextBlock}\n--- End excerpts ---`;

          const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
          if (!LOVABLE_API_KEY) {
            return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
              status: 500,
            });
          }

          const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              stream: true,
              messages: [
                { role: "system", content: systemWithContext },
                ...messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
              ],
            }),
          });

          if (!upstream.ok) {
            const text = await upstream.text().catch(() => "");
            const status = upstream.status;
            const msg =
              status === 429
                ? "Rate limit reached — please try again in a moment."
                : status === 402
                  ? "AI usage credits exhausted. Add credits in Settings → Workspace → Usage."
                  : `AI gateway error: ${text.slice(0, 200)}`;
            return new Response(JSON.stringify({ error: msg }), {
              status,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Prepend a sources event, then forward the upstream SSE
          const encoder = new TextEncoder();
          const reader = upstream.body!.getReader();
          const stream = new ReadableStream({
            async start(controller) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ sources })}\n\n`),
              );
              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  controller.enqueue(value);
                }
              } catch (e) {
                controller.error(e);
              } finally {
                controller.close();
              }
            },
          });

          return new Response(stream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        } catch (e) {
          console.error("ask error", e);
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
