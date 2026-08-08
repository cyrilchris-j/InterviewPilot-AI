import { useEffect, useMemo, useState } from "react";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { FeedbackDashboard } from "./components/FeedbackDashboard";
import { InterviewScreen } from "./components/InterviewScreen";
import { Landing } from "./components/Landing";
import { ApiError, interview } from "./lib/api";
import { createSessionId } from "./lib/session";
import type { CandidateSummary, Feedback, InterviewResponse, TranscriptTurn } from "./types";

type Phase = "landing" | "interview" | "feedback" | "analytics";

export default function App() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [candidates, setCandidates] = useState<CandidateSummary[]>([]);
  const [selectedId, setSelectedId] = useState("");
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
        const loaded = response.candidates ?? [];
        setCandidates(loaded);
        setSelectedId((current) => current || loaded[0]?.id || "");
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
    if (loading || !selectedId) return;
    setLoading(true);
    setError(undefined);
    try {
      const response = await interview({ sessionId, candidateId: selectedId });
      setCurrent(response);
      setTranscript([{ speaker: "pilot", text: response.reply }]);
      setPhase("interview");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start the interview.");
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
    setError(undefined);
    setSessionId(createSessionId());
    setPhase("landing");
  };

  if (phase === "analytics" && feedback) {
    return <AnalyticsDashboard feedback={feedback} transcript={transcript} onRestart={restart} />;
  }

  if (phase === "feedback" && feedback) {
    return (
      <FeedbackDashboard feedback={feedback} transcript={transcript} onRestart={restart} onOpenAnalytics={() => setPhase("analytics")} />
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
      />
    );
  }

  return (
    <Landing
      candidates={candidates}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onStart={start}
      loading={loading}
      error={error}
      onRetry={() => {
        setError(undefined);
        setLoading(true);
        interview({ action: "catalog" })
          .then((response) => {
            const loaded = response.candidates ?? [];
            setCandidates(loaded);
            setSelectedId((current) => current || loaded[0]?.id || "");
          })
          .catch((err: unknown) => setError(err instanceof ApiError ? err.message : "Could not load candidates."))
          .finally(() => setLoading(false));
      }}
    />
  );
}