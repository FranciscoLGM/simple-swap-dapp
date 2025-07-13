import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

/**
 * Global error toast hook to display user-friendly messages
 * whenever an `error` changes. Prevents duplicate toasts.
 *
 * @param error - An error object, string, or null
 */
export const useGlobalErrorToast = (error: unknown) => {
  const lastErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!error) return;

    const message =
      error instanceof Error ? error.message : typeof error === "string" ? error : "Se produjo un error inesperado";

    // Prevent duplicate messages
    if (message === lastErrorRef.current) return;

    lastErrorRef.current = message;
    toast.error(message);
  }, [error]);
};
