import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { getApiBaseUrl, getModules, getQuizByCode, QuizSubmitResult, submitQuizAnswers } from '../../../lib/api';
import { markQuizCompleted } from '../../../lib/learningProgress';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { ModulesStackParamList } from '../../../navigation/types';
import { getOrCreateQuiz } from '../data/quizCatalog';

type QuizScreenProps = {
  token?: string;
  userId: string;
};

type LocalQuestion = {
  id: string;
  module: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

type LocalQuiz = {
  id: string;
  title: string;
  module: string;
  questions: LocalQuestion[];
};

function buildAnswerExplanation(
  question: LocalQuestion,
  selectedIndex: number,
  t: (key: string, options?: Record<string, unknown>) => string
) {
  const correctOption = question.options[question.correctIndex];
  const selectedOption = question.options[selectedIndex];
  const isCorrect = selectedIndex === question.correctIndex;

  if (isCorrect) {
    return t('answerExplanation.correct', { correctOption });
  }

  return t('answerExplanation.wrong', { selectedOption, correctOption });
}

export function QuizScreen({ token, userId }: QuizScreenProps) {
  const { t, i18n } = useTranslation();
  const tQuiz = (key: string, options?: Record<string, unknown>) => t(`quiz.${key}`, options);

  const navigation = useNavigation<NativeStackNavigationProp<ModulesStackParamList>>();
  const route = useRoute<RouteProp<ModulesStackParamList, 'QuizDetails'>>();
  const requestedQuizId = route.params?.quizId ?? 'Q1';
  const submissionStartedRef = useRef(false);

  const [quizDefinition, setQuizDefinition] = useState<LocalQuiz>(() => getOrCreateQuiz(requestedQuizId, t, i18n));
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [submissionState, setSubmissionState] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [submissionResult, setSubmissionResult] = useState<QuizSubmitResult | null>(null);
  const [nextQuiz, setNextQuiz] = useState<{ code: string; title: string } | null>(null);

  const currentQuestion = quizDefinition.questions[currentIndex];
  const selectedForCurrent = currentQuestion ? selectedAnswers[currentQuestion.id] : undefined;
  const isLastQuestion = currentIndex === quizDefinition.questions.length - 1;
  const answeredCount = Object.keys(selectedAnswers).length;
  const isCurrentAnswerCorrect = currentQuestion ? selectedForCurrent === currentQuestion.correctIndex : false;
  const currentExplanation =
    currentQuestion !== undefined && selectedForCurrent !== undefined
      ? buildAnswerExplanation(currentQuestion, selectedForCurrent, (key, options) => tQuiz(key, options))
      : null;

  const score = useMemo(
    () =>
      quizDefinition.questions.reduce((acc, question) => {
        return selectedAnswers[question.id] === question.correctIndex ? acc + 1 : acc;
      }, 0),
    [quizDefinition.questions, selectedAnswers]
  );

  const progress = quizDefinition.questions.length
    ? Math.round((answeredCount / quizDefinition.questions.length) * 100)
    : 0;
  const successRate = quizDefinition.questions.length
    ? Math.round((score / quizDefinition.questions.length) * 100)
    : 0;

  useEffect(() => {
    let isMounted = true;

    async function loadQuiz() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [quiz, modules] = await Promise.all([getQuizByCode(requestedQuizId), getModules()]);
        if (!isMounted) {
          return;
        }

        setQuizDefinition({
          id: quiz.code,
          title: quiz.title,
          module: quiz.module.title,
          questions: quiz.questions.map((question) => ({
            id: question.code,
            module: quiz.module.title,
            prompt: question.prompt,
            options: question.options,
            correctIndex: question.correctIdx,
          })),
        });

        const sameModule = modules.find((moduleItem) => moduleItem.code === quiz.module.code);
        if (!sameModule) {
          setNextQuiz(null);
          return;
        }

        const orderedQuizzes = [...sameModule.quizzes].sort((first, second) =>
          first.code.localeCompare(second.code, undefined, { numeric: true, sensitivity: 'base' })
        );

        const currentQuizIndex = orderedQuizzes.findIndex((item) => item.code === quiz.code);
        const followingQuiz = currentQuizIndex >= 0 ? orderedQuizzes[currentQuizIndex + 1] : undefined;

        setNextQuiz(
          followingQuiz
            ? {
                code: followingQuiz.code,
                title: followingQuiz.title,
              }
            : null
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const fallbackQuiz = getOrCreateQuiz(requestedQuizId, t, i18n);
        setQuizDefinition(fallbackQuiz);
        setNextQuiz(null);
        const message = error instanceof Error ? error.message : tQuiz('loadError');
        setErrorMessage(`${message} (API: ${getApiBaseUrl()}). ${tQuiz('localDataUsed')}`);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadQuiz();

    return () => {
      isMounted = false;
    };
  }, [i18n, requestedQuizId, t]);

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setIsAnswerLocked(false);
    setSubmissionState('idle');
    setSubmissionResult(null);
    submissionStartedRef.current = false;
  }, [quizDefinition.id]);

  useEffect(() => {
    if (!quizCompleted || !token || submissionStartedRef.current) {
      return;
    }

    submissionStartedRef.current = true;
    setSubmissionState('submitting');

    submitQuizAnswers(quizDefinition.id, selectedAnswers, token)
      .then((result) => {
        setSubmissionResult(result);
        setSubmissionState('submitted');
      })
      .catch(() => {
        setSubmissionState('error');
      });
  }, [quizCompleted, quizDefinition.id, selectedAnswers, token]);

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion || isAnswerLocked || selectedForCurrent !== undefined) {
      return;
    }

    setIsAnswerLocked(true);
    setSelectedAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: optionIndex,
    }));
    setIsAnswerLocked(false);
  };

  const goToNextQuestion = () => {
    if (selectedForCurrent === undefined) {
      return;
    }

    if (isLastQuestion) {
      void markQuizCompleted(quizDefinition.id, userId);
      setQuizCompleted(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setIsAnswerLocked(false);
    setSubmissionResult(null);
    setSubmissionState('idle');
    submissionStartedRef.current = false;
  };

  const goToNextQuiz = () => {
    if (!nextQuiz) {
      return;
    }

    navigation.replace('QuizDetails', {
      quizId: nextQuiz.code,
      quizTitle: nextQuiz.title,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>{tQuiz('loading')}</Text>
      </View>
    );
  }

  const quizTitle = route.params?.quizTitle ?? quizDefinition.title;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroTextWrap}>
            <Text style={typography.eyebrow}>{tQuiz('heroEyebrow')}</Text>
            <Text style={[typography.screenTitle, styles.title]}>{quizDefinition.module}</Text>
            <Text style={[typography.body, styles.body]}>
              {tQuiz('heroBody')}
            </Text>
            <View style={styles.quizContextChip}>
              <Text style={styles.quizContextText}>
                {quizTitle} • {quizDefinition.id}
              </Text>
            </View>
            {errorMessage ? <Text style={styles.warningText}>{errorMessage}</Text> : null}
          </View>
          <Image source={require('../../../../assets/cyber_guardian.png')} style={styles.heroImage} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={typography.statValue}>{answeredCount}/{quizDefinition.questions.length}</Text>
          <Text style={[typography.statLabel, styles.statLabel]}>{tQuiz('processedQuestions')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={typography.statValue}>{score}</Text>
          <Text style={[typography.statLabel, styles.statLabel]}>{tQuiz('correctAnswers')}</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={[typography.progressLabel, styles.progressLabel]}>{tQuiz('overallProgress', { value: progress })}</Text>

      {quizCompleted ? (
        <View style={styles.questionCard}>
          <Text style={typography.eyebrowWarning}>{tQuiz('finalResultEyebrow')}</Text>
          <Text style={styles.resultValue}>{successRate}%</Text>
          <Text style={styles.resultBody}>
            {tQuiz('resultBody', { count: score, score, total: quizDefinition.questions.length })}
          </Text>
          {token ? (
            <Text style={styles.syncStatus}>
              {submissionState === 'submitting' && tQuiz('syncSubmitting')}
              {submissionState === 'submitted' && submissionResult
                ? tQuiz('syncSubmitted', {
                    score: submissionResult.score,
                    total: submissionResult.total,
                    rate: submissionResult.successRate,
                  })
                : null}
              {submissionState === 'error' && tQuiz('syncError')}
            </Text>
          ) : (
            <Text style={styles.syncStatus}>{tQuiz('syncLoginRequired')}</Text>
          )}
          {nextQuiz ? (
            <Pressable onPress={goToNextQuiz} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>{tQuiz('nextQuiz', { code: nextQuiz.code })}</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={resetQuiz} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{tQuiz('restart')}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.questionCard}>
          {currentQuestion ? (
            <>
              <View style={styles.questionTopRow}>
                <Text style={typography.cardCode}>{currentQuestion.id}</Text>
                <Text style={styles.questionMeta}>{currentQuestion.module}</Text>
              </View>

              <Text style={typography.cardTitle}>{currentQuestion.prompt}</Text>

              <View style={styles.optionsWrap}>
                {currentQuestion.options.map((option, optionIndex) => {
                  const isSelected = selectedForCurrent === optionIndex;
                  const isCorrectOption = currentQuestion.correctIndex === optionIndex;
                  const showCorrectOption = selectedForCurrent !== undefined && isCorrectOption;
                  const showWrongSelected = selectedForCurrent !== undefined && isSelected && !isCorrectOption;

                  return (
                    <Pressable
                      key={option}
                      onPress={() => handleSelectOption(optionIndex)}
                      style={[
                        styles.optionItem,
                        isSelected && styles.optionItemSelected,
                        showCorrectOption && styles.optionItemCorrect,
                        showWrongSelected && styles.optionItemWrong,
                      ]}
                      disabled={selectedForCurrent !== undefined}
                    >
                      <Text
                        style={[
                          styles.optionIndex,
                          isSelected && styles.optionIndexSelected,
                          showCorrectOption && styles.optionIndexCorrect,
                          showWrongSelected && styles.optionIndexWrong,
                        ]}
                      >
                        {String.fromCharCode(65 + optionIndex)}
                      </Text>
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {currentExplanation ? (
                <View style={[styles.feedbackCard, isCurrentAnswerCorrect ? styles.feedbackCardSuccess : styles.feedbackCardError]}>
                  <Text style={styles.feedbackTitle}>
                    {isCurrentAnswerCorrect ? tQuiz('correctAnswerTitle') : tQuiz('wrongAnswerTitle')}
                  </Text>
                  <Text style={styles.feedbackBody}>{currentExplanation}</Text>
                </View>
              ) : null}

              <Text style={styles.autoNextLabel}>
                {selectedForCurrent === undefined ? tQuiz('chooseAnswer') : tQuiz('readExplanation')}
              </Text>

              {selectedForCurrent !== undefined ? (
                <Pressable onPress={goToNextQuestion} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>
                    {isLastQuestion ? tQuiz('showResult') : tQuiz('nextQuestion')}
                  </Text>
                </Pressable>
              ) : null}
            </>
          ) : (
            <Text style={styles.warningText}>{tQuiz('noQuestion')}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    gap: 14,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
  },
  heroTextWrap: {
    flex: 1,
  },
  title: {
    marginTop: 8,
  },
  body: {
    marginTop: 10,
    maxWidth: 320,
  },
  heroImage: {
    width: 220,
    maxWidth: '42%',
    height: 140,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  quizContextChip: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quizContextText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  warningText: {
    marginTop: 8,
    color: '#ffb9b9',
    fontSize: 12,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: 12,
  },
  statLabel: {
    marginTop: 6,
  },
  progressTrack: {
    height: 8,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: colors.surfaceSoft,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  progressLabel: {
    marginTop: -2,
  },
  questionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 12,
  },
  questionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  optionsWrap: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  optionItemSelected: {
    borderColor: colors.accent,
    backgroundColor: '#0f3a4b',
  },
  optionItemCorrect: {
    borderColor: '#34d399',
    backgroundColor: '#123528',
  },
  optionItemWrong: {
    borderColor: '#f87171',
    backgroundColor: '#3f1d1d',
  },
  optionIndex: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textMuted,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 12,
    fontWeight: '800',
  },
  optionIndexSelected: {
    borderColor: colors.accent,
    color: colors.accent,
  },
  optionIndexCorrect: {
    borderColor: '#34d399',
    color: '#86efac',
  },
  optionIndexWrong: {
    borderColor: '#f87171',
    color: '#fca5a5',
  },
  optionText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 19,
  },
  optionTextSelected: {
    color: colors.text,
    fontWeight: '700',
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  autoNextLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  feedbackCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  feedbackCardSuccess: {
    borderColor: '#34d399',
    backgroundColor: '#123528',
  },
  feedbackCardError: {
    borderColor: '#f87171',
    backgroundColor: '#3f1d1d',
  },
  feedbackTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  feedbackBody: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  resultValue: {
    color: colors.accent,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  resultBody: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
  },
  syncStatus: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});
