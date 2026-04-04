
export enum GroupPlatform {
    WHATSAPP = 'WhatsApp',
    DISCORD = 'Discord',
    TELEGRAM = 'Telegram',
    FACEBOOK = 'Facebook',
    MESSENGER = 'Messenger',
    OTHER = 'Other',
}
export enum MaterialType {
    PDF = 'pdf',
    DOCX = 'docx',
    IMAGE = 'image',
    VIDEO = 'video',
    LINK = 'link',
}
export enum UpdateCategory {
    ANNOUNCEMENT = 'announcement',
    ASSIGNMENT = 'assignment',
    EXAM = 'exam',
    MATERIAL = 'material',
}
export enum ClassStatus {
    ACTIVE = 'active',
    ENDED = 'ended',
    UPCOMING = 'upcoming',
}

export interface DashboardClassItem {
    _id: string;
    name: string;
    department?: string;
    semester?: string;
    themeColor: string;
    coverImage?: string | null;
    status: ClassStatus;
    allowEnroll: boolean;
    instructorName: string;
    studentCount: number;
}

export interface DashboardMaterialItem {
    _id: string;
    url: string;
    name?: string;
    type: MaterialType;
    size?: number;
}

export interface DashboardUpdateItem {
    _id: string;
    classId: string;
    className: string;
    title: string;
    description?: string;
    category: UpdateCategory;
    eventAt?: string | null;
    materials: DashboardMaterialItem[];
    isPinned: boolean;
    postedBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface DashboardFacultyItem {
    _id: string;
    classId: string;
    name: string;
    avatarUrl?: string | null;
    designation: string;
    location: string;
    email: string;
    phone?: string | null;
    classroomCode?: string | null;
}

export interface DashboardGroupItem {
    _id: string;
    classId: string;
    name: string;
    description: string;
    link: string;
    platform: GroupPlatform;
    uiConfig?: {
        platformColor: string;
        platformBg: string;
        iconName: string;
    };
    memberCount: number;
}

export interface DashboardData {
    classes: DashboardClassItem[];
    updates: DashboardUpdateItem[];
    faculty: DashboardFacultyItem[];
    groups: DashboardGroupItem[];
}