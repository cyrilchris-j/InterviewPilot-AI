import type { CandidateSummary } from "../types";

export type UserProfile = {
  role: string;
  experience: string;
  company: string;
  targetRole: string;
  interviewType: string;
  difficulty: string;
};

const EXP_MAP: Record<string, number> = {
  "0": 0,
  "1-2": 1.5,
  "3-5": 4,
  "5-10": 7,
  "10+": 12,
};

const ROLE_KEYWORDS: Record<string, string[]> = {
  "Student": [],
  "Fresh Graduate": [],
  "AI Engineer": ["ai", "ml", "machine learning", "data scientist", "data engineer"],
  "Frontend Developer": ["frontend", "ui", "react"],
  "Backend Developer": ["backend", "software engineer", "server"],
  "Full Stack": ["full stack", "fullstack", "software engineer"],
  "DevOps Engineer": ["devops", "platform", "infrastructure"],
  "Data Scientist": ["data scientist", "ml", "ai", "data engineer"],
  "Product Manager": ["product"],
};

/** Pick the best-matching candidate from the catalog for the given user profile. */
export function matchCandidate(
  profile: UserProfile,
  candidates: CandidateSummary[]
): string {
  if (!candidates.length) return "";

  const targetExp = EXP_MAP[profile.experience] ?? 3;
  const keywords = (ROLE_KEYWORDS[profile.role] ?? []).map((k) => k.toLowerCase());

  let bestId = candidates[0].id;
  let bestScore = -Infinity;

  for (const c of candidates) {
    let score = 0;

    // Experience proximity (closer = more points)
    const diff = Math.abs(c.yearsExperience - targetExp);
    score += diff === 0 ? 6 : diff <= 2 ? 4 : diff <= 4 ? 2 : 0;

    // Role keyword match
    const roleText = c.role.toLowerCase();
    if (keywords.some((k) => roleText.includes(k))) score += 6;

    // Prefer candidates with solid but not perfect first-try ratio
    const ratio = c.firstTry / Math.max(c.completed, 1);
    score += ratio >= 0.5 && ratio <= 0.9 ? 2 : 0;

    if (score > bestScore) {
      bestScore = score;
      bestId = c.id;
    }
  }

  return bestId;
}
