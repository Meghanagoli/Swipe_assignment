import React, { useState, useEffect } from "react";
import ResumeUpload from "../components/ResumeUpload";
import InterviewChat from "../components/InterviewChat";
import WelcomeBackModal from "../components/WelcomeBackModal";
import { useSelector, useDispatch } from "react-redux";
import { resetInterview, pauseInterview, resumeInterview } from "../features/interviewSlice";

export default function Interviewee() {
  const dispatch = useDispatch();
  const { questions, completed, resumeText, paused } = useSelector(
    (state) => state.interview
  );
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  useEffect(() => {
    // Check if there's an unfinished session and it's paused
    if (questions.length > 0 && !completed && resumeText && paused) {
      setShowWelcomeBack(true);
    }
  }, [questions.length, completed, resumeText, paused]);

  const handleContinueInterview = () => {
    dispatch(resumeInterview()); // Resume the interview
    setShowWelcomeBack(false);
  };

  const handleStartNew = () => {
    dispatch(resetInterview());
    setShowWelcomeBack(false);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Interviewee Tab</h2>

      <WelcomeBackModal
        isVisible={showWelcomeBack}
        onClose={handleStartNew}
        onContinue={handleContinueInterview}
        candidateData={{ resumeText }}
      />

      {questions.length === 0 ? <ResumeUpload /> : <InterviewChat />}
    </div>
  );
}
