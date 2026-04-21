import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const CodeBlock = ({ language, value }: { language: string; value: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="group relative my-4 overflow-hidden rounded-md border border-border bg-[hsl(0_0%_5%)]">
      <div className="flex items-center justify-between border-b border-border/60 bg-surface px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{language || "code"}</span>
        <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2 text-xs" onClick={copy}>
          {copied ? <Check className="h-3 w-3 text-neon-cyan" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: "16px", background: "transparent", fontSize: 13 }}
        codeTagProps={{ style: { fontFamily: "var(--font-mono)" } }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};