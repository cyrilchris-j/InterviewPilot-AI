import type { InterviewResponse } from "../types";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly requestId?: string;

  constructor(message: string, status: number, code?: string, requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

export async function interview(payload: Record<string, unknown>): Promise<InterviewResponse> {
  let response: Response;
  const baseUrl = import.meta.env.VITE_API_URL || "";
  try {
    response = await fetch(`${baseUrl}/api/interview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    throw new ApiError(
      "Could not reach the interview engine. Is the backend running?",
      0,
      "NETWORK_ERROR"
    );
  }

  let json: InterviewResponse;
  try {
    json = (await response.json()) as InterviewResponse;
  } catch {
    throw new ApiError(`Unexpected server response (HTTP ${response.status}).`, response.status, "BAD_RESPONSE");
  }

  if (!response.ok) {
    const error = (json as { error?: { code?: string; requestId?: string } }).error;
    throw new ApiError(json.reply || "Interview request failed", response.status, error?.code, error?.requestId);
  }
  return json;
}
