import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Briefcase, Building2, CheckSquare, Hotel, LayoutGrid, ShieldCheck, Users } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Projects',
        url: '/projects',
        icon: Briefcase,
    },
    {
        title: 'Tasks',
        url: '/tasks',
        icon: CheckSquare,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user.role === 'administrator';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="border-sidebar-border/50 border-b pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent/50 transition-colors">
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <div className="px-3 py-2">
                    <p className="text-muted-foreground px-3 text-[11px] font-semibold tracking-wider uppercase">Menu Utama</p>
                    <NavMain items={mainNavItems} />
                </div>

                {isAdmin && (
                    <div className="border-sidebar-border/40 mt-2 border-t px-3 py-2">
                        <div className="flex items-center gap-1.5 px-3 py-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                            <h3 className="text-[11px] font-semibold tracking-wider text-red-700 uppercase dark:text-red-400">Admin Panel</h3>
                        </div>
                        <NavMain
                            items={[
                                { title: 'User Management', url: '/admin/users', icon: Users },
                                { title: 'Departments', url: '/admin/departments', icon: Building2 },
                            ]}
                        />
                    </div>
                )}
            </SidebarContent>

            <SidebarFooter className="border-sidebar-border/50 border-t pt-2">
                <div className="text-muted-foreground flex items-center gap-2 px-3 py-2 text-xs">
                    <Hotel className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                    <div className="truncate">
                        <p className="text-foreground text-[11px] font-semibold">Swiss-Belinn SKA PKU</p>
                        <p className="text-muted-foreground text-[10px]">Internship Unit Portal v1.0</p>
                    </div>
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
