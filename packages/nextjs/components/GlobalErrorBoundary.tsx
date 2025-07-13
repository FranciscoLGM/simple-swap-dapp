"use client";

import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="bg-error text-error-content p-4 rounded-xl">
      <h2 className="font-bold text-lg">Se produjo un error 😓</h2>
      <pre className="text-sm mt-2">{error.message}</pre>
    </div>
  );
}

export const GlobalErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>;
};
