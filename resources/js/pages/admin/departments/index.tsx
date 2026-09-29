import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Department, type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Building2, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '#',
    },
    {
        title: 'Departments',
        href: '/admin/departments',
    },
];

interface Props {
    departments: (Department & { users_count?: number })[];
}

export default function DepartmentsIndex({ departments = [] }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
    const [deletingDepartment, setDeletingDepartment] = useState<(Department & { users_count?: number }) | null>(null);
    const [search, setSearch] = useState('');

    const createForm = useForm({
        name: '',
        code: '',
        description: '',
    });

    const editForm = useForm({
        name: '',
        code: '',
        description: '',
    });

    const handleCreateSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        createForm.post(route('admin.departments.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateModalOpen(false);
            },
        });
    };

    const handleOpenEdit = (dept: Department) => {
        setEditingDepartment(dept);
        editForm.setData({
            name: dept.name,
            code: dept.code || '',
            description: dept.description || '',
        });
    };

    const handleEditSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!editingDepartment) return;

        editForm.patch(route('admin.departments.update', editingDepartment.id), {
            onSuccess: () => {
                editForm.reset();
                setEditingDepartment(null);
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!deletingDepartment) return;
        router.delete(route('admin.departments.destroy', deletingDepartment.id), {
            onSuccess: () => setDeletingDepartment(null),
        });
    };

    const filteredDepartments = departments.filter((d) => {
        const query = search.toLowerCase();
        return (
            d.name.toLowerCase().includes(query) ||
            (d.code && d.code.toLowerCase().includes(query)) ||
            (d.description && d.description.toLowerCase().includes(query))
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Departemen - Admin SIPU" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Manajemen Departemen</h1>
                        <p className="text-muted-foreground mt-0.5 text-sm">
                            Kelola unit kerja hotel (Front Office, Housekeeping, F&B, Engineering, Sales, IT, dll).
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="bg-red-600 font-semibold text-white hover:bg-red-700">
                        <Plus className="mr-1.5 h-4 w-4" /> Tambah Departemen
                    </Button>
                </div>

                {/* Filter Toolbar */}
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <Input
                        placeholder="Cari nama departemen atau kode..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm bg-white text-xs shadow-2xs dark:bg-neutral-900"
                    />
                    <div className="text-muted-foreground text-xs">
                        Total: <span className="text-foreground font-bold">{departments.length}</span> divisi operasional
                    </div>
                </div>

                {/* Table Card */}
                <Card className="border-slate-200/80 shadow-xs dark:border-neutral-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base font-bold">
                            <Building2 className="text-muted-foreground h-4 w-4" /> Seluruh Departemen Hotel
                        </CardTitle>
                        <CardDescription>Unit kerja yang terintegrasi dalam alur penugasan dan kolaborasi proyek.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-neutral-900">
                                    <TableRow>
                                        <TableHead className="px-6 py-3">Nama Departemen</TableHead>
                                        <TableHead className="px-4 py-3">Kode</TableHead>
                                        <TableHead className="px-4 py-3">Deskripsi / Peran</TableHead>
                                        <TableHead className="px-4 py-3 text-center">Jumlah Anggota</TableHead>
                                        <TableHead className="px-6 py-3 text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDepartments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-muted-foreground h-32 text-center">
                                                Tidak ada departemen yang ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredDepartments.map((dept) => (
                                            <TableRow key={dept.id} className="hover:bg-slate-50/60 dark:hover:bg-neutral-800/40">
                                                <TableCell className="text-foreground px-6 py-3.5 font-semibold">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="rounded-lg bg-red-100 p-2 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                                                            <Building2 className="h-4 w-4" />
                                                        </div>
                                                        <span>{dept.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-3.5">
                                                    {dept.code ? (
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            {dept.code}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground max-w-xs truncate px-4 py-3.5 text-xs">
                                                    {dept.description || '-'}
                                                </TableCell>
                                                <TableCell className="px-4 py-3.5 text-center">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-neutral-800 dark:text-neutral-300">
                                                        <Users className="h-3 w-3 text-red-600 dark:text-red-400" />
                                                        {dept.users_count || 0} staf
                                                    </span>
                                                </TableCell>
                                                <TableCell className="space-x-1 px-6 py-3.5 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenEdit(dept)}
                                                        className="text-muted-foreground hover:text-foreground h-8 w-8"
                                                        title="Edit Departemen"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setDeletingDepartment(dept)}
                                                        className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                                                        title="Hapus Departemen"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Create Department Dialog */}
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogContent className="sm:max-w-[480px]">
                        <form onSubmit={handleCreateSubmit}>
                            <DialogHeader>
                                <DialogTitle>Tambah Departemen Baru</DialogTitle>
                                <DialogDescription>Tambahkan divisi atau departemen baru dalam struktur hotel.</DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="create-dept-name">
                                        Nama Departemen <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="create-dept-name"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="Contoh: Food & Beverage, Engineering"
                                        autoFocus
                                    />
                                    {createForm.errors.name && <p className="text-destructive text-xs">{createForm.errors.name}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="create-dept-code">Kode Singkatan</Label>
                                    <Input
                                        id="create-dept-code"
                                        value={createForm.data.code}
                                        onChange={(e) => createForm.setData('code', e.target.value)}
                                        placeholder="Contoh: FB, ENG, HK, FO"
                                    />
                                    {createForm.errors.code && <p className="text-destructive text-xs">{createForm.errors.code}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="create-dept-desc">Deskripsi</Label>
                                    <textarea
                                        id="create-dept-desc"
                                        value={createForm.data.description}
                                        onChange={(e) => createForm.setData('description', e.target.value)}
                                        placeholder="Uraian tugas pokok departemen..."
                                        rows={3}
                                        className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:outline-hidden"
                                    />
                                    {createForm.errors.description && <p className="text-destructive text-xs">{createForm.errors.description}</p>}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="bg-red-600 font-semibold text-white hover:bg-red-700"
                                >
                                    {createForm.processing ? 'Menyimpan...' : 'Simpan Departemen'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Department Dialog */}
                <Dialog open={editingDepartment !== null} onOpenChange={(open) => !open && setEditingDepartment(null)}>
                    <DialogContent className="sm:max-w-[480px]">
                        <form onSubmit={handleEditSubmit}>
                            <DialogHeader>
                                <DialogTitle>Edit Departemen</DialogTitle>
                                <DialogDescription>Perbarui nama, kode, atau keterangan departemen.</DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-dept-name">
                                        Nama Departemen <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="edit-dept-name"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        autoFocus
                                    />
                                    {editForm.errors.name && <p className="text-destructive text-xs">{editForm.errors.name}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-dept-code">Kode Singkatan</Label>
                                    <Input
                                        id="edit-dept-code"
                                        value={editForm.data.code}
                                        onChange={(e) => editForm.setData('code', e.target.value)}
                                    />
                                    {editForm.errors.code && <p className="text-destructive text-xs">{editForm.errors.code}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-dept-desc">Deskripsi</Label>
                                    <textarea
                                        id="edit-dept-desc"
                                        value={editForm.data.description}
                                        onChange={(e) => editForm.setData('description', e.target.value)}
                                        rows={3}
                                        className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:outline-hidden"
                                    />
                                    {editForm.errors.description && <p className="text-destructive text-xs">{editForm.errors.description}</p>}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditingDepartment(null)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={editForm.processing} className="bg-red-600 font-semibold text-white hover:bg-red-700">
                                    {editForm.processing ? 'Menyimpan...' : 'Perbarui Departemen'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Department Confirmation Dialog */}
                <Dialog open={deletingDepartment !== null} onOpenChange={(open) => !open && setDeletingDepartment(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Departemen?</DialogTitle>
                            <DialogDescription>
                                {(deletingDepartment?.users_count || 0) > 0 ? (
                                    <span className="text-destructive font-medium">
                                        Peringatan: Departemen "{deletingDepartment?.name}" masih memiliki {deletingDepartment?.users_count} staf
                                        terdaftar. Pindahkan staf ke departemen lain terlebih dahulu sebelum menghapus departemen ini.
                                    </span>
                                ) : (
                                    <span>
                                        Apakah Anda yakin ingin menghapus departemen "{deletingDepartment?.name}"? Tindakan ini tidak dapat
                                        dibatalkan.
                                    </span>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setDeletingDepartment(null)}>
                                Batal
                            </Button>
                            <Button variant="destructive" disabled={(deletingDepartment?.users_count || 0) > 0} onClick={handleDeleteSubmit}>
                                Ya, Hapus Departemen
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
