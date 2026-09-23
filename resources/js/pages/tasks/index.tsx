import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Project, Task, User, type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, Calendar, CheckCircle2, CheckSquare, Circle, Clock, Plus } from 'lucide-react';
import { useState } from 'react';
import { CreateTaskDialog } from './components/create-task-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tasks',
        href: '/tasks',
    },
];

interface Props {
    tasks: Task[];
    projects: Project[];
    users: User[];
}

export default function TasksIndex({ tasks, projects, users }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
                return <Badge variant="default" className="bg-amber-500 text-white hover:bg-amber-600">High</Badge>;
            case 'urgent':
                return <Badge variant="destructive">Urgent</Badge>;
            default:
                return <Badge variant="outline">{priority}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tasks" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                        <p className="text-muted-foreground">Manage your assignments and team workflow.</p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> New Task
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>All Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <CheckSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-semibold">No tasks found</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                    You have no tasks assigned to you or your team. Create one to get started.
                                </p>
                                <Button className="mt-4" onClick={() => setIsCreateModalOpen(true)}>Create Task</Button>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <div className="grid grid-cols-12 gap-4 border-b bg-muted/50 p-4 text-sm font-medium text-muted-foreground">
                                    <div className="col-span-5 md:col-span-6">Title</div>
                                    <div className="col-span-3 md:col-span-2 text-center">Status</div>
                                    <div className="col-span-2 hidden md:block text-center">Priority</div>
                                    <div className="col-span-4 md:col-span-2 text-right">Due Date</div>
                                </div>
                                <div className="divide-y">
                                    {tasks.map((task) => (
                                        <Link
                                            href={route('tasks.show', task.id)}
                                            key={task.id}
                                            className="grid grid-cols-12 items-center gap-4 p-4 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="col-span-5 md:col-span-6">
                                                <span className="font-medium hover:underline">{task.name}</span>
                                                {task.project && (
                                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                                        Project: {task.project.name}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="col-span-3 md:col-span-2 flex items-center justify-center gap-2">
                                                {getStatusIcon(task.status)}
                                                <span className="text-sm capitalize hidden sm:inline-block">
                                                    {task.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="col-span-2 hidden md:flex items-center justify-center">
                                                {getPriorityBadge(task.priority)}
                                            </div>
                                            <div className="col-span-4 md:col-span-2 flex items-center justify-end text-sm text-muted-foreground gap-1.5">
                                                {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                
                <CreateTaskDialog 
                    open={isCreateModalOpen} 
                    onOpenChange={setIsCreateModalOpen} 
                    projects={projects} 
                    users={users} 
                />
            </div>
        </AppLayout>
    );
}


