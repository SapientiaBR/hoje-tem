import { Flame, Radar, Bookmark, CalendarDays, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'explorar',   icon: Flame,        label: 'HOJE' },
  { id: 'mapa',       icon: Radar,        label: 'RADAR' },
  { id: 'favoritos',  icon: Bookmark,     label: 'SALVOS' },
  { id: 'calendario', icon: CalendarDays, label: 'AGENDA' },
  { id: 'perfil',     icon: User,         label: 'EU' },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom bg-background border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-full transition-all",
                isActive ? "text-neon" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform",
                  isActive && "scale-110",
                  isActive && tab.id === 'favoritos' && "fill-current"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="label-mono text-[9px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
