
/**
 * Generic request status for async thunks.
 */
export interface IRequestStatus {
    loading: boolean;
    error: string | null;
    message: string | null;
}

/**
 * Status enum for class enrollment.
 */
export enum ClassStatus {
    ACTIVE = 'active',
    ENDED = 'ended',
    UPCOMING = 'upcoming',
}

/**
 * User model.
 */
export type IUser = {
    _id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    bio?: string;
    avatarUrl?: string;
    enrolledClasses: {
        classId: string;
        className: string;
        themeColor?: string;
        coverImage?: string;
        role: string;
        status: ClassStatus;
        enrolledAt: Date;
    }[];
};