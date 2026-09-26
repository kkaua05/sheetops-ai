"use client";

/**
 * Lightweight toast notification system.
 *
 * A single ToastProvider (mounted once in the root layout) exposes `useToast`
 * for firing notifications from anywhere in the client tree, and renders the
 * stack itself. No external dependency — just state + CSS transitions.
 */

import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

type ToastInput = Omit<Toast, "id">;

interface ToastContextValue {
  toast: (input: ToastInput) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const VARIANT_ICON: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-primary/30 [&_svg]:text-primary",
  error: "border-destructive/30 [&_svg]:text-destructive",
  info: "border-border [&_svg]:text-muted-foreground",
};

const AUTO_DISMISS_MS = 5000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = React.useCallback(
    (input: ToastInput) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      setToasts((current) => [...current, { ...input, id }].slice(-4));
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
        role="region"
        aria-label="Notificações"
      >
        {toasts.map((item) => {
          const Icon = VARIANT_ICON[item.variant];
          return (
            <div
              key={item.id}
              role="status"
              className={cn(
                "animate-fade-up pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-card p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)]",
                VARIANT_STYLES[item.variant],
              )}
            >
              <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Fechar notificação"
                className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
