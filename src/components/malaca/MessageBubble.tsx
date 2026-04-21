import { Markdown } from "./Markdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThumbsDown, ThumbsUp, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type ChatMsg = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  language?: string;
  mode?: string;
  streaming?: boolean;
};

export const MessageBubble = ({ msg, userId }: { msg: ChatMsg; userId: string }) => {
  const isUser = msg.role === "user";
  const vote = async (v: "up" | "down") => {
    if (!msg.id) return;
    await supabase.from("message_feedback").insert({ user_id: userId, message_id: msg.id, vote: v });
    toast({ title: v === "up" ? "Marcado como útil" : "Feedback registrado" });
  };
  const saveAsMemory = async () => {
    const value = prompt("O que a MALACA deve lembrar sobre você?", msg.content.slice(0, 120));
    if (!value) return;
    await supabase.from("user_memory").insert({ user_id: userId, key: "preferencia", value, category: "preferencia" });
    toast({ title: "Memória salva" });
  };

  return (
    <div className={cn("group animate-fade-up flex gap-4 py-5", isUser ? "" : "")}>
      <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border text-[10px] font-mono uppercase tracking-wider",
        isUser ? "border-border bg-surface text-muted-foreground" : "border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan")}>
        {isUser ? "VC" : "M"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          <span>{isUser ? "Você" : "Malaca"}</span>
          {msg.language && <span className="text-neon-cyan/80">· {msg.language}</span>}
          {msg.mode && msg.mode !== "chat" && <span>· {msg.mode}</span>}
          {msg.streaming && <span className="ml-1 inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-neon-cyan" />}
        </div>
        <Markdown>{msg.content || (msg.streaming ? "…" : "")}</Markdown>
        {!isUser && msg.id && !msg.streaming && (
          <div className="mt-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
            <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => vote("up")}><ThumbsUp className="h-3 w-3" /></Button>
            <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => vote("down")}><ThumbsDown className="h-3 w-3" /></Button>
            <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={saveAsMemory}><Save className="h-3 w-3" /> Lembrar</Button>
          </div>
        )}
      </div>
    </div>
  );
};