import {
    FileCode,
    ImageIcon,
    Link as LinkIcon,
    Megaphone,
    BookOpen,
    FlaskConical,
    BookMarked,
    FileText,
    type LucideIcon,
} from "lucide-react";

// ==================== Material ====================

export type MaterialType = "pdf" | "docx" | "image" | "link" | "video";

export interface MaterialConfig {
    icon: LucideIcon;
    label: string;
    color: string;
    bgColor: string;
}

export const MATERIAL_TYPE_CONFIG: Record<MaterialType, MaterialConfig> = {
    pdf: {
        icon: FileText,
        label: "PDF Document",
        color: "text-red-600",
        bgColor: "bg-red-50",
    },
    docx: {
        icon: FileCode,
        label: "Word File",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
    },
    image: {
        icon: ImageIcon,
        label: "Image / Photo",
        color: "text-purple-600",
        bgColor: "bg-purple-50",
    },
    link: {
        icon: LinkIcon,
        label: "External Link",
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
    },
    video: {
        icon: FileCode,
        label: "Video File",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
    },
};

// For file input accept attribute
export const MATERIAL_ACCEPT_MAP: Record<MaterialType, string> = {
    pdf: ".pdf",
    docx: ".doc,.docx",
    image: "image/*",
    video: "video/*",
    link: "", // no file upload
};

// ==================== Update Type ====================

export type UpdateCategory = "announcement" | "assignment" | "exam" | "material";

export interface UpdateCategoryConfig {
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
    label: string;
}

    export const UPDATE_TYPE_CONFIG: Record<UpdateCategory, UpdateCategoryConfig> = {
    announcement: {
        icon: Megaphone,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        label: "Announcement",
    },
    assignment: {
        icon: BookOpen,
        iconBg: "bg-blue-100",
        iconColor: "text-primary",
        label: "Assignment",
    },
    exam: {
        icon: FlaskConical,
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
        label: "Exam",
    },
    material: {
        icon: BookMarked,
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        label: "Material",
    },
};

// ==================== Material Model ====================

export interface Material {
    _id: string;
    name: string;
    size: number; // Size in bytes
    url: string;
    type: MaterialType;
}

// ==================== Create (Form) ====================

export interface CreateUpdateFormData {
    category: UpdateCategory;
    title: string;
    description: string;
    eventAt: string | null; // ISO string format
    materials: Material[];
}

// ==================== Fetch (API Response) ====================

export interface PostedBy {
    _id: string;
    name: string;
    avatarUrl: string | null;
}

export interface UpdateEngagement {
    avatars: string[];
    commentCount: number;
}

export interface ClassUpdateItem {
    _id: string;
    classId: string;
    category: UpdateCategory;
    title: string;
    description: string;
    isPinned: boolean;
    postedBy: PostedBy;
    eventAt: string | null;
    materials?: Material[];
    engagement?: UpdateEngagement;
    createdAt: string;
    updatedAt: string;
}