import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Task, TaskFormData, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckSquare, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tasks',
        href: '/tasks',
    },
    {
        title: 'Buat Tugas',
        href: '/tasks/create',
    },
];

interface Props {
    formData: TaskFormData;
}

interface TaskCreateForm {
    [key: string]: any;
    title: string;
    description: string;
    priority: Task['priority'];
    due_at: string;
    project_id: string;
    requires_review: boolean;
    assignee_ids: number[];
}

export default function TaskCreate({ formData }: Props) {
    const { projects = [], assignees = [], options } = formData;

    const { data, setData, post, processing, errors, transform } = useForm<TaskCreateForm>({
        title: '',
        description: '',
        priority: 'medium',
        due_at: '',
        project_id: 'none',
        requires_review: false,
        assignee_ids: [],
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        transform((rawData) => ({
            ...rawData,
            project_id: rawData.project_id === 'none' || rawData.project_id === '' ? null : Number(rawData.project_id),
            due_at: rawData.due_at || null,
        }));

        post(route('tasks.store'));
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
            <Head title="Buat Tugas Baru - SIPU Swiss-Belinn PKU" />

            <div className="mx-auto flex h-full w-full max-w-4xl flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={route('tasks.index')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Buat Tugas Baru</h1>
                            <p className="text-muted-foreground mt-0.5 text-xs">Formulir pendelegasian instruksi kerja operasional hotel</p>
                        </div>
                    </div>
                </div>

                <Card className="border-slate-200/80 shadow-xs dark:border-neutral-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-bold">
                            <CheckSquare className="h-4 w-4 text-red-600 dark:text-red-400" />
                            Detail & Rincian Tugas
                        </CardTitle>
                        <CardDescription>Isi detail instruksi kerja, tentukan prioritas, dan pilih staf penerima penugasan.</CardDescription>
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
                                    placeholder="Contoh: Pembersihan AC Room 402, Setting Audio Ballroom Wedding"
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
                                    placeholder="Jelaskan secara rinci instruksi tugas, lokasi kamar/lantai, perlengkapan yang dibutuhkan, dsb..."
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
                                                id={`assignee-${user.id}`}
                                                checked={data.assignee_ids.includes(user.id)}
                                                onCheckedChange={(checked) => handleAssigneeToggle(user.id, checked as boolean)}
                                            />
                                            <Label
                                                htmlFor={`assignee-${user.id}`}
                                                className="flex cursor-pointer flex-col truncate text-xs font-normal"
                                            >
                                                <span className="text-foreground font-semibold">{user.name}</span>
                                                <span className="text-muted-foreground text-[10px]">{user.department?.name || user.role}</span>
                                            </Label>
                                        </div>
                                    ))}
                                    {assignees.length === 0 && (
                                        <p className="text-muted-foreground col-span-3 py-4 text-center text-xs">Tidak ada user staf ditemukan.</p>
                                    )}
                                </div>
                                {errors.assignee_ids && <p className="text-destructive text-xs">{errors.assignee_ids}</p>}
                            </div>

                            {/* Requires Review */}
                            <div className="bg-muted/20 flex items-center space-x-3 rounded-xl border p-4">
                                <Checkbox
                                    id="requires_review"
                                    checked={data.requires_review}
                                    onCheckedChange={(checked) => setData('requires_review', Boolean(checked))}
                                />
                                <div className="space-y-0.5">
                                    <Label htmlFor="requires_review" className="cursor-pointer text-sm font-semibold">
                                        Memerlukan Review Supervisor Sebelum Selesai
                                    </Label>
                                    <p className="text-muted-foreground text-xs">
                                        Jika dicentang, staf tidak dapat langsung mengubah status ke 'Done', melainkan masuk ke 'Review' terlebih
                                        dahulu.
                                    </p>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-3 border-t pt-4">
                                <Button asChild variant="outline">
                                    <Link href={route('tasks.index')}>Batal</Link>
                                </Button>
                                <Button type="submit" disabled={processing} className="gap-1.5 bg-red-600 font-semibold text-white hover:bg-red-700">
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan & Tugaskan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
