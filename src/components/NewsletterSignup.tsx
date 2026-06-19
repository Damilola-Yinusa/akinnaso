import { useState } from "react";
import { subscribeNewsletter } from "@/server/forms.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setState("err");
      setMsg("Please enter a valid email address.");
      return;
    }
    setState("loading");
    try {
      const result = await subscribeNewsletter({
        data: { email: email.trim(), name: name.trim() },
      });
      setState("ok");
      setMsg(
        result.alreadySubscribed
          ? "You're already on the list. Thank you."
          : "Thank you. You'll hear from us when new pieces are added.",
      );
      setEmail("");
      setName("");
    } catch (err) {
      setState("err");
      setMsg(err instanceof Error ? err.message : "Could not subscribe.");
    }
  };

  return (
    <form onSubmit={submit} className="glass rounded-2xl p-6">
      <h3 className="font-display text-xl">Stay in touch</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Get occasional notes when new essays, tributes or scholarship are added to the archive.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (optional)"
          maxLength={100}
          className="bg-white/5 border-white/10"
        />
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          maxLength={254}
          className="bg-white/5 border-white/10"
        />
        <Button type="submit" disabled={state === "loading"}>
          {state === "loading" ? "Subscribing…" : "Subscribe"}
        </Button>
      </div>
      {msg && (
        <p className={`mt-3 text-sm ${state === "err" ? "text-destructive" : "text-primary"}`}>{msg}</p>
      )}
    </form>
  );
}
