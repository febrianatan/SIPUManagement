import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project, User } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projects: Project[];
    users: User[];
}

export function CreateTaskDialog({ open, onOpenChange, projects, users }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm({
        name: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
        project_id: '' as string | number,
        assignee_ids: [] as number[],
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        
        transform((data) => ({
            ...data,
            project_id: data.project_id === 'none' || data.project_id === '' ? null : data.project_id,
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
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>Assign a new task to team members. Fill out the details below.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Task Title</Label>
                            <Input id="title" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="E.g., Design new homepage" autoFocus />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="project_id">Project (Optional)</Label>
                            <Select value={data.project_id.toString()} onValueChange={(val) => setData('project_id', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a project" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Project</SelectItem>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id.toString()}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.project_id && <p className="text-sm text-destructive">{errors.project_id}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Task details and instructions"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo">To Do</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="review">Review</SelectItem>
                                        <SelectItem value="done">Done</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select value={data.priority} onValueChange={(val) => setData('priority', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.priority && <p className="text-sm text-destructive">{errors.priority}</p>}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="due_date">Due Date (Optional)</Label>
                            <Input id="due_date" type="datetime-local" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} />
                            {errors.due_date && <p className="text-sm text-destructive">{errors.due_date}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label>Assignees</Label>
                            <div className="grid grid-cols-2 gap-2 rounded-md border p-4 max-h-40 overflow-y-auto">
                                {users.map((user) => (
                                    <div key={user.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`user-${user.id}`}
                                            checked={data.assignee_ids.includes(user.id)}
                                            onCheckedChange={(checked) => handleAssigneeToggle(user.id, checked as boolean)}
                                        />
                                        <Label htmlFor={`user-${user.id}`} className="font-normal cursor-pointer line-clamp-1">
                                            {user.name}
                                        </Label>
                                    </div>
                                ))}
                                {users.length === 0 && <p className="text-sm text-muted-foreground col-span-2">No users found.</p>}
                            </div>
                            {errors.assignee_ids && <p className="text-sm text-destructive">{errors.assignee_ids}</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Create Task'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
