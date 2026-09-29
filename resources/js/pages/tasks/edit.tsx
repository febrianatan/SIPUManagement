import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Task, TaskFormData, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Edit3, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    task: Task;
    formData: TaskFormData;
}

export default function TaskEdit({ task, formData }: Props) {
    const { projects = [], assignees = [] } = formData;

    const initialAssigneeIds = task.assignees ? task.assignees.map((a) => a.id) : [];

    const formatDateTimeLocal = (dateStr: string | null) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const { data, setData, patch, processing, errors, transform } = useForm({
        title: task.title || task.name || '',
        description: task.description || '',
        priority: (task.priority || 'medium') as Task['priority'],
        due_at: formatDateTimeLocal(task.due_at || task.due_date || null),
        project_id: task.project_id ? task.project_id.toString() : 'none',
        requires_review: Boolean(task.requires_review),
        assignee_ids: initialAssigneeIds,
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
        {
            title: 'Edit',
            href: `/tasks/${task.id}/edit`,
        },
    ];

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        transform((rawData) => ({
            ...rawData,
            project_id: rawData.project_id === 'none' || rawData.project_id === '' ? null : Number(rawData.project_id),
            due_at: rawData.due_at || null,
        }));

        patch(route('tasks.update', task.id));
    };

    const handleAssigneeToggle = (id: number, checked: boolean) => {
        if (checked) {
            setData('assignee_ids', [...data.assignee_ids, id]);
        } else {
            setData(
                'assignee_ids',
                data.assignee_ids.filter((assigneeId) => assigneeId !== id),
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${task.title || task.name} - SIPU Swiss-Belinn PKU`} />

            <div className="mx-auto flex h-full w-full max-w-4xl flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={route('tasks.show', task.id)}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Edit Tugas</h1>
                            <p className="text-muted-foreground mt-0.5 text-xs">Perbarui instruksi, prioritas, tenggat, atau tim penerima tugas</p>
                        </div>
                    </div>
                </div>

                <Card className="border-slate-200/80 shadow-xs dark:border-neutral-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-bold">
                            <Edit3 className="h-4 w-4 text-red-600 dark:text-red-400" />
                            Informasi Tugas #{task.id}
                        </CardTitle>
                        <CardDescription>Perubahan akan dicatat secara otomatis dalam riwayat aktivitas tugas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-sm font-semibold">
                                    Judul Tugas <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Judul tugas"
                                    autoFocus
                                />
                                {errors.title && <p className="text-destructive text-xs">{errors.title}</p>}
                            </div>

                            {/* Project & Priority */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="project_id" className="text-sm font-semibold">
                                        Proyek (Opsional)
                                    </Label>
                                    <Select value={data.project_id.toString()} onValueChange={(val) => setData('project_id', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Proyek" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Tanpa Proyek Khusus</SelectItem>
                                            {projects.map((p) => (
                                                <SelectItem key={p.id} value={p.id.toString()}>
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.project_id && <p className="text-destructive text-xs">{errors.project_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="priority" className="text-sm font-semibold">
                                        Tingkat Prioritas <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.priority} onValueChange={(val) => setData('priority', val as Task['priority'])}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih prioritas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low (Rendah)</SelectItem>
                                            <SelectItem value="medium">Medium (Sedang)</SelectItem>
                                            <SelectItem value="high">High (Tinggi)</SelectItem>
                                            <SelectItem value="urgent">Urgent (Mendesak)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.priority && <p className="text-destructive text-xs">{errors.priority}</p>}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-semibold">
                                    Deskripsi & Petunjuk Kerja
                                </Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    placeholder="Jelaskan detail tugas..."
                                    className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[90px] w-full rounded-xl border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
                                />
                                {errors.description && <p className="text-destructive text-xs">{errors.description}</p>}
                            </div>

                            {/* Due Date */}
                            <div className="space-y-2">
                                <Label htmlFor="due_at" className="text-sm font-semibold">
                                    Batas Waktu (Tenggat)
                                </Label>
                                <Input id="due_at" type="datetime-local" value={data.due_at} onChange={(e) => setData('due_at', e.target.value)} />
                                {errors.due_at && <p className="text-destructive text-xs">{errors.due_at}</p>}
                            </div>

                            {/* Assignees */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-semibold">
                                        Penerima Tugas (Assignees) <span className="text-red-500">*</span>
                                    </Label>
                                    <span className="text-muted-foreground text-xs">Pilih minimal 1 orang staf</span>
                                </div>
                                <div className="grid max-h-56 grid-cols-1 gap-2.5 overflow-y-auto rounded-xl border bg-slate-50/50 p-4 sm:grid-cols-2 md:grid-cols-3 dark:bg-neutral-900/50">
                                    {assignees.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center space-x-2.5 rounded-lg border border-slate-200/60 bg-white p-2 transition-colors hover:border-red-500/50 dark:border-neutral-700/60 dark:bg-neutral-800/80"
                                        >
                                            <Checkbox
                                                id={`edit-assignee-${user.id}`}
                                                checked={data.assignee_ids.includes(user.id)}
                                                onCheckedChange={(checked) => handleAssigneeToggle(user.id, checked as boolean)}
                                            />
                                            <Label
                                                htmlFor={`edit-assignee-${user.id}`}
                                                className="flex cursor-pointer flex-col truncate text-xs font-normal"
                                            >
                                                <span className="text-foreground font-semibold">{user.name}</span>
                                                <span className="text-muted-foreground text-[10px]">{user.department?.name || user.role}</span>
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {errors.assignee_ids && <p className="text-destructive text-xs">{errors.assignee_ids}</p>}
                            </div>

                            {/* Requires Review */}
                            <div className="bg-muted/20 flex items-center space-x-3 rounded-xl border p-4">
                                <Checkbox
                                    id="edit_requires_review"
                                    checked={data.requires_review}
                                    onCheckedChange={(checked) => setData('requires_review', Boolean(checked))}
                                />
                                <div className="space-y-0.5">
                                    <Label htmlFor="edit_requires_review" className="cursor-pointer text-sm font-semibold">
                                        Memerlukan Review Supervisor Sebelum Selesai
                                    </Label>
                                    <p className="text-muted-foreground text-xs">
                                        Jika dicentang, staf tidak dapat langsung mengubah status ke 'Done'.
                                    </p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center justify-end gap-3 border-t pt-4">
                                <Button asChild variant="outline">
                                    <Link href={route('tasks.show', task.id)}>Batal</Link>
                                </Button>
                                <Button type="submit" disabled={processing} className="gap-1.5 bg-red-600 font-semibold text-white hover:bg-red-700">
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Menyimpan...' : 'Perbarui Tugas'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
