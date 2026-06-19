const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function subscribeToPush(userId: string) {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }

        if (!PUBLIC_KEY) {
            throw new Error('VAPID public key is not configured');
        }

        console.log('[push] Starting subscription for user:', userId);
        const registration = await navigator.serviceWorker.ready;
        console.log('[push] Service worker ready:', registration);

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY),
        });

        console.log('[push] Push subscription created:', subscription.endpoint);

        // Send subscription to backend
        const res = await fetch('/api/v3/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, subscription }),
        });

        console.log('[push] Subscribe API response:', res.status);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(
                errorData.message || `Subscription failed with status ${res.status}`
            );
        }

        const data = await res.json();
        console.log('[push] Subscription successful:', data);
        return data;

    } catch (error) {
        console.error('[push] Subscription error:', error);
        
        // Clean up failed subscription from service worker
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
            }
        } catch (cleanupError) {
            console.error('[push] Cleanup error:', cleanupError);
        }

        throw error instanceof Error 
            ? error 
            : new Error('Failed to subscribe to push notifications');
    }
}

export async function unsubscribeFromPush(userId: string) {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }

        console.log('[push] Starting unsubscription for user:', userId);
        
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
            console.log('[push] No active subscription found');
            return;
        }

        console.log('[push] Removing subscription:', subscription.endpoint);

        // Unsubscribe from service worker
        await subscription.unsubscribe();
        console.log('[push] Service worker unsubscribed');

        // Notify backend to remove subscription
        const res = await fetch('/api/v3/notifications/unsubscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userId, 
                endpoint: subscription.endpoint 
            }),
        });

        console.log('[push] Unsubscribe API response:', res.status);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(
                errorData.message || `Unsubscription failed with status ${res.status}`
            );
        }

        const data = await res.json();
        console.log('[push] Unsubscription successful:', data);
        return data;

    } catch (error) {
        console.error('[push] Unsubscription error:', error);
        throw error instanceof Error 
            ? error 
            : new Error('Failed to unsubscribe from push notifications');
    }
}

export async function isPushSupported(): Promise<boolean> {
    return (
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    );
}