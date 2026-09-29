import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Department, Project } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: Project;
    departments: Department[];
}

export function EditProjectDialog({ open, onOpenChange, project, departments }: Props) {
    const initialDeptIds = project.departments ? project.departments.map((d) => d.id) : [];

    const { data, setData, patch, processing, errors, reset, clearErrors } = useForm({
        name: project.name || '',
        description: project.description || '',
        status: (project.status || 'active') as 'active' | 'completed' | 'archived',
        start_date: project.start_date ? project.start_date.substring(0, 10) : '',
        due_date: project.due_date ? project.due_date.substring(0, 10) : '',
        department_ids: initialDeptIds,
    });

    useEffect(() => {
        if (open) {
            setData({
                name: project.name || '',
                description: project.description || '',
                status: (project.status || 'active') as 'active' | 'completed' | 'archived',
                start_date: project.start_date ? project.start_date.substring(0, 10) : '',
                due_date: project.due_date ? project.due_date.substring(0, 10) : '',
                department_ids: project.departments ? project.departments.map((d) => d.id) : [],
            });
        }
    }, [open, project]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('projects.update', project.id), {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    const handleDepartmentToggle = (id: number, checked: boolean) => {
        if (checked) {
            setData('department_ids', [...data.department_ids, id]);
        } else {
            setData(
                'department_ids',
                data.department_ids.filter((depId) => depId !== id),
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Informasi Proyek</DialogTitle>
                        <DialogDescription>Perbarui detail proyek, jadwal waktu pengerjaan, dan departemen terkait.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">
                                Nama Proyek <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Nama proyek"
                                autoFocus
                            />
                            {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Deskripsi</Label>
                            <textarea
                                id="edit-description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Ringkasan tujuan proyek..."
                                rows={3}
                                className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:outline-hidden"
                            />
                            {errors.description && <p className="text-destructive text-xs">{errors.description}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-start_date">Tanggal Mulai</Label>
                                <Input
                                    id="edit-start_date"
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                />
                                {errors.start_date && <p className="text-destructive text-xs">{errors.start_date}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-due_date">Tenggat Selesai</Label>
                                <Input id="edit-due_date" type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} />
                                {errors.due_date && <p className="text-destructive text-xs">{errors.due_date}</p>}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-status">
                                Status Proyek <span className="text-red-500">*</span>
                            </Label>
                            <Select value={data.status} onValueChange={(val: 'active' | 'completed' | 'archived') => setData('status', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active (Sedang Berjalan)</SelectItem>
                                    <SelectItem value="completed">Completed (Selesai)</SelectItem>
                                    <SelectItem value="archived">Archived (Diarsipkan)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-destructive text-xs">{errors.status}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label>
                                Departemen Terkait <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-md border bg-slate-50/50 p-3 dark:bg-neutral-900/50">
                                {departments.map((dept) => (
                                    <div key={dept.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`edit-dept-${dept.id}`}
                                            checked={data.department_ids.includes(dept.id)}
                                            onCheckedChange={(checked) => handleDepartmentToggle(dept.id, checked as boolean)}
                                        />
                                        <Label htmlFor={`edit-dept-${dept.id}`} className="cursor-pointer text-xs font-normal">
                                            {dept.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            {errors.department_ids && <p className="text-destructive text-xs">{errors.department_ids}</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-red-600 font-semibold text-white hover:bg-red-700">
                            {processing ? 'Menyimpan...' : 'Perbarui Proyek'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
