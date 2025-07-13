/**
 * Convierte un error de Viem, EVM o JS en un mensaje legible.
 *
 * Prioridad:
 * 1. shortMessage (Viem)
 * 2. cause.message (encapsulado)
 * 3. message (Error JS)
 * 4. fallback genérico
 */
export const parseViemErrorToMessage = (error: unknown): string => {
  if (!error) return "Se produjo un error desconocido.";

  if (typeof error === "string") return error;

  if (error instanceof Error) {
    const viemError = error as any;
    if (viemError.shortMessage) return viemError.shortMessage;
    if (viemError.cause?.message) return viemError.cause.message;
    return error.message || "Ocurrió un error inesperado.";
  }

  return "Error no identificado.";
};
