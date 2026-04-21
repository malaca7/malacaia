import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/malaca/Logo";
import { toast } from "@/hooks/use-toast";

export default function Auth() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/app" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
        toast({ title: "Conta criada", description: "Você já pode entrar." });
        nav("/app");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav("/app");
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-border lg:block">
        <div className="absolute inset-0 grid-noise opacity-40" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo />
          <div className="space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan/80">Manifesto</p>
            <h2 className="max-w-md font-display text-4xl leading-[1.05] tracking-tight">
              Uma IA <em className="text-neon-cyan not-italic">silenciosa</em>,<br/> precisa, e que <em className="not-italic italic">lembra</em> de você.
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              MALACA é um pair programmer editorial: minimalismo cirúrgico, foco no código, sem ruído.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-6">
          <div className="lg:hidden"><Logo /></div>
          <div>
            <h1 className="font-display text-3xl tracking-tight">{mode === "signin" ? "Entrar" : "Criar conta"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Acesse seu workspace.</p>
          </div>
          <div className="space-y-3">
            <Input type="email" placeholder="email@dominio.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 border-border/70 bg-surface" />
            <Input type="password" placeholder="Senha (mín. 6)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-11 border-border/70 bg-surface" />
          </div>
          <Button type="submit" disabled={busy} className="h-11 w-full bg-foreground text-background hover:bg-foreground/90">
            {busy ? "..." : mode === "signin" ? "Entrar" : "Criar conta"}
          </Button>
          <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="w-full text-center text-xs text-muted-foreground hover:text-foreground">
            {mode === "signin" ? "Não tem conta? Criar uma." : "Já tem conta? Entrar."}
          </button>
        </form>
      </div>
    </div>
  );
}