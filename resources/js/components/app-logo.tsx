import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex aspect-square size-9 items-center justify-center rounded-lg shadow-sm">
                <AppLogoIcon className="size-8" />
            </div>
            <div className="flex flex-col text-left">
                <span className="text-foreground truncate text-sm font-bold tracking-tight">
                    SIPU<span className="text-red-600 dark:text-red-400">Management</span>
                </span>
                <span className="text-muted-foreground truncate text-[10px] font-medium tracking-wider uppercase">Swiss-Belinn SKA PKU</span>
            </div>
        </div>
    );
}
