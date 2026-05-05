import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, Plus, Send, MessageSquare, Trash2, BookOpen, GraduationCap, Globe2, Languages } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

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

type Conversation = {
  id: string;
  title: string;
  updatedAt: number;
  messages: Msg[];
};

const SOURCE_LABEL: Record<string, string> = {
  thenation: "The Nation",
  punch: "The Punch",
  premiumtimes: "Premium Times",
  vanguard: "Vanguard",
  sahara: "Sahara Reporters",
};

const SUGGESTION_GROUPS: { label: string; icon: typeof BookOpen; prompts: string[] }[] = [
  {
    label: "Politics & Governance",
    icon: Globe2,
    prompts: [
      "What does Akinnaso say about restructuring Nigeria?",
      "How does he assess President Tinubu's reforms?",
      "What is his view on democracy in Nigeria?",
    ],
  },
  {
    label: "Education",
    icon: GraduationCap,
    prompts: [
      "Summarise his views on Nigerian university education.",
      "What has he written about literacy and schooling?",
      "How should Nigeria reform basic education?",
    ],
  },
  {
    label: "Language & Culture",
    icon: Languages,
    prompts: [
      "What has he written about Yoruba language and culture?",
      "Why does he advocate mother-tongue education?",
      "What is his work on Yoruba names and identity?",
    ],
  },
  {
    label: "Society",
    icon: BookOpen,
    prompts: [
      "What does he say about religion in public life?",
      "How does he describe Nigeria's elite class?",
      "What are his thoughts on ethnicity and nationhood?",
    ],
  },
];

const STORAGE_KEY = "ask-conversations-v1";

function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveConversations(items: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 30)));
  } catch {
    /* ignore quota */
  }
}

function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/** Renders assistant markdown with inline [n] citations linked to source list */
function AnswerMarkdown({ content, sources }: { content: string; sources: Source[] }) {
  // Replace [1], [2] etc. with anchor markers; ReactMarkdown will render them as links
  const processed = useMemo(() => {
    if (!sources?.length) return content;
    return content.replace(/\[(\d+)\]/g, (m, n) => {
      const idx = parseInt(n, 10);
      if (idx >= 1 && idx <= sources.length) return `[\\[${idx}\\]](#src-${idx})`;
      return m;
    });
  }, [content, sources]);

  return (
    <div className="prose prose-invert prose-sm max-w-none prose-p:my-2.5 prose-headings:font-display prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{processed || "_Thinking…_"}</ReactMarkdown>
    </div>
  );
}

function AskPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setConversations(loadConversations());
  }, []);

  const active = conversations.find((c) => c.id === activeId) || null;
  const messages = active?.messages || [];

  const persist = (next: Conversation[]) => {
    setConversations(next);
    saveConversations(next);
  };

  const startNew = () => {
    setActiveId(null);
    setInput("");
    setError(null);
    setSidebarOpen(false);
  };

  const removeConversation = (id: string) => {
    const next = conversations.filter((c) => c.id !== id);
    persist(next);
    if (activeId === id) setActiveId(null);
  };

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, [input]);

  // Scroll to bottom when messages change
  useEffect(() => {
    requestAnimationFrame(() =>
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }),
    );
  }, [messages.length, busy]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setError(null);

    const userMsg: Msg = { role: "user", content: q };

    let convoId = activeId;
    let baseMessages: Msg[] = [];

    if (!convoId) {
      convoId = newId();
      const newConvo: Conversation = {
        id: convoId,
        title: q.slice(0, 60),
        updatedAt: Date.now(),
        messages: [userMsg],
      };
      const next = [newConvo, ...conversations];
      persist(next);
      setActiveId(convoId);
      baseMessages = [userMsg];
    } else {
      baseMessages = [...messages, userMsg];
      const next = conversations.map((c) =>
        c.id === convoId ? { ...c, messages: baseMessages, updatedAt: Date.now() } : c,
      );
      persist(next);
    }

    setInput("");
    setBusy(true);

    try {
      const resp = await fetch("/api/public/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: baseMessages }),
      });

      if (!resp.ok || !resp.body) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j.error || `Request failed (${resp.status})`);
      }

      const placeholder: Msg = { role: "assistant", content: "", sources: [] };
      const startMessages = [...baseMessages, placeholder];
      setConversations((prev) => {
        const next = prev.map((c) =>
          c.id === convoId ? { ...c, messages: startMessages, updatedAt: Date.now() } : c,
        );
        saveConversations(next);
        return next;
      });

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      let sources: Source[] = [];
      let done = false;

      const apply = () => {
        setConversations((prev) => {
          const next = prev.map((c) => {
            if (c.id !== convoId) return c;
            const msgs = [...c.messages];
            const last = msgs[msgs.length - 1];
            if (last?.role === "assistant") {
              msgs[msgs.length - 1] = { ...last, content: assistantText, sources };
            }
            return { ...c, messages: msgs, updatedAt: Date.now() };
          });
          return next;
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

      // Persist final state
      setConversations((prev) => {
        saveConversations(prev);
        return prev;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="pt-28 pb-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 md:px-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar — conversations */}
          <aside
            className={`${sidebarOpen ? "block" : "hidden"} lg:block`}
          >
            <div className="glass sticky top-28 rounded-2xl p-4">
              <button
                onClick={startNew}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                New chat
              </button>

              <div className="mt-5">
                <p className="px-2 text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                  History
                </p>
                <div className="mt-2 max-h-[60vh] space-y-1 overflow-y-auto pr-1">
                  {conversations.length === 0 ? (
                    <p className="px-2 py-3 text-xs text-muted-foreground/70">
                      No past chats yet.
                    </p>
                  ) : (
                    conversations.map((c) => (
                      <div
                        key={c.id}
                        className={`group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition ${
                          c.id === activeId
                            ? "bg-white/10 text-foreground"
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                        }`}
                      >
                        <button
                          onClick={() => {
                            setActiveId(c.id);
                            setSidebarOpen(false);
                          }}
                          className="flex flex-1 items-center gap-2 truncate text-left"
                          title={c.title}
                        >
                          <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                          <span className="truncate">{c.title}</span>
                        </button>
                        <button
                          onClick={() => removeConversation(c.id)}
                          className="opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                          aria-label="Delete chat"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Main chat area */}
          <main>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Ask the archive
                </p>
                <h1 className="mt-2 font-display text-4xl leading-tight md:text-5xl">
                  Ask <span className="text-gradient">Prof. Akinnaso</span>
                </h1>
              </div>
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground lg:hidden"
              >
                {sidebarOpen ? "Hide" : "History"}
              </button>
            </div>

            <div className="glass overflow-hidden rounded-3xl">
              <div ref={scrollRef} className="max-h-[62vh] overflow-y-auto px-4 py-6 md:px-6">
                {messages.length === 0 ? (
                  <EmptyState onPick={send} />
                ) : (
                  <div className="space-y-6">
                    {messages.map((m, i) => (
                      <MessageBubble key={i} msg={m} />
                    ))}
                    {busy && messages[messages.length - 1]?.role === "user" && (
                      <ThinkingBubble />
                    )}
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
                className="border-t border-white/10 bg-white/[0.02] p-3 md:p-4"
              >
                <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-background/40 px-3 py-2 focus-within:border-primary/50">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send(input);
                      }
                    }}
                    placeholder="Ask anything about his writings…"
                    disabled={busy}
                    rows={1}
                    className="flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={busy || !input.trim()}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition disabled:opacity-40"
                    aria-label="Send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 px-1 text-xs text-muted-foreground">
                  AI-generated from his archived essays. Always check cited sources.
                </p>
              </form>
            </div>
          </main>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-sm">Try one of these to get started — or ask your own question.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {SUGGESTION_GROUPS.map((g) => {
          const Icon = g.icon;
          return (
            <div
              key={g.label}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {g.label}
                </p>
              </div>
              <ul className="space-y-1.5">
                {g.prompts.map((p) => (
                  <li key={p}>
                    <button
                      onClick={() => onPick(p)}
                      className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-foreground/80 transition hover:bg-white/5 hover:text-foreground"
                    >
                      {p}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {msg.content}
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
          You
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 font-display text-xs font-semibold text-primary">
        FN
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="rounded-2xl rounded-tl-sm border border-white/5 bg-white/[0.03] px-4 py-3">
          <AnswerMarkdown content={msg.content} sources={msg.sources || []} />
          {msg.sources && msg.sources.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-3">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Sources</p>
              <ol className="mt-2 space-y-1.5 text-sm">
                {msg.sources.map((s, idx) => (
                  <li key={s.id} id={`src-${idx + 1}`} className="text-muted-foreground">
                    <span className="font-mono text-xs text-primary">[{idx + 1}]</span>{" "}
                    <Link
                      to="/writings/$slug"
                      params={{ slug: s.slug }}
                      className="text-foreground hover:text-primary"
                    >
                      {s.title}
                    </Link>
                    <span className="ml-2 text-xs">
                      {SOURCE_LABEL[s.source] || s.source}
                      {s.published_at && ` · ${new Date(s.published_at).getFullYear()}`}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 font-display text-xs font-semibold text-primary">
        FN
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-white/5 bg-white/[0.03] px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
      </div>
    </div>
  );
}
