import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    role?: string;
    department_id?: number | null;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Department {
    id: number;
    name: string;
    code: string;
    created_at?: string;
    updated_at?: string;
}

export interface Project {
    id: number;
    name: string;
    description: string | null;
    status: 'active' | 'completed' | 'on_hold' | 'cancelled' | 'archived';
    created_by: number | null;
    start_date: string | null;
    due_date: string | null;
    created_at: string;
    updated_at: string;
    creator?: User;
    departments?: Department[];
    tasks?: Task[];
}

export interface Task {
    id: number;
    project_id: number;
    name: string;
    description: string | null;
    status: 'todo' | 'in_progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date: string | null;
    created_by: number | null;
    created_at: string;
    updated_at: string;
    project?: Project;
    creator?: User;
    assignees?: User[];
    departments?: Department[];
}
