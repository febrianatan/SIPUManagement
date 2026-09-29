import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Department, User, type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Building2, Plus, ShieldAlert, Trash2, UserCheck, UserCog, Users } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '#',
    },
    {
        title: 'Users',
        href: '/admin/users',
    },
];

interface Props {
    users: (User & { department?: Department })[];
    departments: Department[];
}

export default function UsersIndex({ users = [], departments = [] }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [search, setSearch] = useState('');

    // Form for creating a new user
    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        department_id: 'none',
        role: 'staff' as 'administrator' | 'staff',
    });

    // Form for updating an existing user
    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        department_id: 'none',
        role: 'staff' as 'administrator' | 'staff',
    });

    const handleCreateSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        createForm.transform((data) => ({
            ...data,
            department_id: data.department_id === 'none' || data.department_id === '' ? null : Number(data.department_id),
        }));

        createForm.post(route('admin.users.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateModalOpen(false);
            },
        });
    };

    const handleOpenEdit = (user: User) => {
        setEditingUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            department_id: user.department_id ? user.department_id.toString() : 'none',
            role: (user.role as 'administrator' | 'staff') || 'staff',
        });
    };

    const handleEditSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!editingUser) return;

        editForm.transform((data) => ({
            ...data,
            department_id: data.department_id === 'none' || data.department_id === '' ? null : Number(data.department_id),
            password: data.password || undefined,
            password_confirmation: data.password_confirmation || undefined,
        }));

        editForm.patch(route('admin.users.update', editingUser.id), {
            onSuccess: () => {
                editForm.reset();
                setEditingUser(null);
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!deletingUser) return;
        router.delete(route('admin.users.destroy', deletingUser.id), {
            onSuccess: () => setDeletingUser(null),
        });
    };

    const filteredUsers = users.filter((u) => {
        const query = search.toLowerCase();
        return (
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            (u.department && u.department.name.toLowerCase().includes(query)) ||
            (u.role && u.role.toLowerCase().includes(query))
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Pengguna - Admin SIPU" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Manajemen Staf & Pengguna</h1>
                        <p className="text-muted-foreground mt-0.5 text-sm">
                            Kelola data akun staf hotel Swiss-Belinn, penugasan departemen, dan hak akses sistem.
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="bg-red-600 font-semibold text-white hover:bg-red-700">
                        <Plus className="mr-1.5 h-4 w-4" /> Tambah Staf Baru
                    </Button>
                </div>

                {/* Filter and Stats */}
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <Input
                        placeholder="Cari nama staf, email, atau departemen..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm bg-white text-xs shadow-2xs dark:bg-neutral-900"
                    />
                    <div className="text-muted-foreground text-xs">
                        Total: <span className="text-foreground font-bold">{users.length}</span> staf terdaftar
                    </div>
                </div>

                {/* Table Card */}
                <Card className="border-slate-200/80 shadow-xs dark:border-neutral-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base font-bold">
                            <Users className="text-muted-foreground h-4 w-4" /> Seluruh Staf & Pengguna
                        </CardTitle>
                        <CardDescription>Daftar akun aktif yang memiliki akses ke portal operasional SIPU Swiss-Belinn.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-neutral-900">
                                    <TableRow>
                                        <TableHead className="px-6 py-3">Nama & Email</TableHead>
                                        <TableHead className="px-4 py-3">Departemen</TableHead>
                                        <TableHead className="px-4 py-3">Role Akses</TableHead>
                                        <TableHead className="px-4 py-3">Terdaftar Sejak</TableHead>
                                        <TableHead className="px-6 py-3 text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-muted-foreground h-32 text-center">
                                                Tidak ada staf yang ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-neutral-800/40">
                                                <TableCell className="px-6 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
                                                            {user.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="text-foreground text-sm font-semibold">{user.name}</div>
                                                            <div className="text-muted-foreground text-xs">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-3.5">
                                                    {user.department ? (
                                                        <Badge variant="outline" className="gap-1 text-xs font-normal">
                                                            <Building2 className="text-muted-foreground h-3 w-3" />
                                                            {user.department.name}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-4 py-3.5">
                                                    {user.role === 'administrator' ? (
                                                        <Badge className="gap-1 border-red-200 bg-red-100 text-[11px] font-semibold text-red-800 dark:bg-red-950/80 dark:text-red-300">
                                                            <ShieldAlert className="h-3 w-3" /> Administrator
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="gap-1 text-[11px]">
                                                            <UserCheck className="h-3 w-3" /> Staff
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground px-4 py-3.5 text-xs">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="space-x-1 px-6 py-3.5 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenEdit(user)}
                                                        className="text-muted-foreground hover:text-foreground h-8 w-8"
                                                        title="Edit Staf"
                                                    >
                                                        <UserCog className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setDeletingUser(user)}
                                                        className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                                                        title="Hapus Staf"
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

                {/* Create User Dialog */}
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <form onSubmit={handleCreateSubmit}>
                            <DialogHeader>
                                <DialogTitle>Tambah Staf Baru</DialogTitle>
                                <DialogDescription>Daftarkan akun staf baru untuk mengakses sistem penugasan hotel.</DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="create-name">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="create-name"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="Nama staf"
                                        autoFocus
                                    />
                                    {createForm.errors.name && <p className="text-destructive text-xs">{createForm.errors.name}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="create-email">
                                        Alamat Email <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="create-email"
                                        type="email"
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                        placeholder="staf@swiss-belinn.com"
                                    />
                                    {createForm.errors.email && <p className="text-destructive text-xs">{createForm.errors.email}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="create-role">
                                            Role Akses <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={createForm.data.role}
                                            onValueChange={(val: 'administrator' | 'staff') => createForm.setData('role', val)}
                                        >
                                            <SelectTrigger id="create-role">
                                                <SelectValue placeholder="Pilih role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="staff">Staff</SelectItem>
                                                <SelectItem value="administrator">Administrator</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {createForm.errors.role && <p className="text-destructive text-xs">{createForm.errors.role}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="create-dept">Departemen</Label>
                                        <Select
                                            value={createForm.data.department_id.toString()}
                                            onValueChange={(val) => createForm.setData('department_id', val)}
                                        >
                                            <SelectTrigger id="create-dept">
                                                <SelectValue placeholder="Pilih departemen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Tanpa Departemen</SelectItem>
                                                {departments.map((d) => (
                                                    <SelectItem key={d.id} value={d.id.toString()}>
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {createForm.errors.department_id && (
                                            <p className="text-destructive text-xs">{createForm.errors.department_id}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="create-password">
                                            Password <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="create-password"
                                            type="password"
                                            value={createForm.data.password}
                                            onChange={(e) => createForm.setData('password', e.target.value)}
                                            placeholder="Minimal 8 karakter"
                                        />
                                        {createForm.errors.password && <p className="text-destructive text-xs">{createForm.errors.password}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="create-password-confirmation">
                                            Konfirmasi Password <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="create-password-confirmation"
                                            type="password"
                                            value={createForm.data.password_confirmation}
                                            onChange={(e) => createForm.setData('password_confirmation', e.target.value)}
                                            placeholder="Ulangi password"
                                        />
                                    </div>
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
                                    {createForm.processing ? 'Menyimpan...' : 'Simpan Staf'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit User Dialog */}
                <Dialog open={editingUser !== null} onOpenChange={(open) => !open && setEditingUser(null)}>
                    <DialogContent className="sm:max-w-[500px]">
                        <form onSubmit={handleEditSubmit}>
                            <DialogHeader>
                                <DialogTitle>Edit Data Staf</DialogTitle>
                                <DialogDescription>
                                    Perbarui informasi akun, role, atau departemen staf. Kosongkan password jika tidak ingin mengubahnya.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="edit-name"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        autoFocus
                                    />
                                    {editForm.errors.name && <p className="text-destructive text-xs">{editForm.errors.name}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-email">
                                        Alamat Email <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                    />
                                    {editForm.errors.email && <p className="text-destructive text-xs">{editForm.errors.email}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-role">
                                            Role Akses <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={editForm.data.role}
                                            onValueChange={(val: 'administrator' | 'staff') => editForm.setData('role', val)}
                                        >
                                            <SelectTrigger id="edit-role">
                                                <SelectValue placeholder="Pilih role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="staff">Staff</SelectItem>
                                                <SelectItem value="administrator">Administrator</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {editForm.errors.role && <p className="text-destructive text-xs">{editForm.errors.role}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-dept">Departemen</Label>
                                        <Select
                                            value={editForm.data.department_id.toString()}
                                            onValueChange={(val) => editForm.setData('department_id', val)}
                                        >
                                            <SelectTrigger id="edit-dept">
                                                <SelectValue placeholder="Pilih departemen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Tanpa Departemen</SelectItem>
                                                {departments.map((d) => (
                                                    <SelectItem key={d.id} value={d.id.toString()}>
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {editForm.errors.department_id && <p className="text-destructive text-xs">{editForm.errors.department_id}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t pt-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-password">Password Baru (Opsional)</Label>
                                        <Input
                                            id="edit-password"
                                            type="password"
                                            value={editForm.data.password}
                                            onChange={(e) => editForm.setData('password', e.target.value)}
                                            placeholder="Kosongkan jika tak diubah"
                                        />
                                        {editForm.errors.password && <p className="text-destructive text-xs">{editForm.errors.password}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-password-confirmation">Ulangi Password</Label>
                                        <Input
                                            id="edit-password-confirmation"
                                            type="password"
                                            value={editForm.data.password_confirmation}
                                            onChange={(e) => editForm.setData('password_confirmation', e.target.value)}
                                            placeholder="Ulangi password baru"
                                        />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={editForm.processing} className="bg-red-600 font-semibold text-white hover:bg-red-700">
                                    {editForm.processing ? 'Menyimpan...' : 'Perbarui Staf'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deletingUser !== null} onOpenChange={(open) => !open && setDeletingUser(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Akun Staf?</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus akun staf "{deletingUser?.name}" ({deletingUser?.email})? Tindakan ini akan
                                menghapus akses staf ke sistem.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setDeletingUser(null)}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteSubmit}>
                                Ya, Hapus Staf
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
