import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Department, Project, type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CalendarIcon, LayoutGrid, List, Plus, Users } from 'lucide-react';
import { useState } from 'react';
import { CreateProjectDialog } from './components/create-project-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Projects',
        href: '/projects',
    },
];

interface Props {
    projects: Project[];
    departments: Department[];
}

export default function ProjectsIndex({ projects, departments }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const getStatusBadgeVariant = (status: Project['status']) => {
        switch (status) {
            case 'active':
                return 'default';
            case 'completed':
                return 'secondary';
            case 'archived':
                return 'outline';
            default:
                return 'default';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Projects" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                        <p className="text-muted-foreground">Manage and track all your organization's projects here.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center rounded-md border p-1">
                            <Button
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> New Project
                        </Button>
                    </div>
                </div>

                {projects.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
                        <div className="bg-muted mx-auto flex h-20 w-20 items-center justify-center rounded-full">
                            <Plus className="text-muted-foreground h-10 w-10" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No projects created</h3>
                        <p className="text-muted-foreground mt-2 mb-4 text-sm">You haven't created any projects yet. Start by creating a new one.</p>
                        <Button onClick={() => setIsCreateModalOpen(true)}>Create Project</Button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-4'}>
                        {projects.map((project) => (
                            <Link href={route('projects.show', project.id)} key={project.id} className="group block">
                                <Card className="hover:border-primary/50 h-full transition-all hover:shadow-md">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="group-hover:text-primary line-clamp-1 transition-colors">
                                                    {project.name}
                                                </CardTitle>
                                                <CardDescription className="line-clamp-2 min-h-[40px]">
                                                    {project.description || 'No description provided.'}
                                                </CardDescription>
                                            </div>
                                            <Badge variant={getStatusBadgeVariant(project.status)} className="capitalize">
                                                {project.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-muted-foreground flex flex-col gap-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 shrink-0" />
                                                <span className="truncate">
                                                    {project.departments && project.departments.length > 0
                                                        ? project.departments.map((d) => d.name).join(', ')
                                                        : 'No departments assigned'}
                                                </span>
                                            </div>
                                            {(project.start_date || project.due_date) && (
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="h-4 w-4 shrink-0" />
                                                    <span>
                                                        {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'} -{' '}
                                                        {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-muted/50 border-t px-6 py-3">
                                        <div className="text-muted-foreground flex w-full items-center justify-between text-xs">
                                            <span>Created by {project.creator?.name || 'Unknown'}</span>
                                            <span>{new Date(project.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                <CreateProjectDialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} departments={departments} />
            </div>
        </AppLayout>
    );
}
