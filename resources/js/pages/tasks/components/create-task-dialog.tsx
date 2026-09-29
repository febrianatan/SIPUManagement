import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project, Task, User } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projects: Project[];
    users: (User & { department?: { name: string } })[];
    defaultProjectId?: number | null;
}

export function CreateTaskDialog({ open, onOpenChange, projects, users, defaultProjectId }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm({
        title: '',
        description: '',
        priority: 'medium' as Task['priority'],
        due_at: '',
        project_id: defaultProjectId ? defaultProjectId.toString() : 'none',
        requires_review: false as boolean,
        assignee_ids: [] as number[],
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        transform((formData) => ({
            ...formData,
            project_id: formData.project_id === 'none' || formData.project_id === '' ? null : Number(formData.project_id),
            due_at: formData.due_at || null,
        }));

        post(route('tasks.store'), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            reset();
            clearErrors();
        }
        onOpenChange(newOpen);
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
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Buat Tugas Baru</DialogTitle>
                        <DialogDescription>Distribusikan instruksi kerja kepada staf atau tim departemen Swiss-Belinn PKU.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title" className="font-semibold">
                                Judul Tugas <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Contoh: Perbaikan AC Kamar 304, Setup Banquet Grand Ballroom"
                                autoFocus
                            />
                            {errors.title && <p className="text-destructive text-xs">{errors.title}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="project_id" className="font-semibold">
                                    Proyek (Opsional)
                                </Label>
                                <Select value={data.project_id.toString()} onValueChange={(val) => setData('project_id', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Proyek" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Tanpa Proyek Khusus</SelectItem>
                                        {projects.map((project) => (
                                            <SelectItem key={project.id} value={project.id.toString()}>
                                                {project.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.project_id && <p className="text-destructive text-xs">{errors.project_id}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="priority" className="font-semibold">
                                    Prioritas <span className="text-red-500">*</span>
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

                        <div className="grid gap-2">
                            <Label htmlFor="description" className="font-semibold">
                                Deskripsi & Instruksi Kerja
                            </Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Rincian instruksi kerja, lokasi spesifik, atau catatan teknis..."
                                rows={3}
                                className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {errors.description && <p className="text-destructive text-xs">{errors.description}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="due_at" className="font-semibold">
                                Batas Waktu (Tenggat)
                            </Label>
                            <Input id="due_at" type="datetime-local" value={data.due_at} onChange={(e) => setData('due_at', e.target.value)} />
                            {errors.due_at && <p className="text-destructive text-xs">{errors.due_at}</p>}
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label className="font-semibold">
                                    Penerima Tugas (Assignees) <span className="text-red-500">*</span>
                                </Label>
                                <span className="text-muted-foreground text-xs">Pilih minimal 1 orang staf</span>
                            </div>
                            <div className="grid max-h-44 grid-cols-1 gap-2 overflow-y-auto rounded-xl border bg-slate-50/50 p-3 sm:grid-cols-2 dark:bg-neutral-900/50">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center space-x-2.5 rounded-lg p-1.5 transition-colors hover:bg-white dark:hover:bg-neutral-800"
                                    >
                                        <Checkbox
                                            id={`dialog-user-${user.id}`}
                                            checked={data.assignee_ids.includes(user.id)}
                                            onCheckedChange={(checked) => handleAssigneeToggle(user.id, checked as boolean)}
                                        />
                                        <Label
                                            htmlFor={`dialog-user-${user.id}`}
                                            className="flex cursor-pointer flex-col truncate text-xs font-normal"
                                        >
                                            <span className="text-foreground font-medium">{user.name}</span>
                                            {user.department && <span className="text-muted-foreground text-[10px]">{user.department.name}</span>}
                                        </Label>
                                    </div>
                                ))}
                                {users.length === 0 && (
                                    <p className="text-muted-foreground col-span-2 py-2 text-center text-xs">Tidak ada user staf ditemukan.</p>
                                )}
                            </div>
                            {errors.assignee_ids && <p className="text-destructive text-xs">{errors.assignee_ids}</p>}
                        </div>

                        <div className="bg-muted/30 flex items-center space-x-2 rounded-lg border p-3">
                            <Checkbox
                                id="requires_review"
                                checked={data.requires_review}
                                onCheckedChange={(checked) => setData('requires_review', Boolean(checked))}
                            />
                            <div className="space-y-0.5">
                                <Label htmlFor="requires_review" className="cursor-pointer text-xs font-semibold">
                                    Perlu Review Supervisor Sebelum Selesai
                                </Label>
                                <p className="text-muted-foreground text-[11px]">
                                    Tugas akan berpindah ke status 'Review' terlebih dahulu sebelum dapat diselesaikan ('Done').
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-red-600 font-semibold text-white hover:bg-red-700">
                            {processing ? 'Menyimpan...' : 'Simpan Tugas'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
