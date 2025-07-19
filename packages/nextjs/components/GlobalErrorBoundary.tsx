"use client";

import { motion } from "framer-motion";
import { ErrorBoundary } from "react-error-boundary";

const ErrorFallback = ({ error }: { error: Error }) => {
  console.error("🔴 Global Error Capturado:", error);

  return (
    <motion.div
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.3 }}
      role="alert"
      aria-live="polite"
      className="bg-error text-error-content p-6 rounded-xl shadow-xl border border-error/30 max-w-md w-full mx-auto mt-10 animate-in fade-in slide-in-from-top-6 space-y-4"
    >
      <h2 className="font-bold text-lg">Se produjo un error inesperado 😓</h2>

      <pre className="text-sm font-mono whitespace-pre-wrap break-words max-h-40 overflow-auto bg-error/10 p-3 rounded-md">
        {error.message}
      </pre>

      <p className="text-sm text-error-content/80">
        Puedes intentar recargar la página o revisar la consola del navegador.
      </p>

      <div className="flex justify-end">
        <button onClick={() => window.location.reload()} className="btn btn-outline btn-sm">
          Recargar página
        </button>
      </div>
    </motion.div>
  );
};

export const GlobalErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error("🛑 Error reportado desde ErrorBoundary:", { error, info });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
