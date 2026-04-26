"use client";
import { Toaster } from "sonner";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store/store";
import "./globals.css"; // Ensure globals is imported here

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ReduxProvider store={store}>
        {children}
        <Toaster />
      </ReduxProvider>
    </>
  );
}
