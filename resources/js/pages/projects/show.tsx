import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Department, Project, User, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, Briefcase, Building2, Calendar, CheckCircle2, ChevronLeft, Clock, Flame, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CreateTaskDialog } from '../tasks/components/create-task-dialog';
import { EditProjectDialog } from './components/edit-project-dialog';

interface TaskSummary {
    id: number;
    title: string;
    description: string | null;
    status: 'todo' | 'in_progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_at: string | null;
    created_at: string;
    creator?: User;
    assignees?: User[];
    assignee_count: number;
    acknowledged_count: number;
    can_open: boolean;
    can_update_status: boolean;
}

interface Props {
    project: Project;
    stats: {
        total_tasks: number;
        todo: number;
        in_progress: number;
        review: number;
        done: number;
        completion_percentage: number;
    };
    tasks: TaskSummary[];
    can: {
        update: boolean;
        delete: boolean;
    };
    departments?: Department[];
    users?: (User & { department?: { name: string } })[];
}

export default function ProjectShow({
    project,
    stats = { total_tasks: 0, todo: 0, in_progress: 0, review: 0, done: 0, completion_percentage: 0 },
    tasks = [],
    can = { update: false, delete: false },
    departments = [],
    users = [],
}: Props) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Projects',
            href: '/projects',
        },
        {
            title: project.name,
            href: `/projects/${project.id}`,
        },
    ];

    const handleDeleteProject = () => {
        router.delete(route('projects.destroy', project.id));
    };

    const getStatusBadge = (status: Project['status']) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-emerald-600 font-semibold text-white">Active</Badge>;
            case 'completed':
                return (
                    <Badge variant="secondary" className="font-semibold">
                        Completed
                    </Badge>
                );
            case 'archived':
                return <Badge variant="outline">Archived</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return (
                    <Badge variant="destructive" className="gap-1 text-[11px] font-semibold">
                        <Flame className="h-3 w-3" /> Urgent
                    </Badge>
                );
            case 'high':
                return <Badge className="bg-amber-500 text-[11px] font-semibold text-white hover:bg-amber-600">High</Badge>;
            case 'medium':
                return (
                    <Badge variant="secondary" className="text-[11px]">
                        Medium
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-[11px]">
                        Low
                    </Badge>
                );
        }
    };

    const getTaskStatusIcon = (status: string) => {
        switch (status) {
            case 'done':
                return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
            case 'in_progress':
                return <Clock className="h-3.5 w-3.5 text-blue-500" />;
            case 'review':
                return <AlertCircle className="h-3.5 w-3.5 text-purple-500" />;
            default:
                return <Clock className="h-3.5 w-3.5 text-slate-400" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${project.name} - SIPU Swiss-Belinn PKU`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                        <Button variant="outline" size="icon" asChild className="mt-0.5 shrink-0">
                            <Link href={route('projects.index')}>
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">{project.name}</h1>
                                {getStatusBadge(project.status)}
                            </div>
                            <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-3 text-xs">
                                <span>Oleh {project.creator?.name || 'Admin'}</span>
                                <span>• Dibuat {new Date(project.created_at).toLocaleDateString()}</span>
                                {(project.start_date || project.due_date) && (
                                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-neutral-300">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'} -{' '}
                                        {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'N/A'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {can.update && (
                            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)} className="gap-1.5">
                                <Pencil className="h-3.5 w-3.5" /> Edit Proyek
                            </Button>
                        )}
                        {can.delete && (
                            <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)} className="gap-1.5">
                                <Trash2 className="h-3.5 w-3.5" /> Hapus
                            </Button>
                        )}
                    </div>
                </div>

                {/* Progress & KPI Highlights */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5">
                    {/* Completion bar card */}
                    <div className="col-span-2 flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs md:col-span-1 dark:border-neutral-800 dark:bg-neutral-900">
                        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Progres</span>
                        <div className="mt-2">
                            <div className="text-foreground text-3xl font-black">{stats.completion_percentage}%</div>
                            {/* Progress bar */}
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800">
                                <div
                                    className="h-2 rounded-full bg-emerald-600 transition-all duration-500"
                                    style={{ width: `${stats.completion_percentage}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Total Tasks */}
                    <div className="col-span-1 rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Total Tugas</span>
                        <div className="text-foreground mt-2 text-2xl font-black">{stats.total_tasks}</div>
                        <p className="text-muted-foreground mt-0.5 text-[11px]">Tugas terdaftar</p>
                    </div>

                    {/* To Do */}
                    <div className="col-span-1 rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">To Do</span>
                        <div className="mt-2 text-2xl font-black text-slate-700 dark:text-neutral-300">{stats.todo}</div>
                        <p className="text-muted-foreground mt-0.5 text-[11px]">Belum dimulai</p>
                    </div>

                    {/* In Progress */}
                    <div className="col-span-1 rounded-xl border border-blue-200/70 bg-blue-50/40 p-4 shadow-2xs dark:border-blue-900/50 dark:bg-blue-950/20">
                        <span className="text-xs font-semibold tracking-wider text-blue-700 uppercase dark:text-blue-300">In Progress</span>
                        <div className="mt-2 text-2xl font-black text-blue-900 dark:text-blue-200">{stats.in_progress}</div>
                        <p className="mt-0.5 text-[11px] text-blue-600/80 dark:text-blue-400/80">Pengerjaan aktif</p>
                    </div>

                    {/* Done */}
                    <div className="col-span-1 rounded-xl border border-emerald-200/70 bg-emerald-50/40 p-4 shadow-2xs dark:border-emerald-900/50 dark:bg-emerald-950/20">
                        <span className="text-xs font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">Selesai</span>
                        <div className="mt-2 text-2xl font-black text-emerald-900 dark:text-emerald-200">{stats.done}</div>
                        <p className="mt-0.5 text-[11px] text-emerald-600/80 dark:text-emerald-400/80">Telah terselesaikan</p>
                    </div>
                </div>

                {/* 2-Column Grid: Tasks List & Project Meta */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left: Project Tasks Table */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card className="border-slate-200/80 shadow-xs dark:border-neutral-800">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                                        <Briefcase className="text-muted-foreground h-4 w-4" /> Daftar Tugas Proyek ({tasks.length})
                                    </CardTitle>
                                    <CardDescription>Seluruh penugasan yang diasosiasikan dengan proyek ini</CardDescription>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => setIsCreateTaskModalOpen(true)}
                                    className="gap-1 bg-red-600 text-xs font-semibold text-white hover:bg-red-700"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Tambah Tugas
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                {tasks.length === 0 ? (
                                    <div className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center">
                                        <Briefcase className="text-muted-foreground/30 mb-2 h-10 w-10" />
                                        <p className="text-foreground text-sm font-semibold">Belum ada tugas dalam proyek ini</p>
                                        <p className="text-muted-foreground mt-0.5 text-xs">
                                            Klik tombol "Tambah Tugas" untuk mendistribusikan penugasan pertama.
                                        </p>
                                        <Button
                                            size="sm"
                                            onClick={() => setIsCreateTaskModalOpen(true)}
                                            className="mt-4 bg-red-600 font-semibold text-white hover:bg-red-700"
                                        >
                                            <Plus className="mr-1 h-3.5 w-3.5" /> Tambah Tugas Baru
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="text-muted-foreground border-y bg-slate-50 text-xs font-semibold uppercase dark:border-neutral-800 dark:bg-neutral-900">
                                                <tr>
                                                    <th className="px-4 py-3 sm:px-6">Tugas</th>
                                                    <th className="px-4 py-3 text-center">Status</th>
                                                    <th className="px-4 py-3 text-center">Prioritas</th>
                                                    <th className="px-4 py-3">Penerima Tugas</th>
                                                    <th className="px-4 py-3 text-right sm:pr-6">Tenggat</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                                                {tasks.map((task) => (
                                                    <tr
                                                        key={task.id}
                                                        onClick={() => router.visit(route('tasks.show', task.id))}
                                                        className="group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-neutral-800/40"
                                                    >
                                                        <td className="px-4 py-3.5 sm:px-6">
                                                            <div className="text-foreground font-semibold group-hover:text-red-600 group-hover:underline dark:group-hover:text-red-400">
                                                                {task.title}
                                                            </div>
                                                            {task.description && (
                                                                <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                                                                    {task.description}
                                                                </p>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-center">
                                                            <div className="inline-flex items-center gap-1.5 text-xs font-medium capitalize">
                                                                {getTaskStatusIcon(task.status)}
                                                                <span>{task.status.replace('_', ' ')}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3.5 text-center">{getPriorityBadge(task.priority)}</td>
                                                        <td className="px-4 py-3.5">
                                                            {task.assignees && task.assignees.length > 0 ? (
                                                                <div className="flex items-center gap-1.5 text-xs">
                                                                    <span className="text-foreground font-medium">{task.assignees[0].name}</span>
                                                                    {task.assignee_count > 1 && (
                                                                        <span className="text-muted-foreground text-[10px]">
                                                                            +{task.assignee_count - 1}
                                                                        </span>
                                                                    )}
                                                                    {task.acknowledged_count > 0 && (
                                                                        <span className="py-0.2 rounded-full bg-emerald-100 px-1.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                                                            {task.acknowledged_count} ack
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground text-xs">-</span>
                                                            )}
                                                        </td>
                                                        <td className="text-muted-foreground px-4 py-3.5 text-right text-xs sm:pr-6">
                                                            {task.due_at ? new Date(task.due_at).toLocaleDateString() : 'Tanpa batas'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Description & Departments */}
                    <div className="space-y-6">
                        <Card className="border-slate-200/80 shadow-xs dark:border-neutral-800">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold">Ringkasan & Deskripsi Proyek</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/50">
                                    <p className="text-foreground text-xs leading-relaxed whitespace-pre-wrap">
                                        {project.description || 'Tidak ada deskripsi rinci untuk proyek ini.'}
                                    </p>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold">
                                        <Building2 className="text-muted-foreground h-3.5 w-3.5" />
                                        Departemen Terlibat
                                    </h4>
                                    {project.departments && project.departments.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {project.departments.map((dept) => (
                                                <Badge key={dept.id} variant="secondary" className="text-xs">
                                                    {dept.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-xs">Semua departemen.</p>
                                    )}
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
                                        <Calendar className="text-muted-foreground h-3.5 w-3.5" />
                                        Jadwal Pelaksanaan
                                    </h4>
                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tanggal Mulai:</span>
                                            <span className="text-foreground font-medium">
                                                {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Belum ditentukan'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tenggat Selesai:</span>
                                            <span className="font-medium text-red-600 dark:text-red-400">
                                                {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Belum ditentukan'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Edit Project Dialog */}
                <EditProjectDialog
                    open={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    project={project}
                    departments={project.departments || departments}
                />

                {/* Create Task in Project Dialog */}
                <CreateTaskDialog
                    open={isCreateTaskModalOpen}
                    onOpenChange={setIsCreateTaskModalOpen}
                    projects={[project]}
                    users={users}
                    defaultProjectId={project.id}
                />

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Proyek Ini?</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus proyek "{project.name}"? Tugas-tugas di dalamnya tidak akan terhapus namun
                                asosiasinya dengan proyek ini akan dilepas.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteProject}>
                                Ya, Hapus Proyek
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
