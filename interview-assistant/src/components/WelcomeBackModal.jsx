import React from "react";
import { useDispatch } from "react-redux";
import { setResumeText } from "../features/interviewSlice";

export default function WelcomeBackModal({
  isVisible,
  onClose,
  onContinue,
  candidateData,
}) {
  const dispatch = useDispatch();

  const handleContinue = () => {
    if (candidateData.resumeText) {
      dispatch(setResumeText(candidateData.resumeText));
    }
    onContinue();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Welcome Back!</h2>
        <p className="mb-4">
          You have an unfinished interview session. Would you like to continue
          where you left off?
        </p>
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Start New Interview
          </button>
          <button
            onClick={handleContinue}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Continue Interview
          </button>
        </div>
      </div>
    </div>
  );
}
