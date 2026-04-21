import { cn } from "@/lib/utils";

export const Logo = ({ className, showWord = true }: { className?: string; showWord?: boolean }) => (
  <div className={cn("flex items-center gap-2.5 select-none", className)}>
    <div className="relative h-7 w-7">
      <div className="absolute inset-0 rounded-sm border border-neon-cyan/70 shadow-[0_0_18px_-2px_hsl(var(--neon-cyan)/0.6)]" />
      <div className="absolute inset-[5px] rounded-[2px] bg-neon-cyan/80" />
    </div>
    {showWord && (
      <span className="font-display text-xl tracking-[0.18em] uppercase">
        Malaca
      </span>
    )}
  </div>
);