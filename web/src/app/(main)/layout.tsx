"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar/Sidebar";
import { BottomNavbar } from "@/components/layout/navbar/BottomNav";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { usePushNotification } from "@/hooks/usePushNotification";
import { meThunk } from "@/store/features/profile/thunks/fetch-user.thunk";
import { Loader } from "@/components/ui/Loader";
import { toast } from "sonner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.profile.fetchUser.status);
  const userId = useAppSelector((state) => state.profile.fetchUser.user?._id);

  // ── Push notification subscription ──────────────────────
  usePushNotification(userId ?? null);

  // On mount, fetch current user if not already authenticated
  useEffect(() => {
    dispatch(meThunk())
      .unwrap()
      .then((res) => {
        // if (res?.name) {
        //   toast.success(`Welcome back, ${res.name}!`, {
        //     position: "top-center",
        //   });
        // }
      })
      .catch((err) => {
        toast.error("Failed to fetch user data", {
          description: err,
          position: "top-center",
        }); // DEBUG: Show error message if fetch fails
      });
  }, [dispatch]);

  if (loading) {
    return <Loader />;
  }
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 w-full">{children}</main>

      {/* Mobile Bottom Navbar */}
      <BottomNavbar />
    </div>
  );
}
