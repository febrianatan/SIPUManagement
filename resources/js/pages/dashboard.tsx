import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { DashboardStats, Task, type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    ArrowRight,
    Briefcase,
    Calendar,
    CheckCircle,
    CheckCircle2,
    CheckSquare,
    Clock,
    Flame,
    Hotel,
    ListTodo,
    Plus,
    ShieldCheck,
    UserCheck,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Props {
    stats: DashboardStats;
    pendingAcknowledgements: Task[];
    urgentTasks: Task[];
    overdueTasks: Task[];
}

export default function Dashboard({ stats, pendingAcknowledgements = [], urgentTasks = [], overdueTasks = [] }: Props) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    const [acknowledgingId, setAcknowledgingId] = useState<number | null>(null);

    const handleAcknowledge = (taskId: number) => {
        setAcknowledgingId(taskId);
        router.patch(
            route('tasks.acknowledge', taskId),
            {},
            {
                preserveScroll: true,
                onFinish: () => setAcknowledgingId(null),
            },
        );
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return (
                    <Badge variant="destructive" className="gap-1 font-semibold shadow-xs">
                        <Flame className="h-3 w-3" /> Urgent
                    </Badge>
                );
            case 'high':
                return <Badge className="bg-amber-500 font-semibold text-white hover:bg-amber-600">High</Badge>;
            case 'medium':
                return <Badge variant="secondary">Medium</Badge>;
            default:
                return <Badge variant="outline">Low</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'done':
                return (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Selesai
                    </span>
                );
            case 'in_progress':
                return (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                        <Clock className="h-3.5 w-3.5" /> Sedang Dikerjakan
                    </span>
                );
            case 'review':
                return (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400">
                        <AlertCircle className="h-3.5 w-3.5" /> Review
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-neutral-400">
                        <ListTodo className="h-3.5 w-3.5" /> To Do
                    </span>
                );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - SIPU Management" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Greeting & Quick Action Header */}
                <div className="relative overflow-hidden rounded-2xl border border-red-200/60 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 text-white shadow-lg md:p-8">
                    <div className="pointer-events-none absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full bg-black/20 px-3 py-1 text-xs font-medium text-red-100 backdrop-blur-md">
                                <Hotel className="h-3.5 w-3.5 text-amber-300" />
                                <span>Swiss-Belinn SKA Pekanbaru • Unit Management</span>
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Selamat datang, {user.name}!</h1>
                            <p className="max-w-xl text-sm text-red-100/90 md:text-base">
                                Pantau penugasan harian operasional, konfirmasi instruksi tugas, dan kelola kelancaran unit hotel Anda.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button asChild variant="secondary" className="bg-white font-semibold text-red-700 shadow-sm hover:bg-red-50">
                                <Link href={route('tasks.create')}>
                                    <Plus className="mr-1.5 h-4 w-4" /> Buat Tugas Baru
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                                <Link href={route('projects.index')}>
                                    <Briefcase className="mr-1.5 h-4 w-4" /> Kelola Proyek
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* KPI Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-7">
                    {/* 1. Tugas Saya */}
                    <div className="col-span-1 rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Tugas Saya</span>
                            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <CheckSquare className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-foreground text-2xl font-black tracking-tight">{stats.my_tasks}</div>
                            <p className="text-muted-foreground mt-0.5 text-[11px]">Tugas aktif</p>
                        </div>
                    </div>

                    {/* 2. Need Acknowledgement */}
                    <div
                        className={`col-span-1 rounded-xl border p-4 shadow-2xs transition-all ${
                            stats.pending_acknowledgement > 0
                                ? 'border-amber-400/80 bg-amber-50/70 dark:border-amber-800/80 dark:bg-amber-950/30'
                                : 'border-slate-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span
                                className={`text-xs font-semibold tracking-wider uppercase ${
                                    stats.pending_acknowledgement > 0 ? 'text-amber-800 dark:text-amber-300' : 'text-muted-foreground'
                                }`}
                            >
                                Acknowledge
                            </span>
                            <div className="rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                                <UserCheck className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div
                                className={`text-2xl font-black tracking-tight ${
                                    stats.pending_acknowledgement > 0 ? 'text-amber-900 dark:text-amber-200' : 'text-foreground'
                                }`}
                            >
                                {stats.pending_acknowledgement}
                            </div>
                            <p className="mt-0.5 text-[11px] text-amber-700/80 dark:text-amber-400/80">Perlu konfirmasi</p>
                        </div>
                    </div>

                    {/* 3. In Progress */}
                    <div className="col-span-1 rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Proses</span>
                            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                <Clock className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-foreground text-2xl font-black tracking-tight">{stats.in_progress}</div>
                            <p className="text-muted-foreground mt-0.5 text-[11px]">Sedang dikerjakan</p>
                        </div>
                    </div>

                    {/* 4. Urgent */}
                    <div
                        className={`col-span-1 rounded-xl border p-4 shadow-2xs ${
                            stats.urgent > 0
                                ? 'border-rose-400/80 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/30'
                                : 'border-slate-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span
                                className={`text-xs font-semibold tracking-wider uppercase ${
                                    stats.urgent > 0 ? 'text-rose-800 dark:text-rose-300' : 'text-muted-foreground'
                                }`}
                            >
                                Urgent
                            </span>
                            <div className="rounded-lg bg-rose-100 p-2 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                                <Flame className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div
                                className={`text-2xl font-black tracking-tight ${
                                    stats.urgent > 0 ? 'text-rose-900 dark:text-rose-200' : 'text-foreground'
                                }`}
                            >
                                {stats.urgent}
                            </div>
                            <p className="mt-0.5 text-[11px] text-rose-700/80 dark:text-rose-400/80">Prioritas tinggi</p>
                        </div>
                    </div>

                    {/* 5. Overdue */}
                    <div
                        className={`col-span-1 rounded-xl border p-4 shadow-2xs ${
                            stats.overdue > 0
                                ? 'border-red-500/80 bg-red-50/80 dark:border-red-900/60 dark:bg-red-950/40'
                                : 'border-slate-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span
                                className={`text-xs font-semibold tracking-wider uppercase ${
                                    stats.overdue > 0 ? 'text-red-800 dark:text-red-300' : 'text-muted-foreground'
                                }`}
                            >
                                Terlambat
                            </span>
                            <div className="rounded-lg bg-red-100 p-2 text-red-700 dark:bg-red-900/60 dark:text-red-300">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div
                                className={`text-2xl font-black tracking-tight ${
                                    stats.overdue > 0 ? 'text-red-900 dark:text-red-200' : 'text-foreground'
                                }`}
                            >
                                {stats.overdue}
                            </div>
                            <p className="mt-0.5 text-[11px] text-red-700/80 dark:text-red-400/80">Lewat tenggat</p>
                        </div>
                    </div>

                    {/* 6. Active Projects */}
                    <div className="col-span-1 rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Proyek</span>
                            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <Briefcase className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-foreground text-2xl font-black tracking-tight">{stats.active_projects}</div>
                            <p className="text-muted-foreground mt-0.5 text-[11px]">Proyek aktif</p>
                        </div>
                    </div>

                    {/* 7. Created By Me */}
                    <div className="col-span-1 rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Didelegasikan</span>
                            <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-foreground text-2xl font-black tracking-tight">{stats.created_by_me}</div>
                            <p className="text-muted-foreground mt-0.5 text-[11px]">Dibuat oleh saya</p>
                        </div>
                    </div>
                </div>

                {/* Priority Section: Pending Acknowledgement Banner */}
                {pendingAcknowledgements.length > 0 && (
                    <Card className="border-amber-300/80 bg-amber-50/50 shadow-md dark:border-amber-800/80 dark:bg-amber-950/20">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-full bg-amber-500/20 p-1.5 text-amber-700 dark:text-amber-400">
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-bold text-amber-900 dark:text-amber-100">
                                            Perlu Konfirmasi Penerimaan Tugas ({pendingAcknowledgements.length})
                                        </CardTitle>
                                        <CardDescription className="text-amber-700/80 dark:text-amber-300/80">
                                            Tugas berikut telah ditugaskan kepada Anda dan memerlukan konfirmasi (Acknowledgement) bahwa Anda siap
                                            mengerjakannya.
                                        </CardDescription>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-amber-200/60 overflow-hidden rounded-xl border border-amber-200/80 bg-white/80 dark:divide-amber-800/50 dark:border-amber-900/60 dark:bg-neutral-900/80">
                                {pendingAcknowledgements.map((task) => (
                                    <div key={task.id} className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('tasks.show', task.id)}
                                                    className="font-semibold text-slate-900 hover:text-red-600 hover:underline dark:text-white dark:hover:text-red-400"
                                                >
                                                    {task.title || task.name}
                                                </Link>
                                                {getPriorityBadge(task.priority)}
                                            </div>
                                            <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                                                {task.project && (
                                                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-neutral-300">
                                                        <Briefcase className="h-3 w-3" /> {task.project.name}
                                                    </span>
                                                )}
                                                <span>Oleh: {task.creator?.name || 'Admin'}</span>
                                                {task.due_at && (
                                                    <span className="flex items-center gap-1 font-medium text-red-600 dark:text-red-400">
                                                        <Calendar className="h-3 w-3" /> Tenggat: {new Date(task.due_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <Button
                                                size="sm"
                                                className="bg-amber-600 font-semibold text-white hover:bg-amber-700"
                                                disabled={acknowledgingId === task.id}
                                                onClick={() => handleAcknowledge(task.id)}
                                            >
                                                <CheckCircle className="mr-1.5 h-4 w-4" />
                                                {acknowledgingId === task.id ? 'Mengkonfirmasi...' : 'Acknowledge Tugas'}
                                            </Button>
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={route('tasks.show', task.id)}>Detail</Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Two-Column Section: Urgent Tasks & Overdue Tasks */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Urgent Tasks */}
                    <Card className="border-slate-200/80 shadow-xs dark:border-neutral-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-rose-500/10 p-2 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                                    <Flame className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold">Tugas Mendesak (Urgent)</CardTitle>
                                    <CardDescription>Tugas prioritas tinggi yang memerlukan tindakan segera</CardDescription>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="text-xs">
                                <Link href={route('tasks.index', { priority: 'urgent' })}>
                                    Lihat Semua <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {urgentTasks.length === 0 ? (
                                <div className="text-muted-foreground flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
                                    <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-500 opacity-80" />
                                    <p className="text-foreground text-sm font-medium">Tidak ada tugas mendesak saat ini.</p>
                                    <p className="text-muted-foreground mt-0.5 text-xs">Operasional berjalan tertib.</p>
                                </div>
                            ) : (
                                <div className="bg-card divide-y overflow-hidden rounded-xl border border-slate-200/80 dark:border-neutral-800">
                                    {urgentTasks.map((task) => (
                                        <Link
                                            key={task.id}
                                            href={route('tasks.show', task.id)}
                                            className="flex items-center justify-between p-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-neutral-800/60"
                                        >
                                            <div className="space-y-1 pr-4">
                                                <div className="line-clamp-1 text-sm font-semibold hover:underline">{task.title || task.name}</div>
                                                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                                                    {task.project && <span>{task.project.name}</span>}
                                                    {task.due_at && (
                                                        <span className="font-medium text-rose-600 dark:text-rose-400">
                                                            • Due: {new Date(task.due_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="shrink-0">{getStatusBadge(task.status)}</div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Overdue Tasks */}
                    <Card className="border-slate-200/80 shadow-xs dark:border-neutral-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-red-500/10 p-2 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                                    <AlertTriangle className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold">Melewati Tenggat (Overdue)</CardTitle>
                                    <CardDescription>Tugas yang belum selesai dan melewati batas waktu</CardDescription>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="text-xs">
                                <Link href={route('tasks.index', { due: 'overdue' })}>
                                    Lihat Semua <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {overdueTasks.length === 0 ? (
                                <div className="text-muted-foreground flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
                                    <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-500 opacity-80" />
                                    <p className="text-foreground text-sm font-medium">Tidak ada tugas yang terlambat.</p>
                                    <p className="text-muted-foreground mt-0.5 text-xs">Semua penugasan on-track.</p>
                                </div>
                            ) : (
                                <div className="bg-card divide-y overflow-hidden rounded-xl border border-slate-200/80 dark:border-neutral-800">
                                    {overdueTasks.map((task) => (
                                        <Link
                                            key={task.id}
                                            href={route('tasks.show', task.id)}
                                            className="flex items-center justify-between p-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-neutral-800/60"
                                        >
                                            <div className="space-y-1 pr-4">
                                                <div className="line-clamp-1 text-sm font-semibold text-red-600 hover:underline dark:text-red-400">
                                                    {task.title || task.name}
                                                </div>
                                                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                                                    {task.project && <span>{task.project.name}</span>}
                                                    {task.due_at && (
                                                        <span className="font-medium text-red-600 dark:text-red-400">
                                                            • Terlewat: {new Date(task.due_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="shrink-0">{getPriorityBadge(task.priority)}</div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
