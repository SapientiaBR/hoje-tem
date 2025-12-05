import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Filtros } from '@/hooks/useEventos';

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  filtros: Filtros;
  onFiltrosChange: (filtros: Filtros) => void;
  categorias: string[];
}

export function FilterSheet({ open, onClose, filtros, onFiltrosChange, categorias }: FilterSheetProps) {
  const periodos = [
    { id: 'todos', label: 'Todos' },
    { id: 'hoje', label: 'Hoje' },
    { id: 'amanha', label: 'Amanhã' },
    { id: 'semana', label: 'Esta semana' },
    { id: 'mes', label: 'Este mês' },
  ];

  const handlePeriodoChange = (periodo: string) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    let dataInicio: Date | null = null;
    let dataFim: Date | null = null;

    switch (periodo) {
      case 'hoje':
        dataInicio = hoje;
        dataFim = new Date(hoje);
        dataFim.setHours(23, 59, 59, 999);
        break;
      case 'amanha':
        dataInicio = new Date(hoje);
        dataInicio.setDate(dataInicio.getDate() + 1);
        dataFim = new Date(dataInicio);
        dataFim.setHours(23, 59, 59, 999);
        break;
      case 'semana':
        dataInicio = hoje;
        dataFim = new Date(hoje);
        dataFim.setDate(dataFim.getDate() + 7);
        break;
      case 'mes':
        dataInicio = hoje;
        dataFim = new Date(hoje);
        dataFim.setMonth(dataFim.getMonth() + 1);
        break;
    }

    onFiltrosChange({ ...filtros, dataInicio, dataFim });
  };

  const limparFiltros = () => {
    onFiltrosChange({
      busca: filtros.busca,
      categoria: 'Todos',
      dataInicio: null,
      dataFim: null,
      precoMin: 0,
      precoMax: 500,
      cidade: filtros.cidade,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
          <SheetTitle className="text-xl font-bold">Filtros</SheetTitle>
          <Button variant="ghost" size="sm" onClick={limparFiltros}>
            Limpar
          </Button>
        </SheetHeader>

        <div className="py-6 space-y-8 overflow-y-auto max-h-[calc(85vh-120px)]">
          {/* Categorias */}
          <section>
            <h3 className="font-semibold text-foreground mb-4">Categoria</h3>
            <div className="flex flex-wrap gap-2">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onFiltrosChange({ ...filtros, categoria: cat })}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    filtros.categoria === cat
                      ? "gradient-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* Período */}
          <section>
            <h3 className="font-semibold text-foreground mb-4">Quando</h3>
            <div className="flex flex-wrap gap-2">
              {periodos.map((periodo) => (
                <button
                  key={periodo.id}
                  onClick={() => handlePeriodoChange(periodo.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    (periodo.id === 'todos' && !filtros.dataInicio)
                      ? "gradient-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {periodo.label}
                </button>
              ))}
            </div>
          </section>

          {/* Faixa de preço */}
          <section>
            <h3 className="font-semibold text-foreground mb-4">Faixa de preço</h3>
            <div className="px-2">
              <Slider
                value={[filtros.precoMin, filtros.precoMax]}
                min={0}
                max={500}
                step={10}
                onValueChange={([min, max]) => 
                  onFiltrosChange({ ...filtros, precoMin: min, precoMax: max })
                }
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{filtros.precoMin === 0 ? 'Gratuito' : `R$ ${filtros.precoMin}`}</span>
                <span>{filtros.precoMax >= 500 ? 'R$ 500+' : `R$ ${filtros.precoMax}`}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <Button 
            onClick={onClose} 
            className="w-full h-12 gradient-primary text-primary-foreground font-semibold rounded-xl"
          >
            Ver resultados
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}