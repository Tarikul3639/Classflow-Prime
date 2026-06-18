import { Check, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { APP_CONFIG } from "@/config/app-config";

const STORAGE_KEY = "classflow_whats_new_seen";
const PUBLISH_DATE = "Jun 19, 2026";

interface WhatsNewDialogProps {
    open?: boolean;
    onClose?: () => void;
}

interface UpdateItem {
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    description: string;
    badge: 'New' | 'Improved' | 'Fixed' | 'Updated';
}

const BADGE_STYLES = {
    New: 'bg-green-50 text-green-800',
    Improved: 'bg-slate-100 text-blue-500',
    Fixed: 'bg-slate-100 text-red-500',
    Updated: 'bg-slate-100 text-yellow-500',
};

const updates: UpdateItem[] = [
    {
        icon: <Check size={15} strokeWidth={2.5} className="text-primary" />,
        iconBg: "bg-primary/10",
        title: "AI Agent system introduced",
        description:
            "Added a dedicated AI Agent system with secure API key authentication, scoped permissions, and class-specific access for automated classroom actions.",
        badge: "New",
    },

    {
        icon: <Check size={15} strokeWidth={2.5} className="text-blue-500" />,
        iconBg: "bg-blue-50",
        title: "Agent powered class updates",
        description:
            "AI Agents can now create class updates through dedicated endpoints using API keys with role-based permissions and class restrictions.",
        badge: "New",
    },

    {
        icon: <Check size={15} strokeWidth={2.5} className="text-purple-500" />,
        iconBg: "bg-purple-50",
        title: "Instructor ownership migrated",
        description:
            "Moved instructor ownership from the Class schema to Enrollment for a more flexible and scalable permission system supporting multiple roles.",
        badge: "Improved",
    },

    {
        icon: <Check size={15} strokeWidth={2.5} className="text-green-500" />,
        iconBg: "bg-green-50",
        title: "Backend API upgraded to v3",
        description:
            "Migrated backend APIs to version 3 with improved routing, Swagger documentation, cleaner guards, and a more maintainable architecture.",
        badge: "Improved",
    },

    {
        icon: <Check size={15} strokeWidth={2.5} className="text-yellow-500" />,
        iconBg: "bg-yellow-50",
        title: "Agent dashboard redesigned",
        description:
            "Redesigned the Agent dashboard with single-class selection, searchable class picker, simplified management, and Google AI Studio inspired API key experience.",
        badge: "Updated",
    },

    {
        icon: <Check size={15} strokeWidth={2.5} className="text-emerald-500" />,
        iconBg: "bg-emerald-50",
        title: "Authentication architecture simplified",
        description:
            "Removed hybrid authentication and introduced separate user and agent flows for better security, scalability, and easier maintenance.",
        badge: "Fixed",
    },
];

export function WhatsNewDialog({ open: externalOpen, onClose }: WhatsNewDialogProps) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const seen = localStorage.getItem(STORAGE_KEY);
        if (seen !== APP_CONFIG.version) {
            setOpen(true);
        }
    }, []);

    // If parent component controls open state, sync it
    useEffect(() => {
        if (externalOpen) setOpen(true);
    }, [externalOpen]);

    const handleClose = () => {
        localStorage.setItem(STORAGE_KEY, APP_CONFIG.version);
        setOpen(false);
        onClose?.();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 p-4 md:px-10 md:py-6 lg:px-20 lg:py-10">
            <div className="bg-slate-50 rounded-2xl border border-slate-300 w-full max-width-[440px] overflow-hidden py-2 px-0.5">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                            <Star size={16} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-950">What's new</p>
                            <p className="text-[11px] text-slate-500">ClassFlow v{APP_CONFIG.version}</p>
                        </div>
                    </div>
                    <span className="text-[11px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
                        Latest
                    </span>
                </div>

                {/* List */}
                <div className="divide-y divide-slate-200 max-h-80 overflow-y-auto">
                    {updates.map((item, i) => (
                        <div key={i} className="flex gap-3 px-5 py-3">
                            <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}>
                                {item.icon}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <p className="text-[13px] font-medium text-slate-900">{item.title}</p>
                                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${BADGE_STYLES[item.badge]}`}>
                                        {item.badge}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">Released {PUBLISH_DATE}</span>
                    <button
                        onClick={handleClose}
                        className="bg-primary text-white text-[13px] font-medium px-4 py-1.5 rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                        Got it
                    </button>
                </div>

            </div>
        </div>
    );
}