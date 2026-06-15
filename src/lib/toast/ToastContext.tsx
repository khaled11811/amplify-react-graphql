"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

export type ToastType = "success" | "error";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
  leaving: boolean;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

export const DISPLAY_MS = 5000;
export const FADE_MS = 300;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, type, leaving: false }]);

    setTimeout(() => {
      setToasts((current) =>
        current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast))
      );

      setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, FADE_MS);
    }, DISPLAY_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            data-testid="toast"
            data-type={toast.type}
            className={`pointer-events-auto max-w-sm rounded-lg border px-4 py-3 text-sm shadow-md backdrop-blur-sm ${
              toast.type === "success"
                ? "border-green-300 bg-green-100/90 text-green-800"
                : "border-red-300 bg-red-100/90 text-red-800"
            } ${toast.leaving ? "animate-toast-out" : "animate-toast-in"}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
