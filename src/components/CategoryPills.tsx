import { cn } from '@/lib/utils';

interface CategoryPillsProps {
  categorias: string[];
  selected: string;
  onSelect: (categoria: string) => void;
}

// Tags emocionais → categoria real do banco
const TAGS: { emoji: string; label: string; categoria: string }[] = [
  { emoji: '✨', label: 'TUDO',       categoria: 'Todos' },
  { emoji: '🔥', label: 'BOMBANDO',   categoria: 'Shows' },
  { emoji: '🌙', label: 'UNDERGROUND',categoria: 'Eventos de Rua' },
  { emoji: '🎭', label: 'STAND-UP',   categoria: 'Stand-up' },
  { emoji: '🎨', label: 'CULTURAL',   categoria: 'Exposições' },
  { emoji: '💘', label: 'DATE IDEAL', categoria: 'Teatro' },
  { emoji: '🍻', label: 'GASTRO',     categoria: 'Gastronomia' },
  { emoji: '⚡', label: 'CAÓTICO',    categoria: 'Feiras' },
  { emoji: '💎', label: 'PREMIUM',    categoria: 'Esportes' },
  { emoji: '🧒', label: 'KIDS',       categoria: 'Infantil' },
];

export function CategoryPills({ categorias, selected, onSelect }: CategoryPillsProps) {
  // Filtra para mostrar apenas tags cuja categoria existe
  const available = TAGS.filter(t => categorias.includes(t.categoria));

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
      {available.map((tag) => {
        const isActive = selected === tag.categoria;
        return (
          <button
            key={tag.label}
            onClick={() => onSelect(tag.categoria)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-[11px] whitespace-nowrap shrink-0 transition-all label-mono",
              isActive
                ? "tag-neon shadow-neon-sm"
                : "tag-outline hover:border-white/50"
            )}
          >
            <span className="mr-1">{tag.emoji}</span>{tag.label}
          </button>
        );
      })}
    </div>
  );
}
