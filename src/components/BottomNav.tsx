import { Compass, Map, Heart, CalendarDays, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'explorar',   icon: Compass,      label: 'Explorar' },
  { id: 'mapa',       icon: Map,          label: 'Mapa' },
  { id: 'favoritos',  icon: Heart,        label: 'Favoritos' },
  { id: 'calendario', icon: CalendarDays, label: 'Agenda' },
  { id: 'perfil',     icon: User,         label: 'Perfil' },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      {/* Glass pill container */}
      <div className="mx-3 mb-3 rounded-2xl glass border-border/30 shadow-[0_-4px_30px_hsl(0_0%_0%/0.5)]">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 w-14 h-full",
                  "transition-all duration-200 cursor-pointer",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground/80"
                )}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active glow pill behind icon */}
                {isActive && (
                  <span
                    className="absolute inset-x-1 inset-y-2 rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_12px_hsl(267_90%_65%/0.3)]"
                    aria-hidden="true"
                  />
                )}

                <Icon
                  className={cn(
                    "relative w-5 h-5 transition-transform duration-200",
                    isActive && "scale-110",
                    isActive && tab.id === 'favoritos' && "fill-current text-red-400"
                  )}
                />
                <span className={cn(
                  "relative text-[9px] font-semibold tracking-wide uppercase transition-all",
                  isActive ? "opacity-100" : "opacity-60"
                )}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}