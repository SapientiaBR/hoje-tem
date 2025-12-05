import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilterClick: () => void;
}

export function SearchBar({ value, onChange, onFilterClick }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar eventos..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 h-12 bg-card border-border rounded-xl focus:ring-2 focus:ring-primary"
        />
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={onFilterClick}
        className="h-12 w-12 rounded-xl border-border"
        aria-label="Abrir filtros"
      >
        <SlidersHorizontal className="w-5 h-5" />
      </Button>
    </div>
  );
}