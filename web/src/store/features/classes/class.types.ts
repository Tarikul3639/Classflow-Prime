export const UpdateErrorField = {
    title: "title",
    type: "type",
    description: "description",
    date: "date",
    time: "time",
} as const;

export type UpdateErrorFieldType =
    typeof UpdateErrorField[keyof typeof UpdateErrorField];




/**
 * Faculty-related types and interfaces
 */

export interface ClassFaculty {
    facultyId: string;
    name: string;
    avatarUrl?: string;
    designation: string;
    location: string;
    email: string;
    phone?: string;
    classroomCode?: string;
    classroomInviteLink?: string;
}