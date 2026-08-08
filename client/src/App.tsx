import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { InterviewScreen } from "./components/InterviewScreen";
import { Landing } from "./components/Landing";
import { CandidateSelector } from "./components/CandidateSelector";
import { CandidateProfile } from "./components/CandidateProfile";
import { AiAnalysis } from "./components/AiAnalysis";
import { ApiError, interview } from "./lib/api";
import { createSessionId } from "./lib/session";
import type { CandidateDetail, Feedback, InterviewResponse, TranscriptTurn } from "./types";

const AnalyticsDashboard = lazy(() =>
  import("./components/AnalyticsDashboard").then((mod) => ({ default: mod.AnalyticsDashboard }))
);
const FeedbackDashboard = lazy(() =>
  import("./components/FeedbackDashboard").then((mod) => ({ default: mod.FeedbackDashboard }))
);

type Phase = "landing" | "selecting" | "profile" | "analyzing" | "interview" | "feedback" | "analytics";

export default function App() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [candidateDetails, setCandidateDetails] = useState<CandidateDetail[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDetail>();
  const [sessionId, setSessionId] = useState(createSessionId());
  const [current, setCurrent] = useState<InterviewResponse>();
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [feedback, setFeedback] = useState<Feedback>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  // Load candidate details on mount
  useEffect(() => {
    let cancelled = false;
    interview({ action: "catalog" })
      .then((response) => {
        if (cancelled) return;
        setCandidateDetails(response.candidateDetails ?? []);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Could not load candidates.");
      });
    return () => { cancelled = true; };
  }, []);

  const activeResponse = useMemo(() => current ?? { reply: "", done: false }, [current]);

  /** Start the interview for the selected candidate */
  const start = async () => {
    if (!selectedCandidate || loading) return;
    setLoading(true);
    setError(undefined);
    try {
      const response = await interview({ sessionId, candidateId: selectedCandidate.id });
      setCurrent(response);
      setTranscript([{ speaker: "pilot", text: response.reply }]);
      setPhase("interview");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start the interview.");
      setPhase("profile");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (answer: string) => {
    const message = answer.trim();
    if (loading || !message) return;
    setLoading(true);
    setError(undefined);
    setTranscript((items) => [...items, { speaker: "candidate", text: message }]);
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
    setError(undefined);
    setSelectedCandidate(undefined);
    setSessionId(createSessionId());
    setPhase("landing");
  };

  // ── Phase routing ──────────────────────────────────────────────────────────

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
        <FeedbackDashboard
          feedback={feedback}
          transcript={transcript}
          onRestart={restart}
          onOpenAnalytics={() => setPhase("analytics")}
          candidate={selectedCandidate}
        />
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
        candidate={selectedCandidate}
      />
    );
  }

  if (phase === "analyzing" && selectedCandidate) {
    return (
      <AiAnalysis
        candidate={selectedCandidate}
        onReady={start}
      />
    );
  }

  if (phase === "profile" && selectedCandidate) {
    return (
      <CandidateProfile
        candidate={selectedCandidate}
        onBegin={() => setPhase("analyzing")}
        onBack={() => setPhase("selecting")}
      />
    );
  }

  if (phase === "selecting") {
    return (
      <CandidateSelector
        candidates={candidateDetails}
        onSelect={(c) => {
          setSelectedCandidate(c);
          setPhase("profile");
        }}
        onBack={() => setPhase("landing")}
      />
    );
  }

  return (
    <Landing
      onBegin={() => setPhase("selecting")}
      candidateCount={candidateDetails.length || 20}
    />
  );
}