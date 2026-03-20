import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilterClick: () => void;
}

export function SearchBar({ value, onChange, onFilterClick }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar eventos, locais..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full h-12 pl-10 pr-4
            bg-card/80 border border-border/60
            rounded-2xl text-sm text-foreground
            placeholder:text-muted-foreground/60
            outline-none ring-0
            transition-all duration-200
            focus:border-primary/50 focus:bg-card
            focus:shadow-[0_0_0_3px_hsl(267_90%_65%/0.15)]
          `}
        />
      </div>

      {/* Filter button */}
      <button
        onClick={onFilterClick}
        aria-label="Abrir filtros"
        className={`
          h-12 w-12 rounded-2xl shrink-0
          flex items-center justify-center
          border border-border/60 bg-card/80
          text-muted-foreground
          transition-all duration-200
          hover:border-primary/40 hover:text-primary hover:bg-primary/10
          hover:shadow-[0_0_12px_hsl(267_90%_65%/0.2)]
          cursor-pointer
        `}
      >
        <SlidersHorizontal className="w-4.5 h-4.5" />
      </button>
    </div>
  );
}