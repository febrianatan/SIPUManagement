import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { Task, TaskActivity, TaskAttachment, TaskComment, type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Calendar,
    CheckCircle,
    CheckCircle2,
    ChevronLeft,
    Clock,
    Download,
    FileIcon,
    FileText,
    Flame,
    MessageSquare,
    Paperclip,
    Pencil,
    Send,
    ShieldCheck,
    Trash2,
    Upload,
    UserCheck,
    Users,
} from 'lucide-react';
import React, { FormEventHandler, useRef, useState } from 'react';

interface Props {
    task: Task;
    can: {
        edit: boolean;
        delete: boolean;
        update_status: boolean;
        comment: boolean;
        upload_attachment: boolean;
    };
    assignment: {
        is_assignee: boolean;
        acknowledged: boolean;
        acknowledged_at: string | null;
        can_acknowledge: boolean;
    };
    workflow: {
        requires_review: boolean;
        current_status: string;
        available_statuses: { value: string; label: string }[];
    };
    comments: TaskComment[];
    attachments: TaskAttachment[];
    activities: TaskActivity[];
}

export default function TaskShow({
    task,
    can = { edit: false, delete: false, update_status: false, comment: false, upload_attachment: false },
    assignment = { is_assignee: false, acknowledged: false, acknowledged_at: null, can_acknowledge: false },
    workflow = { requires_review: false, current_status: 'todo', available_statuses: [] },
    comments = [],
    attachments = [],
    activities = [],
}: Props) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isAcknowledging, setIsAcknowledging] = useState(false);
    const [updatingStatusTo, setUpdatingStatusTo] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Comment Form
    const commentForm = useForm({
        message: '',
    });

    // Attachment Form
    const attachmentForm = useForm({
        file: null as File | null,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tasks',
            href: '/tasks',
        },
        {
            title: task.title || task.name || `Task #${task.id}`,
            href: `/tasks/${task.id}`,
        },
    ];

    const handleAcknowledge = () => {
        setIsAcknowledging(true);
        router.patch(
            route('tasks.acknowledge', task.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsAcknowledging(false),
            },
        );
    };

    const handleUpdateStatus = (newStatus: string) => {
        setUpdatingStatusTo(newStatus);
        router.patch(
            route('tasks.status.update', task.id),
            { status: newStatus },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingStatusTo(null),
            },
        );
    };

    const handleDeleteTask = () => {
        router.delete(route('tasks.destroy', task.id));
    };

    const handleCommentSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!commentForm.data.message.trim()) return;

        commentForm.post(route('tasks.comments.store', task.id), {
            preserveScroll: true,
            onSuccess: () => commentForm.reset(),
        });
    };

    const handleDeleteComment = (commentId: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus komentar ini?')) return;
        router.delete(route('tasks.comments.destroy', [task.id, commentId]), {
            preserveScroll: true,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            attachmentForm.setData('file', selectedFile);

            const formData = new FormData();
            formData.append('file', selectedFile);

            router.post(route('tasks.attachments.store', task.id), formData, {
                preserveScroll: true,
                onSuccess: () => {
                    if (fileInputRef.current) fileInputRef.current.value = '';
                },
            });
        }
    };

    const handleDeleteAttachment = (attachmentId: number) => {
        if (!confirm('Hapus file lampiran ini?')) return;
        router.delete(route('tasks.attachments.destroy', [task.id, attachmentId]), {
            preserveScroll: true,
        });
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return (
                    <Badge variant="destructive" className="gap-1 font-semibold shadow-xs">
                        <Flame className="h-3.5 w-3.5" /> Urgent
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
                    <Badge className="gap-1 bg-emerald-600 font-semibold text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Selesai
                    </Badge>
                );
            case 'in_progress':
                return (
                    <Badge className="gap-1 bg-blue-600 font-semibold text-white">
                        <Clock className="h-3.5 w-3.5" /> In Progress
                    </Badge>
                );
            case 'review':
                return (
                    <Badge className="gap-1 bg-purple-600 font-semibold text-white">
                        <AlertCircle className="h-3.5 w-3.5" /> Menunggu Review
                    </Badge>
                );
            default:
                return <Badge variant="outline">To Do</Badge>;
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${task.title || task.name} - SIPU Swiss-Belinn PKU`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header Action Bar */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                        <Button variant="outline" size="icon" asChild className="mt-0.5 shrink-0">
                            <Link href={route('tasks.index')}>
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">{task.title || task.name}</h1>
                                {getPriorityBadge(task.priority)}
                                {getStatusBadge(task.status)}
                            </div>
                            <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-3 text-xs">
                                {task.project && (
                                    <Link
                                        href={route('projects.show', task.project.id)}
                                        className="font-medium text-slate-700 hover:underline dark:text-neutral-300"
                                    >
                                        Proyek: {task.project.name}
                                    </Link>
                                )}
                                <span>• Dibuat oleh {task.creator?.name || 'Admin'}</span>
                                <span>• {new Date(task.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Edit & Delete Buttons */}
                    <div className="flex items-center gap-2">
                        {can.edit && (
                            <Button asChild variant="outline" size="sm" className="gap-1.5">
                                <Link href={route('tasks.edit', task.id)}>
                                    <Pencil className="h-3.5 w-3.5" /> Edit Tugas
                                </Link>
                            </Button>
                        )}
                        {can.delete && (
                            <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => setIsDeleteDialogOpen(true)}>
                                <Trash2 className="h-3.5 w-3.5" /> Hapus
                            </Button>
                        )}
                    </div>
                </div>

                {/* Acknowledgment Alert Banner */}
                {assignment.can_acknowledge && (
                    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm dark:border-amber-800 dark:bg-amber-950/40">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div className="flex items-start gap-3">
                                <div className="shrink-0 rounded-full bg-amber-500/20 p-2 text-amber-700 dark:text-amber-300">
                                    <UserCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-amber-950 dark:text-amber-100">
                                        Konfirmasi Penerimaan Tugas (Acknowledgement) Diperlukan
                                    </h3>
                                    <p className="mt-0.5 max-w-xl text-xs text-amber-800 dark:text-amber-300/90">
                                        Tugas ini ditugaskan kepada Anda. Harap klik tombol di samping untuk menyatakan bahwa Anda telah menerima dan
                                        memahami instruksi kerja ini.
                                    </p>
                                </div>
                            </div>
                            <Button
                                disabled={isAcknowledging}
                                onClick={handleAcknowledge}
                                className="shrink-0 bg-amber-600 font-bold text-white shadow-xs hover:bg-amber-700"
                            >
                                <CheckCircle className="mr-1.5 h-4 w-4" />
                                {isAcknowledging ? 'Mengonfirmasi...' : 'Acknowledge Tugas Sekarang'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Main 2-Column Content Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column: Details, Attachments, Comments */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Task Description */}
                        <Card className="border-slate-200/80 shadow-xs dark:border-neutral-800">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base font-bold">
                                    <FileText className="text-muted-foreground h-4 w-4" /> Deskripsi & Rincian Tugas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
                                    <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                                        {task.description || 'Tidak ada deskripsi rinci yang disertakan.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Attachments Section */}
                        <Card className="border-slate-200/80 shadow-xs dark:border-neutral-800">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                                        <Paperclip className="text-muted-foreground h-4 w-4" /> Lampiran Dokumen & Foto ({attachments.length})
                                    </CardTitle>
                                    <CardDescription>File pendukung, foto sebelum/sesudah pengerjaan, atau form SOP</CardDescription>
                                </div>
                                {can.upload_attachment && (
                                    <div>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" id="file-upload" />
                                        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-1 text-xs">
                                            <Upload className="h-3.5 w-3.5" /> Upload File
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent>
                                {attachments.length === 0 ? (
                                    <div className="text-muted-foreground flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
                                        <Paperclip className="text-muted-foreground/40 mb-2 h-8 w-8" />
                                        <p className="text-xs">Belum ada lampiran file untuk tugas ini.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {attachments.map((file) => (
                                            <div
                                                key={file.id}
                                                className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-900/50"
                                            >
                                                <div className="flex items-center gap-2.5 overflow-hidden">
                                                    <div className="shrink-0 rounded-lg bg-red-100 p-2 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                                                        <FileIcon className="h-4 w-4" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-foreground truncate text-xs font-semibold" title={file.original_name}>
                                                            {file.original_name}
                                                        </p>
                                                        <p className="text-muted-foreground text-[10px]">
                                                            {formatBytes(file.size)} • {file.uploader?.name || 'Staf'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="ml-2 flex shrink-0 items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        className="text-muted-foreground hover:text-foreground h-8 w-8"
                                                        title="Download file"
                                                    >
                                                        <a href={route('tasks.attachments.download', [task.id, file.id])} download>
                                                            <Download className="h-3.5 w-3.5" />
                                                        </a>
                                                    </Button>
                                                    {file.can_delete && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteAttachment(file.id)}
                                                            className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                                                            title="Hapus file"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Discussion & Comments */}
                        <Card className="border-slate-200/80 shadow-xs dark:border-neutral-800">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base font-bold">
                                    <MessageSquare className="text-muted-foreground h-4 w-4" /> Diskusi & Catatan Progres ({comments.length})
                                </CardTitle>
                                <CardDescription>Komunikasi internal antar staf mengenai penugasan ini</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {comments.length === 0 ? (
                                    <div className="text-muted-foreground flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
                                        <MessageSquare className="text-muted-foreground/40 mb-2 h-8 w-8" />
                                        <p className="text-xs">Belum ada komentar. Tulis catatan pertama di bawah.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {comments.map((comment) => (
                                            <div
                                                key={comment.id}
                                                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900"
                                            >
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
                                                    {comment.user?.name ? comment.user.name.substring(0, 2).toUpperCase() : 'U'}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-semibold">{comment.user?.name || 'Staf'}</span>
                                                        <span className="text-muted-foreground text-[10px]">
                                                            {new Date(comment.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-foreground/90 text-xs leading-relaxed whitespace-pre-wrap">
                                                        {comment.message}
                                                    </p>
                                                </div>
                                                {comment.can_delete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="text-muted-foreground hover:text-destructive h-7 w-7"
                                                        title="Hapus komentar"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* New Comment Input */}
                                {can.comment && (
                                    <form onSubmit={handleCommentSubmit} className="pt-2">
                                        <div className="flex gap-2">
                                            <textarea
                                                value={commentForm.data.message}
                                                onChange={(e) => commentForm.setData('message', e.target.value)}
                                                placeholder="Tulis pesan atau update progres pengerjaan..."
                                                rows={2}
                                                className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-xl border bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
                                            />
                                            <Button
                                                type="submit"
                                                disabled={commentForm.processing || !commentForm.data.message.trim()}
                                                className="h-auto shrink-0 self-end bg-red-600 px-4 font-semibold text-white hover:bg-red-700"
                                            >
                                                <Send className="mr-1.5 h-3.5 w-3.5" /> Kirim
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Workflow Actions, Assignees, Dates, Activity */}
                    <div className="flex flex-col gap-6">
                        {/* Status Transition Action Card */}
                        <Card className="border-slate-200/80 shadow-xs dark:border-neutral-800">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                    <Clock className="text-muted-foreground h-4 w-4" /> Status & Alur Pengerjaan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-muted-foreground mb-1.5 text-xs">Status Saat Ini</p>
                                    <div>{getStatusBadge(task.status)}</div>
                                </div>

                                {task.requires_review && (
                                    <div className="flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50 p-2.5 text-xs text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400">
                                        <ShieldCheck className="h-4 w-4 shrink-0" />
                                        <span>Tugas ini memerlukan review supervisor sebelum selesai.</span>
                                    </div>
                                )}

                                {can.update_status && workflow.available_statuses.length > 0 && (
                                    <div>
                                        <p className="text-foreground mb-2 text-xs font-semibold">Pindahkan Status Ke:</p>
                                        <div className="flex flex-col gap-2">
                                            {workflow.available_statuses.map((option) => (
                                                <Button
                                                    key={option.value}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={updatingStatusTo !== null}
                                                    onClick={() => handleUpdateStatus(option.value)}
                                                    className="justify-between text-xs font-semibold hover:border-red-500 hover:text-red-600"
                                                >
                                                    <span>{option.label}</span>
                                                    {updatingStatusTo === option.value ? (
                                                        <span className="text-muted-foreground text-[10px]">Menyimpan...</span>
                                                    ) : (
                                                        <Clock className="text-muted-foreground h-3.5 w-3.5" />
                                                    )}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Assignees Card */}
                        <Card className="border-slate-200/80 shadow-xs dark:border-neutral-800">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                    <Users className="text-muted-foreground h-4 w-4" /> Penerima Tugas (Assignees)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {task.assignees && task.assignees.length > 0 ? (
                                    <div className="space-y-3">
                                        {task.assignees.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 dark:border-neutral-800 dark:bg-neutral-900/50"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-800 dark:bg-neutral-700 dark:text-neutral-200">
                                                        {user.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-foreground text-xs font-bold">{user.name}</p>
                                                        <p className="text-muted-foreground text-[10px]">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    {user.pivot?.acknowledged_at ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="gap-1 border-emerald-300 bg-emerald-50 text-[10px] text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                                        >
                                                            <CheckCircle2 className="h-3 w-3" /> Acknowledged
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-amber-300 bg-amber-50 text-[10px] text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                                        >
                                                            Pending
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-xs">Belum ada staf yang di-assign.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Dates & Timeline Meta */}
                        <Card className="border-slate-200/80 shadow-xs dark:border-neutral-800">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                    <Calendar className="text-muted-foreground h-4 w-4" /> Jadwal & Waktu
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs">
                                <div className="flex items-center justify-between border-b py-1">
                                    <span className="text-muted-foreground">Tanggal Dibuat</span>
                                    <span className="text-foreground font-semibold">{new Date(task.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center justify-between border-b py-1">
                                    <span className="text-muted-foreground">Batas Waktu (Due)</span>
                                    <span className="font-semibold text-red-600 dark:text-red-400">
                                        {task.due_at ? new Date(task.due_at).toLocaleDateString() : 'Tidak ditentukan'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-1">
                                    <span className="text-muted-foreground">Terakhir Diperbarui</span>
                                    <span className="text-foreground font-semibold">{new Date(task.updated_at).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Timeline */}
                        <Card className="border-slate-200/80 shadow-xs dark:border-neutral-800">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                    <Activity className="text-muted-foreground h-4 w-4" /> Riwayat Aktivitas ({activities.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {activities.length === 0 ? (
                                    <p className="text-muted-foreground py-4 text-center text-xs">Belum ada riwayat aktivitas.</p>
                                ) : (
                                    <div className="relative space-y-4 border-l-2 border-slate-200 pl-4 dark:border-neutral-800">
                                        {activities.map((act, index) => (
                                            <div key={act.id || index} className="relative">
                                                <div className="absolute top-1 -left-[21px] h-2.5 w-2.5 rounded-full bg-red-600 ring-4 ring-white dark:ring-neutral-900" />
                                                <p className="text-foreground text-xs font-semibold">{act.message}</p>
                                                <p className="text-muted-foreground mt-0.5 text-[10px]">
                                                    {new Date(act.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Tugas Ini?</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus tugas "{task.title || task.name}"? Tindakan ini tidak dapat dibatalkan dan semua
                                data komentar serta lampiran akan terhapus.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteTask}>
                                Ya, Hapus Tugas
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
