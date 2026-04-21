import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/malaca/Sidebar";
import { Composer } from "@/components/malaca/Composer";
import { MessageBubble, ChatMsg } from "@/components/malaca/MessageBubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

export default function Chat() {
  const { user, loading } = useAuth();
  const [convId, setConvId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!convId) { setMessages([]); return; }
    (async () => {
      const { data } = await supabase
        .from("messages").select("id,role,content,language,mode")
        .eq("conversation_id", convId).order("created_at", { ascending: true });
      setMessages((data as ChatMsg[]) || []);
    })();
  }, [convId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (loading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Carregando…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  const ensureConversation = async (firstMsg: string): Promise<string> => {
    if (convId) return convId;
    const title = firstMsg.slice(0, 60);
    const { data, error } = await supabase
      .from("conversations").insert({ user_id: user.id, project_id: projectId, title }).select().single();
    if (error) throw error;
    setConvId(data.id);
    return data.id;
  };

  const send = async (text: string, opts: { language: string; mode: string; attachment?: { name: string; content: string } }) => {
    try {
      setStreaming(true);
      const fullText = opts.attachment
        ? `${text}\n\n--- Arquivo: ${opts.attachment.name} ---\n\`\`\`${opts.language}\n${opts.attachment.content}\n\`\`\``
        : text;

      const cId = await ensureConversation(text);

      // persist user message
      const { data: userMsg } = await supabase
        .from("messages")
        .insert({ conversation_id: cId, user_id: user.id, role: "user", content: fullText, language: opts.language, mode: opts.mode })
        .select().single();

      const localMsgs: ChatMsg[] = [...messages, { id: userMsg?.id, role: "user", content: fullText, language: opts.language, mode: opts.mode }];
      setMessages([...localMsgs, { role: "assistant", content: "", streaming: true, language: opts.language, mode: opts.mode }]);

      // load active memories
      const { data: mems } = await supabase.from("user_memory").select("key,value").eq("is_active", true).limit(20);
      const memories = (mems || []).map((m) => `${m.key}: ${m.value}`);

      const apiMessages = localMsgs.map((m) => ({ role: m.role, content: m.content }));

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages, language: opts.language, mode: opts.mode, memories }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast({ title: "Limite atingido", description: "Aguarde alguns instantes.", variant: "destructive" });
        else if (resp.status === 402) toast({ title: "Créditos esgotados", description: "Adicione créditos no workspace.", variant: "destructive" });
        else toast({ title: "Erro", description: "Falha ao chamar a IA.", variant: "destructive" });
        setMessages((m) => m.slice(0, -1));
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let assistantText = "";
      let done = false;

      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let i: number;
        while ((i = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, i); buf = buf.slice(i + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(json);
            const delta = p.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { ...copy[copy.length - 1], content: assistantText, streaming: true };
                return copy;
              });
            }
          } catch {
            buf = line + "\n" + buf; break;
          }
        }
      }

      // persist assistant message
      const { data: aMsg } = await supabase
        .from("messages")
        .insert({ conversation_id: cId, user_id: user.id, role: "assistant", content: assistantText, language: opts.language, mode: opts.mode })
        .select().single();

      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { id: aMsg?.id, role: "assistant", content: assistantText, language: opts.language, mode: opts.mode };
        return copy;
      });

      // bump conversation updated_at
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", cId);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar
        activeConvId={convId}
        onSelectConv={setConvId}
        onNewConv={() => { setConvId(null); setMessages([]); }}
        projectId={projectId}
        onSelectProject={setProjectId}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border/70 px-6 py-3">
          <div className="flex items-baseline gap-3">
            <h1 className="font-display text-lg tracking-tight">{convId ? "Sessão" : "Nova sessão"}</h1>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {projectId ? "vinculada a projeto" : "sem projeto"}
            </span>
          </div>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3 w-3 text-neon-cyan" /> Lovable AI · gemini-3-flash
          </span>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6">
          <div className="mx-auto max-w-3xl">
            {messages.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="divide-y divide-border/50 py-6">
                {messages.map((m, i) => <MessageBubble key={m.id || i} msg={m} userId={user.id} />)}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border/70 px-6 py-4">
          <div className="mx-auto max-w-3xl">
            <Composer onSend={send} disabled={streaming} />
          </div>
        </div>
      </main>
    </div>
  );
}

const EmptyState = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan/80">Malaca · Pair Programmer</p>
    <h2 className="mt-3 font-display text-4xl tracking-tight">Como podemos construir hoje?</h2>
    <p className="mt-3 max-w-md text-sm text-muted-foreground">
      Geração, refatoração, debugging e arquitetura — em qualquer linguagem.
      Cada conversa pode ser vinculada a um projeto.
    </p>
    <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {[
        "Crie um endpoint REST em Go com paginação",
        "Explique este snippet TypeScript linha a linha",
        "Refatore esta função Python para ser mais idiomática",
        "Corrija o bug de race condition neste código",
      ].map((s) => (
        <div key={s} className="hairline rounded p-3 text-left text-sm text-muted-foreground">{s}</div>
      ))}
    </div>
  </div>
);