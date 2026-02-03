
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  userAnswer?: number;
}

export interface QuizConfig {
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionCount: number;
  setNumber?: number;
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  date: string;
  topic: string;
  questions: Question[];
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  isCurrentUser?: boolean;
}

export enum View {
  MOCK_TEST = 'MOCK_TEST',
  STUDY_MATERIAL = 'STUDY_MATERIAL',
  CURRENT_AFFAIRS = 'CURRENT_AFFAIRS',
  LEADERBOARD = 'LEADERBOARD',
  LEVEL_SELECT = 'LEVEL_SELECT',
  SET_SELECT = 'SET_SELECT',
  TAKE_QUIZ = 'TAKE_QUIZ',
  SCIENCE_SELECT = 'SCIENCE_SELECT',
  RESULT = 'RESULT',
  REVIEW = 'REVIEW',
  DOC_VIEWER = 'DOC_VIEWER',
}
