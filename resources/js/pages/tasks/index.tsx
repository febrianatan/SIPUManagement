import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Paginated, Project, Task, TaskFilterOptions, User, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, Calendar, CheckCircle2, CheckSquare, Clock, Flame, Kanban, LayoutList, Plus, RotateCcw, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { CreateTaskDialog } from './components/create-task-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tasks',
        href: '/tasks',
    },
];

interface Props {
    tasks: Paginated<Task> | Task[];
    projects: Project[];
    users: (User & { department?: { name: string } })[];
    filters?: {
        search?: string;
        status?: string;
        priority?: string;
        project_id?: string | number;
        assignee_id?: string | number;
        acknowledgement?: string;
        due?: string;
        per_page?: number;
    };
    statusCounts?: {
        todo: number;
        in_progress: number;
        review: number;
        done: number;
    };
    filterOptions?: TaskFilterOptions;
}

export default function TasksIndex({
    tasks: tasksProp,
    projects = [],
    users = [],
    filters = {},
    statusCounts = { todo: 0, in_progress: 0, review: 0, done: 0 },
    filterOptions,
}: Props) {
    const isPaginated = typeof tasksProp === 'object' && 'data' in tasksProp;
    const taskList: Task[] = isPaginated ? (tasksProp as Paginated<Task>).data : (tasksProp as Task[]);
    const pagination = isPaginated ? (tasksProp as Paginated<Task>) : null;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const totalCount = statusCounts.todo + statusCounts.in_progress + statusCounts.review + statusCounts.done;

    const handleFilterChange = (key: string, value: string | null) => {
        const newFilters = { ...filters, [key]: value };
        if (!value || value === 'all') {
            delete newFilters[key as keyof typeof filters];
        }

        router.get(route('tasks.index'), newFilters as any, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange('search', searchQuery || null);
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        router.get(route('tasks.index'), {}, { replace: true });
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return (
                    <Badge variant="destructive" className="gap-1 font-semibold">
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'done':
                return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case 'in_progress':
                return <Clock className="h-4 w-4 text-blue-500" />;
            case 'review':
                return <AlertCircle className="h-4 w-4 text-purple-500" />;
            default:
                return <Clock className="h-4 w-4 text-slate-400" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'done':
                return 'Selesai';
            case 'in_progress':
                return 'In Progress';
            case 'review':
                return 'Review';
            default:
                return 'To Do';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Tugas - SIPU Swiss-Belinn PKU" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header & New Task Button */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Manajemen Tugas</h1>
                        <p className="text-muted-foreground mt-0.5 text-sm">
                            Kelola instruksi kerja staf, delegasi tugas antar departemen, dan pelacakan progres hotel.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* View Switcher */}
                        <div className="flex items-center rounded-xl border border-slate-200/80 bg-white p-1 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8 gap-1.5 px-3 text-xs"
                                onClick={() => setViewMode('list')}
                            >
                                <LayoutList className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">List</span>
                            </Button>
                            <Button
                                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8 gap-1.5 px-3 text-xs"
                                onClick={() => setViewMode('kanban')}
                            >
                                <Kanban className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Kanban</span>
                            </Button>
                        </div>

                        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-red-600 font-semibold text-white hover:bg-red-700">
                            <Plus className="mr-1.5 h-4 w-4" /> Tugas Baru
                        </Button>
                    </div>
                </div>

                {/* Status Tabs Bar */}
                <div className="flex flex-wrap items-center gap-2 border-b pb-4">
                    <button
                        onClick={() => handleFilterChange('status', null)}
                        className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                            !filters.status
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                    >
                        <span>Semua Status</span>
                        <span
                            className={`py-0.2 rounded-full px-1.5 text-[10px] ${!filters.status ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-neutral-700'}`}
                        >
                            {totalCount}
                        </span>
                    </button>

                    <button
                        onClick={() => handleFilterChange('status', 'todo')}
                        className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                            filters.status === 'todo'
                                ? 'bg-slate-800 text-white shadow-xs dark:bg-neutral-200 dark:text-black'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                    >
                        <span>To Do</span>
                        <span
                            className={`py-0.2 rounded-full px-1.5 text-[10px] ${filters.status === 'todo' ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black' : 'bg-slate-200 dark:bg-neutral-700'}`}
                        >
                            {statusCounts.todo}
                        </span>
                    </button>

                    <button
                        onClick={() => handleFilterChange('status', 'in_progress')}
                        className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                            filters.status === 'in_progress'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                    >
                        <span>In Progress</span>
                        <span
                            className={`py-0.2 rounded-full px-1.5 text-[10px] ${filters.status === 'in_progress' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-neutral-700'}`}
                        >
                            {statusCounts.in_progress}
                        </span>
                    </button>

                    <button
                        onClick={() => handleFilterChange('status', 'review')}
                        className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                            filters.status === 'review'
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                    >
                        <span>Review</span>
                        <span
                            className={`py-0.2 rounded-full px-1.5 text-[10px] ${filters.status === 'review' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-neutral-700'}`}
                        >
                            {statusCounts.review}
                        </span>
                    </button>

                    <button
                        onClick={() => handleFilterChange('status', 'done')}
                        className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                            filters.status === 'done'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                    >
                        <span>Selesai (Done)</span>
                        <span
                            className={`py-0.2 rounded-full px-1.5 text-[10px] ${filters.status === 'done' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-neutral-700'}`}
                        >
                            {statusCounts.done}
                        </span>
                    </button>
                </div>

                {/* Filter Toolbar */}
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs sm:grid-cols-2 md:grid-cols-5 dark:border-neutral-800 dark:bg-neutral-900">
                    {/* Search */}
                    <form onSubmit={handleSearchSubmit} className="relative md:col-span-2">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            placeholder="Cari judul tugas atau deskripsi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 text-xs"
                        />
                    </form>

                    {/* Priority Filter */}
                    <Select value={filters.priority || 'all'} onValueChange={(val) => handleFilterChange('priority', val)}>
                        <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Prioritas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Prioritas</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Project Filter */}
                    <Select
                        value={filters.project_id ? filters.project_id.toString() : 'all'}
                        onValueChange={(val) => handleFilterChange('project_id', val)}
                    >
                        <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Proyek" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Proyek</SelectItem>
                            {projects.map((p) => (
                                <SelectItem key={p.id} value={p.id.toString()}>
                                    {p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Due Filter & Reset */}
                    <div className="flex items-center gap-2">
                        <Select value={filters.due || 'all'} onValueChange={(val) => handleFilterChange('due', val)}>
                            <SelectTrigger className="text-xs">
                                <SelectValue placeholder="Tenggat" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Waktu</SelectItem>
                                <SelectItem value="overdue">Terlewat (Overdue)</SelectItem>
                                <SelectItem value="today">Hari Ini</SelectItem>
                                <SelectItem value="upcoming">Mendatang</SelectItem>
                                <SelectItem value="no_due">Tanpa Tenggat</SelectItem>
                            </SelectContent>
                        </Select>

                        {(filters.search || filters.priority || filters.project_id || filters.status || filters.due) && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleResetFilters}
                                title="Reset filter"
                                className="text-muted-foreground hover:text-foreground h-9 w-9 shrink-0"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* View: List Mode vs Kanban Mode */}
                {viewMode === 'kanban' ? (
                    /* KANBAN BOARD VIEW */
                    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                        {(['todo', 'in_progress', 'review', 'done'] as const).map((colStatus) => {
                            const colTasks = taskList.filter((t) => t.status === colStatus);
                            return (
                                <div
                                    key={colStatus}
                                    className="flex min-h-[450px] flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-100/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/60"
                                >
                                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 dark:border-neutral-800">
                                        <div className="flex items-center gap-2 text-sm font-bold">
                                            {getStatusIcon(colStatus)}
                                            <span>{getStatusLabel(colStatus)}</span>
                                        </div>
                                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-neutral-800 dark:text-neutral-300">
                                            {colTasks.length}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {colTasks.length === 0 ? (
                                            <p className="text-muted-foreground py-8 text-center text-xs">Tidak ada tugas</p>
                                        ) : (
                                            colTasks.map((task) => (
                                                <Link
                                                    key={task.id}
                                                    href={route('tasks.show', task.id)}
                                                    className="group rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-red-500/50 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <span className="text-foreground line-clamp-2 text-sm font-semibold group-hover:text-red-600 dark:group-hover:text-red-400">
                                                            {task.title || task.name}
                                                        </span>
                                                        {getPriorityBadge(task.priority)}
                                                    </div>

                                                    {task.project && (
                                                        <span className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-neutral-800 dark:text-neutral-400">
                                                            {task.project.name}
                                                        </span>
                                                    )}

                                                    <div className="text-muted-foreground mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-neutral-800">
                                                        <span className="flex items-center gap-1 text-[11px]">
                                                            <Calendar className="h-3 w-3" />
                                                            {task.due_at ? new Date(task.due_at).toLocaleDateString() : '-'}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            <span>{task.assignees?.length || 0}</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* LIST VIEW TABLE */
                    <Card className="border-slate-200/80 shadow-xs dark:border-neutral-800">
                        <CardContent className="p-0">
                            {taskList.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <CheckSquare className="text-muted-foreground/40 mb-3 h-12 w-12" />
                                    <h3 className="text-foreground text-base font-bold">Tidak Ada Tugas Ditemukan</h3>
                                    <p className="text-muted-foreground mt-1 max-w-sm text-xs">
                                        Tidak ada tugas yang sesuai dengan kriteria filter saat ini. Coba ubah filter atau buat tugas baru.
                                    </p>
                                    <Button
                                        className="mt-4 bg-red-600 font-semibold text-white hover:bg-red-700"
                                        onClick={() => setIsCreateModalOpen(true)}
                                    >
                                        <Plus className="mr-1.5 h-4 w-4" /> Buat Tugas Sekarang
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="text-muted-foreground border-b border-slate-200/80 bg-slate-50 text-xs font-semibold uppercase dark:border-neutral-800 dark:bg-neutral-900">
                                            <tr>
                                                <th className="px-4 py-3.5 sm:px-6">Tugas & Proyek</th>
                                                <th className="px-4 py-3.5 text-center">Status</th>
                                                <th className="px-4 py-3.5 text-center">Prioritas</th>
                                                <th className="px-4 py-3.5">Penerima Tugas</th>
                                                <th className="px-4 py-3.5 text-right sm:pr-6">Tenggat Waktu</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                                            {taskList.map((task) => (
                                                <tr
                                                    key={task.id}
                                                    onClick={() => router.visit(route('tasks.show', task.id))}
                                                    className="group cursor-pointer transition-colors hover:bg-slate-50/80 dark:hover:bg-neutral-800/40"
                                                >
                                                    <td className="px-4 py-4 sm:px-6">
                                                        <div className="text-foreground font-semibold group-hover:text-red-600 group-hover:underline dark:group-hover:text-red-400">
                                                            {task.title || task.name}
                                                        </div>
                                                        <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                                                            {task.project && (
                                                                <span className="font-medium text-slate-700 dark:text-neutral-300">
                                                                    Proyek: {task.project.name}
                                                                </span>
                                                            )}
                                                            {task.creator && <span>• Oleh {task.creator.name}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <div className="inline-flex items-center gap-1.5">
                                                            {getStatusIcon(task.status)}
                                                            <span className="text-xs font-medium capitalize">{getStatusLabel(task.status)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">{getPriorityBadge(task.priority)}</td>
                                                    <td className="px-4 py-4">
                                                        {task.assignees && task.assignees.length > 0 ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="flex -space-x-1.5 overflow-hidden">
                                                                    {task.assignees.slice(0, 3).map((a) => (
                                                                        <div
                                                                            key={a.id}
                                                                            title={`${a.name} ${a.pivot?.acknowledged_at ? '(Acknowledged)' : '(Pending)'}`}
                                                                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-white dark:ring-neutral-900 ${
                                                                                a.pivot?.acknowledged_at
                                                                                    ? 'bg-emerald-600 text-white'
                                                                                    : 'bg-amber-500 text-white'
                                                                            }`}
                                                                        >
                                                                            {a.name.substring(0, 2).toUpperCase()}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <span className="text-muted-foreground text-xs">
                                                                    {task.assignees[0].name}
                                                                    {task.assignees.length > 1 && ` +${task.assignees.length - 1}`}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs">Belum ditugaskan</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-right sm:pr-6">
                                                        {task.due_at ? (
                                                            <div className="inline-flex flex-col items-end">
                                                                <span className="text-foreground text-xs font-medium">
                                                                    {new Date(task.due_at).toLocaleDateString()}
                                                                </span>
                                                                <span className="text-muted-foreground text-[10px]">
                                                                    {new Date(task.due_at).toLocaleTimeString([], {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    })}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs">Tanpa batas</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {pagination && pagination.links && pagination.links.length > 3 && (
                                <div className="text-muted-foreground flex flex-col items-center justify-between gap-4 border-t p-4 text-xs sm:flex-row">
                                    <div>
                                        Menampilkan <span className="text-foreground font-semibold">{pagination.from || 0}</span> sampai{' '}
                                        <span className="text-foreground font-semibold">{pagination.to || 0}</span> dari total{' '}
                                        <span className="text-foreground font-semibold">{pagination.total}</span> tugas
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {pagination.links.map((link, idx) => (
                                            <button
                                                key={idx}
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url)}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                                                    link.active
                                                        ? 'border-red-600 bg-red-600 font-bold text-white'
                                                        : link.url
                                                          ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300'
                                                          : 'cursor-not-allowed border-transparent opacity-40'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Create Task Dialog */}
                <CreateTaskDialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} projects={projects} users={users} />
            </div>
        </AppLayout>
    );
}
