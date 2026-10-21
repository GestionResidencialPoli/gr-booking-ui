import { ApiClientError } from "@gestionresidencial/auth-client";

export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError && error.body && typeof error.body === "object" && "error" in error.body) {
    const body = (error.body as { error?: { message?: string } }).error;
    if (body?.message) return body.message;
  }
  return fallback;
}

export function errorCode(error: unknown): string | undefined {
  if (error instanceof ApiClientError && error.body && typeof error.body === "object" && "error" in error.body) {
    return (error.body as { error?: { code?: string } }).error?.code;
  }
  return undefined;
}

export function errorDetails(error: unknown): Record<string, unknown> | undefined {
  if (error instanceof ApiClientError && error.body && typeof error.body === "object" && "error" in error.body) {
    return (error.body as { error?: { details?: Record<string, unknown> } }).error?.details;
  }
  return undefined;
}
