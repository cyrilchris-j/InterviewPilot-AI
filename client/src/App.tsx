import { useEffect, useMemo, useState } from "react";
import { FeedbackDashboard } from "./components/FeedbackDashboard";
import { InterviewScreen } from "./components/InterviewScreen";
import { Landing } from "./components/Landing";
import { interview } from "./lib/api";
import { createSessionId } from "./lib/session";
import type { CandidateSummary, Feedback, InterviewResponse, TranscriptTurn } from "./types";

export default function App() {
  const [phase, setPhase] = useState<"landing" | "interview" | "feedback">("landing");
  const [candidates, setCandidates] = useState<CandidateSummary[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [sessionId, setSessionId] = useState(createSessionId());
  const [current, setCurrent] = useState<InterviewResponse>();
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    interview({ action: "catalog" })
      .then((response) => {
        const loaded = response.candidates ?? [];
        setCandidates(loaded);
        setSelectedId(loaded[0]?.id ?? "");
      })
      .catch((error) => console.error(error));
  }, []);

  const activeResponse = useMemo(() => current ?? { reply: "", done: false }, [current]);

  const start = async () => {
    setLoading(true);
    try {
      const nextSession = createSessionId();
      setSessionId(nextSession);
      const response = await interview({ sessionId: nextSession, candidateId: selectedId });
      setCurrent(response);
      setTranscript([{ speaker: "pilot", text: response.reply }]);
      setPhase("interview");
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    const message = answer.trim();
    if (!message) return;
    setLoading(true);
    setAnswer("");
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
    setAnswer("");
    setFeedback(undefined);
    setSessionId(createSessionId());
    setPhase("landing");
  };

  if (phase === "feedback" && feedback) {
    return <FeedbackDashboard feedback={feedback} transcript={transcript} onRestart={restart} />;
  }

  if (phase === "interview") {
    return (
      <InterviewScreen
        response={activeResponse}
        transcript={transcript}
        answer={answer}
        setAnswer={setAnswer}
        onSubmit={submit}
        onRestart={restart}
        loading={loading}
      />
    );
  }

  return <Landing candidates={candidates} selectedId={selectedId} onSelect={setSelectedId} onStart={start} loading={loading} />;
}
