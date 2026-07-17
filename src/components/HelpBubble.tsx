import { HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface HelpBubbleProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}

/**
 * Bulle explicative type "guide utilisateur".
 * Cliquer sur l'icône ? affiche une aide contextuelle.
 */
export function HelpBubble({ title = "Aide", children, className, side = "right" }: HelpBubbleProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Afficher l'aide"
          className={cn(
            "inline-flex items-center justify-center rounded-full h-5 w-5 text-primary/70 hover:text-primary hover:bg-primary/10 transition-colors",
            className
          )}
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent side={side} className="w-72 text-sm">
        <div className="space-y-1.5">
          <p className="font-semibold text-primary flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4" />
            {title}
          </p>
          <div className="text-muted-foreground leading-relaxed">{children}</div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
