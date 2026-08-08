import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { InterviewScreen } from "./components/InterviewScreen";
import { Landing } from "./components/Landing";
import { Onboarding } from "./components/Onboarding";
import { AiAnalysis } from "./components/AiAnalysis";
import { ApiError, interview } from "./lib/api";
import { createSessionId } from "./lib/session";
import { matchCandidate, type UserProfile } from "./lib/profile";
import type { CandidateSummary, Feedback, InterviewResponse, TranscriptTurn } from "./types";

const AnalyticsDashboard = lazy(() =>
  import("./components/AnalyticsDashboard").then((mod) => ({ default: mod.AnalyticsDashboard }))
);
const FeedbackDashboard = lazy(() =>
  import("./components/FeedbackDashboard").then((mod) => ({ default: mod.FeedbackDashboard }))
);

type Phase = "landing" | "onboarding" | "analyzing" | "interview" | "feedback" | "analytics";

export default function App() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [candidates, setCandidates] = useState<CandidateSummary[]>([]);
  const [profile, setProfile] = useState<UserProfile>();
  const [sessionId, setSessionId] = useState(createSessionId());
  const [current, setCurrent] = useState<InterviewResponse>();
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [feedback, setFeedback] = useState<Feedback>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    interview({ action: "catalog" })
      .then((response) => {
        if (cancelled) return;
        setCandidates(response.candidates ?? []);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Could not load candidates.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeResponse = useMemo(() => current ?? { reply: "", done: false }, [current]);

  const start = async () => {
    if (!profile) return;
    setLoading(true);
    setError(undefined);

    const candidateId = matchCandidate(profile, candidates);

    try {
      const response = await interview({ sessionId, candidateId, profile });
      setCurrent(response);
      setTranscript([{ speaker: "pilot", text: response.reply }]);
      setPhase("interview");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start the interview.");
      setPhase("landing");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (answer: string) => {
    const message = answer.trim();
    if (loading || !message) return;
    setLoading(true);
    setError(undefined);
    const candidateTurn: TranscriptTurn = { speaker: "candidate", text: message };
    setTranscript((items) => [...items, candidateTurn]);
    try {
      const response = await interview({ sessionId, message });
      setCurrent(response);
      setTranscript((items) => [...items, { speaker: "pilot", text: response.reply }]);
      if (response.done && response.feedback) {
        setFeedback(response.feedback);
        setPhase("feedback");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send your answer.");
    } finally {
      setLoading(false);
    }
  };

  const restart = async () => {
    if (sessionId) {
      await interview({ sessionId, action: "reset" }).catch(() => undefined);
    }
    setCurrent(undefined);
    setTranscript([]);
    setFeedback(undefined);
    setProfile(undefined);
    setError(undefined);
    setSessionId(createSessionId());
    setPhase("landing");
  };

  if (phase === "analytics" && feedback) {
    return (
      <Suspense fallback={<div className="grid h-screen place-items-center text-muted-foreground">Loading analytics…</div>}>
        <AnalyticsDashboard feedback={feedback} transcript={transcript} onRestart={restart} />
      </Suspense>
    );
  }

  if (phase === "feedback" && feedback) {
    return (
      <Suspense fallback={<div className="grid h-screen place-items-center text-muted-foreground">Loading feedback…</div>}>
        <FeedbackDashboard feedback={feedback} transcript={transcript} onRestart={restart} onOpenAnalytics={() => setPhase("analytics")} profile={profile} />
      </Suspense>
    );
  }

  if (phase === "interview") {
    return (
      <InterviewScreen
        response={activeResponse}
        transcript={transcript}
        onSubmit={submit}
        onRestart={restart}
        loading={loading}
        error={error}
        profile={profile}
      />
    );
  }

  if (phase === "analyzing" && profile) {
    return (
      <AiAnalysis 
        profile={profile} 
        onReady={start}
      />
    );
  }

  if (phase === "onboarding") {
    return (
      <Onboarding 
        onComplete={(p) => {
          setProfile(p);
          setPhase("analyzing");
        }}
        onBack={() => setPhase("landing")}
      />
    );
  }

  return (
    <Landing
      onBegin={() => {
        if (candidates.length === 0) return; // Wait for catalog to load
        setPhase("onboarding");
      }}
    />
  );
}