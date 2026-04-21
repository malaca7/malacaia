import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";

export const Markdown = ({ children }: { children: string }) => (
  <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-display prose-headings:tracking-tight prose-strong:text-foreground prose-a:text-neon-cyan prose-code:font-mono prose-code:text-[0.875em] prose-code:before:content-none prose-code:after:content-none">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          if (inline) {
            return (
              <code className="rounded bg-surface px-1.5 py-0.5 text-[0.875em] text-neon-cyan/90" {...props}>
                {children}
              </code>
            );
          }
          return <CodeBlock language={match?.[1] || "text"} value={String(children).replace(/\n$/, "")} />;
        },
      }}
    >
      {children}
    </ReactMarkdown>
  </div>
);