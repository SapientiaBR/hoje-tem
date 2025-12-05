import { cn } from '@/lib/utils';

interface CategoryPillsProps {
  categorias: string[];
  selected: string;
  onSelect: (categoria: string) => void;
}

export function CategoryPills({ categorias, selected, onSelect }: CategoryPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categorias.map((categoria) => (
        <button
          key={categoria}
          onClick={() => onSelect(categoria)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0",
            selected === categoria
              ? "gradient-primary text-primary-foreground shadow-glow"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          {categoria}
        </button>
      ))}
    </div>
  );
}