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
  'São Paulo',
  'Rio de Janeiro',
  'Belo Horizonte',
  'Curitiba',
  'Porto Alegre',
  'Salvador',
  'Brasília',
  'Recife',
  'Fortaleza',
];

export function CitySelector({ cidade, onCidadeChange }: CitySelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">{cidade}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {cidades.map((c) => (
          <DropdownMenuItem
            key={c}
            onClick={() => onCidadeChange(c)}
            className={cidade === c ? 'bg-primary/10 text-primary' : ''}
          >
            {c}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}