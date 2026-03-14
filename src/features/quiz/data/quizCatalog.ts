import type { i18n as I18nType, TFunction } from 'i18next';

export type QuizQuestion = {
  id: string;
  module: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type QuizDefinition = {
  id: string;
  title: string;
  module: string;
  questions: QuizQuestion[];
};

export function getOrCreateQuiz(quizId: string | undefined, t: TFunction, i18n: I18nType): QuizDefinition {
  const fallbackId = quizId ?? 'Q1';
  const translationKey = `quizCatalog.${fallbackId}`;

  if (i18n.exists(translationKey)) {
    const quizData = t(translationKey, { returnObjects: true }) as Omit<QuizDefinition, 'id'>;

    return {
      id: fallbackId,
      title: quizData.title,
      module: quizData.module,
      questions: quizData.questions,
    };
  }

  return {
    id: fallbackId,
    title: t('quiz.fallback.title', { id: fallbackId }),
    module: t('quiz.fallback.module'),
    questions: [
      {
        id: `${fallbackId}-1`,
        module: t('quiz.fallback.module'),
        prompt: t('quiz.fallback.prompt'),
        options: t('quiz.fallback.options', { returnObjects: true }) as string[],
        correctIndex: 0,
      },
    ],
  };
}
