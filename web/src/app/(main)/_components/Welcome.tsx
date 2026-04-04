import Link from "next/link";
import { User } from "lucide-react";

// Helper function - time based greeting
function getGreeting(): string {
    const hour = new Date().getHours();

    if (hour >= 4 && hour < 6) {
        return "Sunrise";
    } else if (hour >= 6 && hour < 12) {
        return "Good morning";
    } else if (hour >= 12 && hour < 15) {
        return "Good afternoon";
    } else if (hour >= 15 && hour < 18) {
        return "Good evening";
    } else if (hour >= 18 && hour < 20) {
        return "Sunset";
    } else if (hour >= 20 && hour < 24) {
        return "Good night";
    } else {
        return "Midnight";
    }
}

// Helper function - emoji based on time
function getGreetingEmoji(): string {
    const hour = new Date().getHours();

    if (hour >= 4 && hour < 6) {
        return "🌅"; // Sunrise
    } else if (hour >= 6 && hour < 12) {
        return "☀️"; // Morning
    } else if (hour >= 12 && hour < 15) {
        return "🌤️"; // Afternoon
    } else if (hour >= 15 && hour < 18) {
        return "🌇"; // Evening
    } else if (hour >= 18 && hour < 20) {
        return "🌆"; // Sunset
    } else if (hour >= 20 && hour < 24) {
        return "🌙"; // Night
    } else {
        return "🌌"; // Midnight
    }
}

export default function Welcome({ user }: { user: any }) {
    const greeting = getGreeting();
    const emoji = getGreetingEmoji();

    return (
        <div className="px-4 sm:px-6 pt-5 pb-1">
            <div className="bg-primary rounded-2xl px-5 py-5 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-5 -right-5 size-24 bg-white/5 rounded-full" />
                <div className="absolute -bottom-8 right-8 size-20 bg-white/5 rounded-full" />

                <p className="text-[11px] text-white/60 font-medium uppercase tracking-widest mb-1">
                    {greeting}
                </p>
                <h1 className="text-[22px] font-extrabold text-white leading-tight mb-2">
                    {user?.name} {emoji}
                </h1>
                <p className="text-[12px] text-white/70 leading-relaxed max-w-xs">
                    Stay on top of your classes, updates, and upcoming events today.
                </p>

                <Link href="profile" className="mt-4 inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/20 transition-colors text-white text-[11px] font-semibold px-3 py-1.5 rounded-full">
                    <User size={14} />
                    View Profile
                </Link>
            </div>
        </div>
    );
}