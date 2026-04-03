import { useState, useEffect } from 'react';
import { subscribeToPush, unsubscribeFromPush } from '@/lib/api/push';

export function usePushNotification(userId: string | null) {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check existing subscription on mount
    useEffect(() => {
        if (!userId) return;
        navigator.serviceWorker.ready.then((reg) => {
            reg.pushManager.getSubscription().then((sub) => {
                setIsSubscribed(!!sub);
            });
        });
    }, [userId]);

    const toggleNotification = async () => {
        setLoading(true);
        try {
            if (!userId) {
                throw new Error("User ID not available");
            }
            
            await navigator.serviceWorker.register('/sw-push.js');
            
            if (isSubscribed) {
                await unsubscribeFromPush(userId);
                setIsSubscribed(false);
            } else {
                await subscribeToPush(userId);
                setIsSubscribed(true);
            }
        } catch (err) {
            console.error("Push notification error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { isSubscribed, toggleNotification, loading };
}