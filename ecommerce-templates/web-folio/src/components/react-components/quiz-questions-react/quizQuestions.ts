// quizQuestions.ts
import { cmQuiz } from '../../../locale/cms-locale.json';

export interface Question {
  question: string;
  options: string[];
}

export interface QuizQuestions {
  title: string;
  subtitle: string;
  questions: Question[];
  modalTitle: string;
  modalSubtitle: string;
  buttonText: string;
  giftTitle: string;
  giftSubtitle: string;
}

// Привязка данных из JSON к интерфейсу QuizQuestions
export const quizQuestions: QuizQuestions = {
  title: cmQuiz.title.value,
  subtitle: cmQuiz.subtitle.value,
  questions: cmQuiz.questions.value,
  modalTitle: cmQuiz.modalTitle.value,
  modalSubtitle: cmQuiz.modalSubtitle.value,
  buttonText: cmQuiz.iconButtonGiftBox.value,
  giftTitle: cmQuiz.iconTitleGiftBox.value,
  giftSubtitle: cmQuiz.iconSubtitleGiftBox.value,
};

