// quizQuestions.ts
import quizData from '../../../const/quiz/quiz.json';

export interface Question {
  question: string;
  options: string[];
}

export interface QuizQuestions {
  title: string;
  subtitle: string;
  questions: Question[];
}

// Привязка данных из JSON к интерфейсу QuizQuestions
export const quizQuestions: QuizQuestions = quizData;
