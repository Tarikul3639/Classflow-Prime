export const UpdateErrorField = {
    title: "title",
    type: "type",
    description: "description",
    date: "date",
    time: "time",
} as const;

export type UpdateErrorFieldType =
    typeof UpdateErrorField[keyof typeof UpdateErrorField];