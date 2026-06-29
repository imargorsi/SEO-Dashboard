export type ApiSuccessEnvelope<T> = {
  success: true;
  message: string | null;
  data: T;
};

export type ApiErrorEnvelope = {
  success: false;
  message: string;
  errors?: Record<string, string[] | string>;
};

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

export function isApiErrorEnvelope(body: unknown): body is ApiErrorEnvelope {
  return typeof body === "object" && body !== null && "success" in body && (body as ApiErrorEnvelope).success === false;
}
