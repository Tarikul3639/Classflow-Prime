import { MessageCircle, Radio, Send, Facebook, MessageSquare, Globe } from "lucide-react";

export enum GroupPlatform {
    WHATSAPP = 'WhatsApp',
    DISCORD = 'Discord',
    TELEGRAM = 'Telegram',
    FACEBOOK = 'Facebook',
    MESSENGER = 'Messenger',
    OTHER = 'Other',
}

export interface ClassGroup {
    groupId: string;
    name: string;
    description?: string;
    link: string;
    platform: GroupPlatform;
    uiConfig?: {
        platformColor: string;
        platformBg: string;
        iconName: string;
    };
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export const GROUP_PLATFORM_CONFIG: Record<
    GroupPlatform,
    {
        label: string;
        uiConfig: {
            platformColor: string;
            platformBg: string;
            iconName: string;
        };
        icon: any;
    }
> = {
    [GroupPlatform.WHATSAPP]: {
        label: "WhatsApp",
        uiConfig: {
            platformColor: "text-emerald-600",
            platformBg: "bg-emerald-50",
            iconName: "MessageCircle",
        },
        icon: MessageCircle,
    },

    [GroupPlatform.DISCORD]: {
        label: "Discord",
        uiConfig: {
            platformColor: "text-indigo-600",
            platformBg: "bg-indigo-50",
            iconName: "Radio",
        },
        icon: Radio,
    },

    [GroupPlatform.TELEGRAM]: {
        label: "Telegram",
        uiConfig: {
            platformColor: "text-sky-600",
            platformBg: "bg-sky-50",
            iconName: "Send",
        },
        icon: Send,
    },

    [GroupPlatform.FACEBOOK]: {
        label: "Facebook",
        uiConfig: {
            platformColor: "text-blue-600",
            platformBg: "bg-blue-50",
            iconName: "Facebook",
        },
        icon: Facebook,
    },

    [GroupPlatform.MESSENGER]: {
        label: "Messenger",
        uiConfig: {
            platformColor: "text-purple-600",
            platformBg: "bg-purple-50",
            iconName: "MessageSquare",
        },
        icon: MessageSquare,
    },

    [GroupPlatform.OTHER]: {
        label: "Other",
        uiConfig: {
            platformColor: "text-gray-600",
            platformBg: "bg-gray-50",
            iconName: "Globe",
        },
        icon: Globe,
    },
};