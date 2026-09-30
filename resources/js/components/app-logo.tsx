import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-lg overflow-hidden shadow-xs border border-border/40 bg-white p-0.5 dark:bg-neutral-900">
                <AppLogoIcon className="size-full object-contain" />
            </div>
            <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden">
                <span className="text-foreground truncate text-sm font-bold tracking-tight">
                    SIPU<span className="text-red-600 dark:text-red-400">Management</span>
                </span>
                <span className="text-muted-foreground truncate text-[10px] font-medium tracking-wider uppercase">Swiss-Belinn SKA PKU</span>
            </div>
        </div>
    );
}
