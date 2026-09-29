import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Department, Project, type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Briefcase, Building2, Calendar, CheckCircle2, LayoutGrid, List, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { CreateProjectDialog } from './components/create-project-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Projects',
        href: '/projects',
    },
];

interface Props {
    projects: (Project & { tasks_count?: number })[];
    departments: Department[];
}

export default function ProjectsIndex({ projects = [], departments = [] }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');

    const filteredProjects = projects.filter((p) => {
        const query = search.toLowerCase();
        return (
            p.name.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query)) ||
            (p.departments && p.departments.some((d) => d.name.toLowerCase().includes(query)))
        );
    });

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Proyek Operasional - SIPU Swiss-Belinn PKU" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Proyek Operasional</h1>
                        <p className="text-muted-foreground mt-0.5 text-sm">
                            Kelola proyek pemeliharaan unit, event perhotelan, dan program kerja lintas divisi.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-xl border border-slate-200/80 bg-white p-1 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                            <Button
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-red-600 font-semibold text-white hover:bg-red-700">
                            <Plus className="mr-1.5 h-4 w-4" /> Proyek Baru
                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-md">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        placeholder="Cari proyek atau departemen..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-white pl-9 text-xs shadow-2xs dark:bg-neutral-900"
                    />
                </div>

                {/* Projects Content */}
                {filteredProjects.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed p-16 text-center">
                        <Briefcase className="text-muted-foreground/40 mb-3 h-12 w-12" />
                        <h3 className="text-foreground text-base font-bold">Tidak Ada Proyek Ditemukan</h3>
                        <p className="text-muted-foreground mt-1 max-w-sm text-xs">
                            {search
                                ? 'Tidak ada proyek yang sesuai dengan kata kunci pencarian.'
                                : 'Belum ada proyek yang dibuat. Buat proyek pertama untuk mengelompokkan penugasan hotel.'}
                        </p>
                        <Button className="mt-4 bg-red-600 font-semibold text-white hover:bg-red-700" onClick={() => setIsCreateModalOpen(true)}>
                            <Plus className="mr-1.5 h-4 w-4" /> Buat Proyek Sekarang
                        </Button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredProjects.map((project) => (
                            <Link href={route('projects.show', project.id)} key={project.id} className="group block">
                                <Card className="flex h-full flex-col justify-between border-slate-200/80 transition-all hover:border-red-500/50 hover:shadow-md dark:border-neutral-800">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1">
                                                <CardTitle className="line-clamp-1 text-base font-bold transition-colors group-hover:text-red-600 dark:group-hover:text-red-400">
                                                    {project.name}
                                                </CardTitle>
                                                <CardDescription className="line-clamp-2 text-xs">
                                                    {project.description || 'Tidak ada deskripsi singkat.'}
                                                </CardDescription>
                                            </div>
                                            {getStatusBadge(project.status)}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 pb-4">
                                        {/* Departments */}
                                        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                            <Building2 className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate">
                                                {project.departments && project.departments.length > 0
                                                    ? project.departments.map((d) => d.name).join(', ')
                                                    : 'Semua Departemen'}
                                            </span>
                                        </div>

                                        {/* Dates */}
                                        {(project.start_date || project.due_date) && (
                                            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                                                <span>
                                                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'} -{' '}
                                                    {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                        )}

                                        {/* Task count pill */}
                                        <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-neutral-800 dark:text-neutral-300">
                                            <CheckCircle2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                                            <span>{project.tasks_count || 0} Tugas Terkait</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="border-t border-slate-100 bg-slate-50/70 px-6 py-3 dark:border-neutral-800 dark:bg-neutral-900/60">
                                        <div className="text-muted-foreground flex w-full items-center justify-between text-[11px]">
                                            <span>Oleh {project.creator?.name || 'Admin'}</span>
                                            <span>{new Date(project.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card className="border-slate-200/80 shadow-xs dark:border-neutral-800">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-muted-foreground border-b bg-slate-50 text-xs font-semibold uppercase dark:border-neutral-800 dark:bg-neutral-900">
                                        <tr>
                                            <th className="px-6 py-3">Nama Proyek</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Departemen</th>
                                            <th className="px-4 py-3 text-center">Jumlah Tugas</th>
                                            <th className="px-6 py-3 text-right">Tenggat Waktu</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                                        {filteredProjects.map((p) => (
                                            <tr key={p.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-neutral-800/40">
                                                <td className="px-6 py-4">
                                                    <Link
                                                        href={route('projects.show', p.id)}
                                                        className="text-foreground font-bold group-hover:text-red-600 hover:underline dark:group-hover:text-red-400"
                                                    >
                                                        {p.name}
                                                    </Link>
                                                    {p.description && (
                                                        <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">{p.description}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">{getStatusBadge(p.status)}</td>
                                                <td className="text-muted-foreground px-4 py-4 text-xs">
                                                    {p.departments?.map((d) => d.name).join(', ') || '-'}
                                                </td>
                                                <td className="px-4 py-4 text-center text-xs font-semibold">{p.tasks_count || 0}</td>
                                                <td className="text-muted-foreground px-6 py-4 text-right text-xs">
                                                    {p.due_date ? new Date(p.due_date).toLocaleDateString() : 'Tanpa batas'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Create Project Modal */}
                <CreateProjectDialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} departments={departments} />
            </div>
        </AppLayout>
    );
}
