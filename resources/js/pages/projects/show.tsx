import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Project, type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CalendarIcon, ChevronLeft, Clock, Pencil, Trash2, Users } from 'lucide-react';

interface Props {
    project: Project;
}

export default function ProjectShow({ project }: Props) {
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
            <Head title={project.name} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                        <Button variant="outline" size="icon" asChild className="mt-1">
                            <Link href="/projects">
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                                <Badge variant={getStatusBadgeVariant(project.status)} className="px-3 py-1 text-sm capitalize">
                                    {project.status.replace('_', ' ')}
                                </Badge>
                            </div>
                            <div className="text-muted-foreground mt-2 flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span>By {project.creator?.name || 'Unknown'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline">
                            <Pencil className="mr-2 h-4 w-4" /> Edit Project
                        </Button>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="flex flex-col gap-6 md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Overview</CardTitle>
                                <CardDescription>Detailed information about the project</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="mb-2 text-sm font-semibold">Description</h4>
                                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {project.description || 'No description provided for this project.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Task List Placeholder (Can be a separate component later) */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Tasks</CardTitle>
                                    <CardDescription>Tasks associated with this project</CardDescription>
                                </div>
                                <Button size="sm">Add Task</Button>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                                    <h3 className="text-lg font-semibold">No tasks yet</h3>
                                    <p className="text-muted-foreground mt-2 text-sm">Create a task to get started on this project.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar / Metadata */}
                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                                        <CalendarIcon className="text-muted-foreground h-4 w-4" />
                                        Timeline
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Start Date</span>
                                            <span className="font-medium">
                                                {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Due Date</span>
                                            <span className="font-medium">
                                                {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not set'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                                        <Users className="text-muted-foreground h-4 w-4" />
                                        Assigned Departments
                                    </h4>
                                    {project.departments && project.departments.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {project.departments.map((dept) => (
                                                <Badge key={dept.id} variant="secondary">
                                                    {dept.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">No departments assigned.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
