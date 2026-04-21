import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LANGUAGES, MODES } from "@/lib/languages";
import { Paperclip, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onSend: (text: string, opts: { language: string; mode: string; attachment?: { name: string; content: string } }) => void;
  disabled?: boolean;
  defaultLanguage?: string;
};

export const Composer = ({ onSend, disabled, defaultLanguage = "typescript" }: Props) => {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState(defaultLanguage);
  const [mode, setMode] = useState<string>("chat");
  const [attachment, setAttachment] = useState<{ name: string; content: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim(), { language, mode, attachment: attachment ?? undefined });
    setText("");
    setAttachment(null);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 200_000) return alert("Arquivo muito grande (limite 200KB para esta versão).");
    const content = await f.text();
    setAttachment({ name: f.name, content });
  };

  return (
    <div className="glass rounded-lg p-3 shadow-[var(--shadow-soft)]">
      {attachment && (
        <div className="mb-2 flex items-center justify-between rounded border border-border/60 bg-surface px-3 py-1.5 font-mono text-xs">
          <span className="truncate">{attachment.name} · {attachment.content.length} chars</span>
          <button onClick={() => setAttachment(null)} className="text-muted-foreground hover:text-foreground">×</button>
        </div>
      )}
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); }
        }}
        placeholder="Pergunte qualquer coisa sobre código…  ⌘/Ctrl + Enter para enviar"
        className="min-h-[88px] resize-none border-0 bg-transparent text-[15px] placeholder:text-muted-foreground/70 focus-visible:ring-0"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Select value={mode} onValueChange={setMode}>
          <SelectTrigger className="h-8 w-[130px] border-border/60 bg-surface text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{MODES.map(m => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="h-8 w-[150px] border-border/60 bg-surface text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{LANGUAGES.map(l => <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>)}</SelectContent>
        </Select>
        <input ref={fileRef} type="file" accept=".txt,.md,.js,.ts,.tsx,.jsx,.py,.java,.cs,.go,.rs,.php,.sql,.rb,.kt,.swift,.cpp,.c,.h,.html,.css,.json,.yml,.yaml" className="hidden" onChange={onFile} />
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => fileRef.current?.click()}>
          <Paperclip className="h-3.5 w-3.5" /> Anexar
        </Button>
        <div className="flex-1" />
        <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:flex">
          <Sparkles className="h-3 w-3 text-neon-cyan" /> Lovable AI
        </span>
        <Button onClick={submit} disabled={disabled || !text.trim()} className={cn("h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90")}>
          <Send className="h-3.5 w-3.5" /> Enviar
        </Button>
      </div>
    </div>
  );
};