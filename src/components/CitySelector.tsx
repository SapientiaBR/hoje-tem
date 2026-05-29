import { MapPin, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CitySelectorProps {
  cidade: string;
  onCidadeChange: (cidade: string) => void;
}

const cidades = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba',
  'Porto Alegre', 'Salvador', 'Brasília', 'Recife', 'Fortaleza',
];

export function CitySelector({ cidade, onCidadeChange }: CitySelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 label-mono text-[10px] text-foreground hover:text-neon transition-colors">
          <MapPin className="w-3 h-3" />
          <span>{cidade}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card border-border">
        {cidades.map((c) => (
          <DropdownMenuItem
            key={c}
            onClick={() => onCidadeChange(c)}
            className={`label-mono text-[11px] cursor-pointer ${cidade === c ? 'text-neon' : ''}`}
          >
            {c}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
