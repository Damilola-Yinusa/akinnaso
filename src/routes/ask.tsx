import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/ask")({
  head: () => ({
    meta: [
      { title: "Ask Prof. Akinnaso — AI guide to his writings" },
      {
        name: "description",
        content:
          "Ask anything about democracy, education, language, Yoruba culture, governance and more — answered live from Professor Akinnaso's archive of essays.",
      },
      { property: "og:title", content: "Ask Prof. Akinnaso — AI guide to his writings" },
      {
        property: "og:description",
        content: "AI-powered Q&A grounded in nearly 200 of his published essays.",
      },
    ],
  }),
  component: AskPage,
});

type Source = {
  id: string;
  slug: string;
  title: string;
  source: string;
  source_url: string;
  published_at: string | null;
  snippet: string;
};

type Msg = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

const SOURCE_LABEL: Record<string, string> = {
  thenation: "The Nation",
  punch: "The Punch",
  premiumtimes: "Premium Times",
  vanguard: "Vanguard",
  sahara: "Sahara Reporters",
};

const SUGGESTIONS = [
  "What does Akinnaso say about restructuring Nigeria?",
  "Summarise his views on Nigerian university education.",
  "What has he written about Yoruba language and culture?",
  "How does he assess President Tinubu's reforms?",
];

function AskPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setError(null);
    const userMsg: Msg = { role: "user", content: q };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const resp = await fetch("/api/public/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!resp.ok || !resp.body) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j.error || `Request failed (${resp.status})`);
      }

      // Add an empty assistant placeholder we'll progressively fill.
      setMessages((prev) => [...prev, { role: "assistant", content: "", sources: [] }]);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      let sources: Source[] = [];
      let done = false;

      const apply = () => {
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant") {
            copy[copy.length - 1] = { ...last, content: assistantText, sources };
          }
          return copy;
        });
      };

      while (!done) {
        const { done: rDone, value } = await reader.read();
        if (rDone) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(payload);
            if (parsed.sources) {
              sources = parsed.sources as Source[];
              apply();
              continue;
            }
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              apply();
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
      requestAnimationFrame(() =>
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }),
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="bg-hero pt-36 pb-12">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Ask the archive</p>
          <h1 className="mt-4 font-display text-5xl leading-tight md:text-6xl">
            Ask <span className="text-gradient">Prof. Akinnaso.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-muted-foreground">
            An AI guide grounded in nearly two hundred of his published essays. Ask about democracy,
            governance, education, language, Yoruba culture — and read the answer with citations
            back to the original columns.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="glass rounded-3xl p-4 md:p-6">
          <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto px-2 py-4">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Try one of these to get started:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-left text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((m, i) => (
                  <div key={i} className={m.role === "user" ? "text-right" : ""}>
                    <div
                      className={
                        m.role === "user"
                          ? "inline-block max-w-[85%] rounded-2xl bg-primary px-4 py-2.5 text-left text-sm text-primary-foreground"
                          : "max-w-none"
                      }
                    >
                      {m.role === "assistant" ? (
                        <>
                          <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-headings:font-display">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {m.content || "_Thinking…_"}
                            </ReactMarkdown>
                          </div>
                          {m.sources && m.sources.length > 0 && (
                            <div className="mt-4 border-t border-white/10 pt-4">
                              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                                Sources
                              </p>
                              <ol className="mt-2 space-y-1.5 text-sm">
                                {m.sources.map((s, idx) => (
                                  <li key={s.id} className="text-muted-foreground">
                                    <span className="text-primary">[{idx + 1}]</span>{" "}
                                    <Link
                                      to="/writings/$slug"
                                      params={{ slug: s.slug }}
                                      className="text-foreground hover:text-primary"
                                    >
                                      {s.title}
                                    </Link>
                                    <span className="ml-2 text-xs">
                                      {SOURCE_LABEL[s.source] || s.source}
                                      {s.published_at &&
                                        ` · ${new Date(s.published_at).getFullYear()}`}
                                    </span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </>
                      ) : (
                        <span>{m.content}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {error && (
              <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
                {error}
              </p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mt-4 flex gap-2 border-t border-white/10 pt-4"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about his writings…"
              disabled={busy}
              className="bg-white/5 border-white/10"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition disabled:opacity-50"
            >
              {busy ? "…" : "Ask"}
            </button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            Answers are AI-generated from his archived essays and may be imperfect. Always check the
            cited source for the original wording.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
