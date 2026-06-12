import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilterClick: () => void;
}

export function SearchBar({ value, onChange, onFilterClick }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="BUSCAR NA CIDADE..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full h-11 pl-10 pr-4 label-mono text-[11px]
            bg-card border border-border text-foreground
            placeholder:text-muted-foreground/70 placeholder:label-mono
            outline-none transition-all
            focus:border-neon focus:bg-card
          "
        />
      </div>
      <button
        onClick={onFilterClick}
        aria-label="Abrir filtros"
        className="
          h-11 w-11 shrink-0 flex items-center justify-center
          border border-border bg-card text-foreground
          transition-all hover:border-neon hover:text-neon
        "
      >
        <SlidersHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}
