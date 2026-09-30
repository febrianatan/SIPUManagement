import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleDropdown({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const getCurrentIcon = () => {
        switch (appearance) {
            case 'dark':
                return <Moon className="h-4 w-4 text-amber-400" />;
            case 'light':
                return <Sun className="h-4 w-4 text-amber-500" />;
            default:
                return <Monitor className="h-4 w-4 text-slate-600 dark:text-neutral-400" />;
        }
    };

    return (
        <div className={className} {...props}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg border border-border/40 hover:bg-accent/80 transition-colors"
                        title="Ubah Tema (Terang / Gelap)"
                    >
                        {getCurrentIcon()}
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-36">
                    <DropdownMenuItem
                        onClick={() => updateAppearance('light')}
                        className={`flex items-center justify-between cursor-pointer ${appearance === 'light' ? 'font-semibold text-red-600 dark:text-red-400' : ''}`}
                    >
                        <span className="flex items-center gap-2">
                            <Sun className="h-4 w-4 text-amber-500" />
                            Light (Putih)
                        </span>
                        {appearance === 'light' && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => updateAppearance('dark')}
                        className={`flex items-center justify-between cursor-pointer ${appearance === 'dark' ? 'font-semibold text-red-600 dark:text-red-400' : ''}`}
                    >
                        <span className="flex items-center gap-2">
                            <Moon className="h-4 w-4 text-amber-400" />
                            Dark (Gelap)
                        </span>
                        {appearance === 'dark' && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => updateAppearance('system')}
                        className={`flex items-center justify-between cursor-pointer ${appearance === 'system' ? 'font-semibold text-red-600 dark:text-red-400' : ''}`}
                    >
                        <span className="flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-slate-500" />
                            Sistem
                        </span>
                        {appearance === 'system' && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
