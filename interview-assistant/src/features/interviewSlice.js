// interviewSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  completed: false,
  paused: false,
  finalScore: 0,
  timeLeft: 0,
  summary: "",
  pausedTimeLeft: null,
  resumeText: "",
};

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    setQuestions: (state, action) => {
      state.questions = action.payload;
      state.currentQuestionIndex = 0;
      state.completed = false;
      state.answers = [];
      state.finalScore = 0;
      state.summary = "";
    },
    setResumeText: (state, action) => {
      state.resumeText = action.payload;
    },
    submitAnswer: (state, action) => {
      state.answers.push(action.payload);
      state.currentQuestionIndex += 1;

      if (state.currentQuestionIndex >= state.questions.length) {
        state.completed = true;
        const totalScore = state.answers.reduce((sum, a) => sum + (a.score || 0), 0);
        state.finalScore = state.answers.length > 0 ? Math.round(totalScore / state.answers.length) : 0;
        state.summary = `You answered ${state.answers.length} questions.`;
      }
    },
    completeInterview: (state) => {
      state.completed = true;
      const totalScore = state.answers.reduce((sum, a) => sum + (a.score || 0), 0);
      state.finalScore = state.answers.length > 0 ? Math.round(totalScore / state.answers.length) : 0;
      state.summary = `You answered ${state.answers.length} questions.`;
    },
    resetInterview: (state) => {
      state.questions = [];
      state.currentQuestionIndex = 0;
      state.answers = [];
      state.completed = false;
      state.finalScore = 0;
      state.summary = "";
      state.resumeText = "";
    },
    pauseInterview: (state) => {
      state.paused = true;
    },
    resumeInterview: (state) => {
      state.paused = false;
    },
    nextQuestion: (state) => {
      if (state.currentQuestionIndex + 1 < state.questions.length) {
        state.currentQuestionIndex += 1;
      } else {
        state.completed = true;
      }
    },
    setPausedTimeLeft: (state, action) => {
      state.pausedTimeLeft = action.payload;
    },
    setTimeLeft: (state, action) => {
      state.timeLeft = action.payload;
    },
    // Define setProgress action
    setProgress: (state, action) => {
      const {
        currentQuestionIndex,
        answers,
        completed,
        finalScore,
        paused,
        timeLeft,
        summary,
      } = action.payload;
      state.currentQuestionIndex = currentQuestionIndex;
      state.answers = answers;
      state.completed = completed;
      state.finalScore = finalScore;
      state.paused = paused;
      state.timeLeft = timeLeft;
      state.summary = summary;
    },
  },
});

export const {
  setQuestions,
  setResumeText,
  submitAnswer,
  completeInterview,
  resetInterview,
  nextQuestion,
  pauseInterview,
  resumeInterview,
  setPausedTimeLeft,
  setTimeLeft,
  setProgress,  // Export the new action
} = interviewSlice.actions;

export default interviewSlice.reducer;
