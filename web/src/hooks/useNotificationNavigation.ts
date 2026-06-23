"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useNotificationNavigation() {
  const router = useRouter();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      const { type, url } = event.data || {};

      if (type === "NOTIFICATION_CLICK" && url) {
        // console.log("[Notification] Navigating to:", url);
        router.push(url);
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, [router]);
}