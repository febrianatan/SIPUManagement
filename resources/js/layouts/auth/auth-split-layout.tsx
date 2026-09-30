import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0 bg-background">
            <div className="absolute top-4 right-4 z-30">
                <AppearanceToggleDropdown />
            </div>

            <div className="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r border-border/50">
                <div className="absolute inset-0 bg-zinc-900" />
                <Link href={route('home')} className="relative z-20 flex items-center gap-3 text-lg font-medium">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white p-1 shadow-sm">
                        <AppLogoIcon className="size-full object-contain" />
                    </div>
                    <span>{name || 'SIPU Management'}</span>
                </Link>
                {quote && (
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">&ldquo;{quote.message}&rdquo;</p>
                            <footer className="text-sm text-neutral-300">{quote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link href={route('home')} className="relative z-20 flex flex-col items-center gap-2 justify-center lg:hidden">
                        <div className="flex size-12 items-center justify-center rounded-xl border border-border/60 bg-white p-1.5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <AppLogoIcon className="size-full object-contain" />
                        </div>
                        <span className="text-sm font-bold tracking-tight text-foreground">
                            SIPU<span className="text-red-600 dark:text-red-500">Management</span>
                        </span>
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
                        <p className="text-muted-foreground text-sm text-balance">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
