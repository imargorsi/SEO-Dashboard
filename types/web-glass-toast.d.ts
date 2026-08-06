declare module "@tarmiz/web-glass-toast" {
  import type { ReactNode } from "react";

  export type TGlassToastType = "success" | "error" | "info" | "warning" | "loading" | "custom";

  export type TGlassToastPosition =
    | "top-right"
    | "top-left"
    | "top-center"
    | "bottom-right"
    | "bottom-left"
    | "bottom-center";

  export type TGlassToastOptions = {
    id?: string;
    type?: TGlassToastType;
    position?: TGlassToastPosition;
    /** Auto-dismiss ms. `0` keeps the toast until dismissed. */
    duration?: number;
    gradient?: boolean;
    dismissible?: boolean;
    withIcon?: boolean;
    withProgressLine?: boolean;
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    icon?: ReactNode;
    action?: {
      label: string;
      onClick: () => void;
    };
  };

  export type TGlassToastApi = {
    (message: string, options?: TGlassToastOptions): string;
    success: (message: string, options?: TGlassToastOptions) => string;
    error: (message: string, options?: TGlassToastOptions) => string;
    info: (message: string, options?: TGlassToastOptions) => string;
    warning: (message: string, options?: TGlassToastOptions) => string;
    loading: (message: string, options?: TGlassToastOptions) => string;
    custom: (message: string, options?: TGlassToastOptions) => string;
    update: (id: string, updates: Partial<TGlassToastOptions> & { message?: string }) => void;
    dismiss: (id?: string) => void;
    pause: (id: string) => void;
    resume: (id: string) => void;
    promise: <T>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((value: T) => string);
        error: string | ((error: unknown) => string);
      },
      options?: TGlassToastOptions,
    ) => Promise<T>;
  };

  export const toast: TGlassToastApi;
  export function ToastContainer(): ReactNode;
  export function useToast(): {
    toast: TGlassToastApi;
    toasts: unknown[];
  };
}

declare module "@tarmiz/web-glass-toast/style.css";
