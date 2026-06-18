"use client";
import { Toaster } from "sonner";
import { Provider as ReduxProvider } from "react-redux";
import { useNotificationNavigation } from "@/hooks/useNotificationNavigation";
import { store } from "@/store/store";
import "./globals.css"; // Ensure globals is imported here

export function Providers({ children }: { children: React.ReactNode }) {
  useNotificationNavigation();
  return (
    <>
      <ReduxProvider store={store}>
        {children}
        <Toaster 
          position="top-center"
        />
      </ReduxProvider>
    </>
  );
}
