import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODE_PROMPTS: Record<string, string> = {
  generate: "Modo: GERAR CÓDIGO. Produza código limpo, idiomático e pronto para uso.",
  explain: "Modo: EXPLICAR CÓDIGO. Explique passo a passo, claro e técnico.",
  refactor: "Modo: REFATORAR. Melhore legibilidade, performance e boas práticas, mostrando o antes/depois quando útil.",
  fix: "Modo: CORRIGIR BUGS. Identifique a causa raiz e proponha correção mínima e segura.",
  chat: "Modo: PAIR PROGRAMMER. Conversa técnica objetiva.",
};

function buildSystem(opts: { language?: string; mode?: string; memories?: string[]; skill?: string }) {
  const { language, mode, memories = [], skill } = opts;
  return [
    "Você é MALACA, uma IA sênior de programação. Tom: técnico, objetivo, elegante.",
    "Sempre que possível, estruture a resposta em: **Solução**, **Explicação**, **Melhorias possíveis**, **Riscos/Limitações**.",
    "Use blocos de código markdown com a linguagem correta. Português do Brasil por padrão.",
    skill ? `Nível do usuário: ${skill}.` : "",
    language ? `Linguagem preferida do contexto: ${language}.` : "",
    mode && MODE_PROMPTS[mode] ? MODE_PROMPTS[mode] : MODE_PROMPTS.chat,
    memories.length ? `Memórias do usuário (use quando relevante):\n- ${memories.join("\n- ")}` : "",
  ].filter(Boolean).join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language, mode, memories, skill, model } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY ausente");

    const system = buildSystem({ language, mode, memories, skill });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "google/gemini-3-flash-preview",
        stream: true,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de requisições atingido. Aguarde um instante." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos esgotados no workspace Lovable AI." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});