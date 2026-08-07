export function createSessionId(): string {
  return `pilot-${crypto.randomUUID()}`;
}
