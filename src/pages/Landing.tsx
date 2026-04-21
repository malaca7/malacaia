import { Link } from "react-router-dom";
import { Logo } from "@/components/malaca/Logo";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.jpg";
import { ArrowUpRight, Brain, Code2, FolderKanban, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-8 text-xs font-mono uppercase tracking-wider text-muted-foreground md:flex">
            <a href="#manifesto" className="hover:text-foreground">Manifesto</a>
            <a href="#modules" className="hover:text-foreground">Módulos</a>
            <a href="#memory" className="hover:text-foreground">Memória</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost" size="sm" className="text-xs">Entrar</Button></Link>
            <Link to="/app"><Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 text-xs gap-1.5">
              Abrir Malaca <ArrowUpRight className="h-3 w-3" />
            </Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 grid-noise opacity-30" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-12 lg:py-32">
          <div className="lg:col-span-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan/80 animate-fade-up">
              Vol. 01 · Ed. 2026 · IA Editorial
            </p>
            <h1 className="mt-6 font-display text-[64px] leading-[0.95] tracking-tight sm:text-[88px] lg:text-[112px] animate-fade-up">
              Código,<br />
              <em className="not-italic text-muted-foreground">com</em>{" "}
              <span className="relative inline-block">
                discernimento
                <span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent" />
              </span>.
            </h1>
            <p className="mt-8 max-w-xl text-base text-muted-foreground animate-fade-up">
              MALACA é uma inteligência sênior para programação. Gera, refatora, explica e corrige —
              sempre vinculada ao contexto do seu projeto e à memória do que importa pra você.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3 animate-fade-up">
              <Link to="/auth">
                <Button size="lg" className="h-12 gap-2 bg-foreground px-6 text-background hover:bg-foreground/90">
                  Começar agora <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#modules">
                <Button size="lg" variant="ghost" className="h-12 px-6 text-sm">Conhecer os módulos</Button>
              </a>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground animate-fade-up">
              <span>· TypeScript</span><span>· Python</span><span>· Go</span><span>· Rust</span><span>· Java</span><span>· SQL</span><span>· +9</span>
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <div className="hairline relative aspect-[4/5] overflow-hidden rounded-md">
              <img src={hero} alt="MALACA" className="h-full w-full object-cover" width={1600} height={1200} />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="glass rounded p-3 font-mono text-[11px]">
                  <span className="text-neon-cyan">malaca › </span>
                  <span className="text-foreground">refactor src/auth.ts --idiomatic</span>
                  <span className="ml-1 inline-block h-3 w-1.5 animate-pulse-dot bg-neon-cyan align-middle" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section id="manifesto" className="border-y border-border/60 py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan/80">§ 01 — Manifesto</p>
          </div>
          <h2 className="font-display text-3xl leading-tight tracking-tight sm:text-5xl lg:col-span-8">
            Acreditamos que ferramentas de IA para devs deveriam parecer
            <em className="not-italic text-neon-cyan"> revistas de design</em>, não dashboards corporativos.
            Espaço, tipografia e silêncio — para o código falar mais alto.
          </h2>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan/80">§ 02 — Módulos</p>
          <h3 className="mt-4 max-w-2xl font-display text-4xl tracking-tight sm:text-5xl">Quatro pilares, uma única experiência.</h3>

          <div className="mt-14 grid gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-4 overflow-hidden rounded-md">
            {[
              { icon: Code2, title: "Pair Programmer", desc: "Gere, explique, refatore e corrija em 14+ linguagens, com respostas estruturadas." },
              { icon: FolderKanban, title: "Sessões por Projeto", desc: "Cada conversa fica vinculada a um contexto de desenvolvimento específico." },
              { icon: Brain, title: "Memória Persistente", desc: "Lembra suas stacks, padrões e estilo. Tudo editável e auditável por você." },
              { icon: Sparkles, title: "Snippets Curados", desc: "Salve, marque como favorito e reaproveite trechos diretamente do chat." },
            ].map((m) => (
              <div key={m.title} className="bg-background p-7 transition hover:bg-surface">
                <m.icon className="h-5 w-5 text-neon-cyan" />
                <h4 className="mt-5 font-display text-xl tracking-tight">{m.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Memory */}
      <section id="memory" className="border-t border-border/60 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan/80">§ 03 — Memória</p>
            <h3 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">Aprende com você. Sem mistérios.</h3>
            <p className="mt-6 text-muted-foreground">
              Personalização baseada em memória, perfil e contexto — não retreinamento de modelo. Toda memória é
              editável, ativável e visível em um painel simples.
            </p>
          </div>
          <div className="lg:col-span-7">
            <div className="hairline rounded-md p-6 font-mono text-xs">
              <div className="mb-3 text-[10px] uppercase tracking-wider text-muted-foreground">Memórias ativas</div>
              {[
                ["stack favorita", "TypeScript + Vite + Tailwind"],
                ["estilo de resposta", "objetivo, com exemplos curtos"],
                ["padrão de arquitetura", "componentes pequenos, hooks dedicados"],
                ["banco preferido", "Postgres com RLS"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between border-t border-border/50 py-2.5 first:border-t-0 first:pt-0">
                  <span className="text-neon-cyan/90 uppercase">{k}</span>
                  <span className="text-foreground">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h3 className="font-display text-5xl tracking-tight sm:text-6xl">Comece agora.</h3>
          <p className="mt-4 text-muted-foreground">Crie sua conta em segundos. Sem cartão.</p>
          <Link to="/auth" className="mt-8 inline-block">
            <Button size="lg" className="h-12 gap-2 bg-foreground px-8 text-background hover:bg-foreground/90">
              Abrir Malaca <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <Logo showWord={false} />
          <span>© 2026 MALACA · Editorial AI</span>
        </div>
      </footer>
    </div>
  );
}