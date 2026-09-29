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
    flash?: {
        success?: string;
        error?: string;
    };
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
    role?: 'administrator' | 'staff' | string;
    department_id?: number | null;
    department?: Department;
    pivot?: {
        acknowledged_at: string | null;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

export interface Department {
    id: number;
    name: string;
    code?: string;
    description?: string | null;
    users_count?: number;
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
    tasks_count?: number;
}

export interface Task {
    id: number;
    project_id: number | null;
    created_by: number | null;
    title: string;
    name?: string; // fallback alias for backward-compatibility
    description: string | null;
    status: 'todo' | 'in_progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_at: string | null;
    due_date?: string | null; // fallback alias for backward-compatibility
    requires_review: boolean;
    created_at: string;
    updated_at: string;
    project?: {
        id: number;
        name: string;
    } | null;
    creator?: {
        id: number;
        name: string;
        email: string;
    } | null;
    assignees?: (User & {
        pivot?: {
            acknowledged_at: string | null;
        };
    })[];
    departments?: Department[];
}

export interface TaskComment {
    id: number;
    message: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    can_delete: boolean;
}

export interface TaskAttachment {
    id: number;
    original_name: string;
    mime_type: string;
    size: number;
    created_at: string;
    uploader: {
        id: number;
        name: string;
        email: string;
    };
    can_delete: boolean;
}

export interface TaskActivity {
    id: number;
    action: string;
    actor: {
        id: number | null;
        name: string;
    };
    message: string;
    metadata?: Record<string, unknown> | null;
    created_at: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

export interface DashboardStats {
    my_tasks: number;
    pending_acknowledgement: number;
    in_progress: number;
    urgent: number;
    overdue: number;
    created_by_me: number;
    active_projects: number;
}

export interface TaskFilterOptions {
    statuses: { value: string; label: string }[];
    priorities: { value: string; label: string }[];
    acknowledgements: { value: string; label: string }[];
    due: { value: string; label: string }[];
}

export interface TaskFormData {
    projects: { id: number; name: string; status: string; due_date: string | null }[];
    assignees: (User & { department?: Department })[];
    options: {
        priorities: { value: string; label: string }[];
        initial_status: string;
        review: { value: boolean; label: string }[];
    };
}
