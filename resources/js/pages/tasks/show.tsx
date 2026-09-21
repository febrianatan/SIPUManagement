import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Task, type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, CalendarIcon, CheckCircle2, ChevronLeft, Circle, Clock, MessageSquare, Pencil, Trash2, Users } from 'lucide-react';

interface Props {
    task: Task & {
        comments?: any[];
        activities?: any[];
    };
}

export default function TaskShow({ task }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tasks',
            href: '/tasks',
        },
        {
            title: task.title,
            href: `/tasks/${task.id}`,
        },
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'todo':
                return <Circle className="h-4 w-4 text-muted-foreground" />;
            case 'in_progress':
                return <Clock className="h-4 w-4 text-blue-500" />;
            case 'review':
                return <AlertCircle className="h-4 w-4 text-amber-500" />;
            case 'done':
                return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            default:
                return <Circle className="h-4 w-4" />;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'low':
                return <Badge variant="outline" className="text-muted-foreground">Low</Badge>;
            case 'medium':
                return <Badge variant="secondary" className="text-blue-500">Medium</Badge>;
            case 'high':
                return <Badge variant="default" className="bg-amber-500 text-white">High</Badge>;
            case 'urgent':
                return <Badge variant="destructive">Urgent</Badge>;
            default:
                return <Badge variant="outline">{priority}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={task.title} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                        <Button variant="outline" size="icon" asChild className="mt-1">
                            <Link href="/tasks">
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
                                {getPriorityBadge(task.priority)}
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    {getStatusIcon(task.status)}
                                    <span className="capitalize">{task.status.replace('_', ' ')}</span>
                                </div>
                                {task.project && (
                                    <div className="flex items-center gap-1 border-l pl-4">
                                        <Link href={`/projects/${task.project.id}`} className="hover:underline hover:text-primary">
                                            Project: {task.project.name}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline">
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="md:col-span-2 flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Task Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                        {task.description || 'No description provided for this task.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Comments Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" /> Discussion
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg border-dashed">
                                    <p className="text-sm text-muted-foreground">
                                        No comments yet. Start the conversation!
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar / Metadata */}
                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        Assignees
                                    </h4>
                                    {task.assignees && task.assignees.length > 0 ? (
                                        <div className="space-y-3">
                                            {task.assignees.map((user) => (
                                                <div key={user.id} className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                                                        {user.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No assignees.</p>
                                    )}
                                </div>
                                
                                <Separator />

                                <div>
                                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                        Dates
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Created</span>
                                            <span className="font-medium">
                                                {new Date(task.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Due</span>
                                            <span className="font-medium text-destructive">
                                                {task.due_at ? new Date(task.due_at).toLocaleDateString() : 'No date'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <Separator />

                                <div>
                                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        Activity
                                    </h4>
                                    <div className="text-sm text-muted-foreground">
                                        Created by {task.creator?.name || 'Unknown'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
