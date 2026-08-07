import type { InterviewResponse } from "../types";

export async function interview(payload: Record<string, unknown>): Promise<InterviewResponse> {
  const response = await fetch("/api/interview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const json = (await response.json()) as InterviewResponse;
  if (!response.ok) {
    throw new Error(json.reply || "Interview request failed");
  }
  return json;
}
