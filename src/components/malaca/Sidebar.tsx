import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, FolderKanban, Sparkles, Brain, Plus, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type Conv = { id: string; title: string; project_id: string | null; updated_at: string };
type Project = { id: string; name: string; primary_language: string | null };
type Snippet = { id: string; title: string; language: string; is_favorite: boolean };
type Memory = { id: string; key: string; value: string; is_active: boolean };

type Tab = "history" | "projects" | "snippets" | "memory";

export const Sidebar = ({
  activeConvId, onSelectConv, onNewConv, projectId, onSelectProject,
}: {
  activeConvId: string | null;
  onSelectConv: (id: string) => void;
  onNewConv: () => void;
  projectId: string | null;
  onSelectProject: (id: string | null) => void;
}) => {
  const { signOut, user } = useAuth();
  const [tab, setTab] = useState<Tab>("history");
  const [convs, setConvs] = useState<Conv[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);

  const refresh = async () => {
    const [c, p, s, m] = await Promise.all([
      supabase.from("conversations").select("id,title,project_id,updated_at").order("updated_at", { ascending: false }).limit(50),
      supabase.from("projects").select("id,name,primary_language").order("updated_at", { ascending: false }).limit(50),
      supabase.from("code_snippets").select("id,title,language,is_favorite").order("created_at", { ascending: false }).limit(50),
      supabase.from("user_memory").select("id,key,value,is_active").order("created_at", { ascending: false }).limit(50),
    ]);
    setConvs((c.data as Conv[]) || []);
    setProjects((p.data as Project[]) || []);
    setSnippets((s.data as Snippet[]) || []);
    setMemories((m.data as Memory[]) || []);
  };

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel("sidebar")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_memory" }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: "history", icon: MessageSquare, label: "Histórico" },
    { id: "projects", icon: FolderKanban, label: "Projetos" },
    { id: "snippets", icon: Sparkles, label: "Snippets" },
    { id: "memory", icon: Brain, label: "Memórias" },
  ];

  const newProject = async () => {
    const name = prompt("Nome do projeto");
    if (!name) return;
    const { data, error } = await supabase.from("projects").insert({ name, user_id: user!.id }).select().single();
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    onSelectProject(data.id);
    refresh();
  };

  const toggleMemory = async (m: Memory) => {
    await supabase.from("user_memory").update({ is_active: !m.is_active }).eq("id", m.id);
    refresh();
  };

  return (
    <aside className="flex h-full w-[280px] flex-col border-r border-border bg-[hsl(0_0%_3.5%)]">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3.5">
        <Logo />
      </div>

      <div className="flex items-center gap-1 border-b border-border/70 px-2 py-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded px-1 py-1.5 text-[10px] uppercase tracking-wider transition",
              tab === t.id ? "bg-surface text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
            title={t.label}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-3 py-2">
        {tab === "history" && <Button size="sm" variant="ghost" className="h-7 w-full justify-start gap-1.5 text-xs" onClick={onNewConv}><Plus className="h-3.5 w-3.5"/> Nova conversa</Button>}
        {tab === "projects" && <Button size="sm" variant="ghost" className="h-7 w-full justify-start gap-1.5 text-xs" onClick={newProject}><Plus className="h-3.5 w-3.5"/> Novo projeto</Button>}
        {tab === "snippets" && <span className="px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Snippets salvos</span>}
        {tab === "memory" && <span className="px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Memórias do usuário</span>}
      </div>

      <ScrollArea className="flex-1 px-2">
        {tab === "history" && (
          <ul className="space-y-0.5 pb-3">
            {convs.length === 0 && <p className="px-3 py-4 text-xs text-muted-foreground">Nenhuma conversa ainda.</p>}
            {convs.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => onSelectConv(c.id)}
                  className={cn(
                    "block w-full truncate rounded px-3 py-2 text-left text-sm transition",
                    activeConvId === c.id ? "bg-surface text-foreground" : "text-muted-foreground hover:bg-surface/60 hover:text-foreground",
                  )}
                >
                  {c.title}
                </button>
              </li>
            ))}
          </ul>
        )}
        {tab === "projects" && (
          <ul className="space-y-0.5 pb-3">
            <li>
              <button onClick={() => onSelectProject(null)} className={cn("block w-full truncate rounded px-3 py-2 text-left text-sm", !projectId ? "bg-surface text-foreground" : "text-muted-foreground hover:text-foreground")}>
                — Sem projeto
              </button>
            </li>
            {projects.map((p) => (
              <li key={p.id}>
                <button onClick={() => onSelectProject(p.id)} className={cn("block w-full truncate rounded px-3 py-2 text-left text-sm", projectId === p.id ? "bg-surface text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  <span>{p.name}</span>
                  {p.primary_language && <span className="ml-2 font-mono text-[10px] uppercase text-neon-cyan/80">{p.primary_language}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
        {tab === "snippets" && (
          <ul className="space-y-0.5 pb-3">
            {snippets.length === 0 && <p className="px-3 py-4 text-xs text-muted-foreground">Salve trechos de código a partir das respostas.</p>}
            {snippets.map((s) => (
              <li key={s.id} className="rounded px-3 py-2 text-sm text-muted-foreground hover:bg-surface/60">
                <div className="truncate text-foreground">{s.title}</div>
                <div className="font-mono text-[10px] uppercase text-neon-cyan/80">{s.language}</div>
              </li>
            ))}
          </ul>
        )}
        {tab === "memory" && (
          <ul className="space-y-1 pb-3">
            {memories.length === 0 && <p className="px-3 py-4 text-xs text-muted-foreground">Nenhuma memória registrada.</p>}
            {memories.map((m) => (
              <li key={m.id} className="rounded border border-border/60 bg-surface/40 p-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono uppercase text-[10px] text-neon-cyan/80">{m.key}</span>
                  <button onClick={() => toggleMemory(m)} className={cn("rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider", m.is_active ? "bg-neon-cyan/15 text-neon-cyan" : "bg-muted text-muted-foreground")}>
                    {m.is_active ? "Ativa" : "Inativa"}
                  </button>
                </div>
                <div className="mt-1 text-muted-foreground">{m.value}</div>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>

      <div className="border-t border-border/70 px-3 py-2.5">
        <button onClick={signOut} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-muted-foreground hover:bg-surface hover:text-foreground">
          <LogOut className="h-3.5 w-3.5" /> Sair
        </button>
      </div>
    </aside>
  );
};