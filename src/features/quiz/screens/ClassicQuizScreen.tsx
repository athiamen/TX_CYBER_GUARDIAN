import { useMemo } from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { getOrCreateQuiz } from '../data/quizCatalog';
import { QUESTION_EVENTS, LEVEL_LABELS } from '../constants/quizGameConstants';
import { QuizClassicView } from '../components/QuizClassicView';
import { useQuizCore } from '../hooks/useQuizCore';
import { useQuizTimer } from '../hooks/useQuizTimer';
import { useQuizSubmission } from '../hooks/useQuizSubmission';
import { useDifficultySettings } from '../hooks/useDifficultySettings';
import { buildAnswerExplanation } from '../utils/quizUtils';
import type { QuizDifficulty } from '../data/quizCatalogData';

type ClassicQuizScreenProps = {
  token?: string;
  userId: string;
  requestedQuizId: string;
  selectedDifficulty: QuizDifficulty;
};

export function ClassicQuizScreen({
  token,
  userId,
  requestedQuizId,
  selectedDifficulty,
}: ClassicQuizScreenProps) {
  const { t } = useTranslation();
  const tQuiz = (key: string, options?: Record<string, unknown>) => t(`quiz.${key}`, options);

  // Load quiz definition
  const quizDefinition = useMemo(
    () => getOrCreateQuiz(requestedQuizId, t, selectedDifficulty),
    [requestedQuizId, selectedDifficulty, t]
  );

  // Get time per question based on difficulty
  const { timePerQuestion } = useDifficultySettings(selectedDifficulty, 'classic');

  // Use custom hooks for state management
  const quizCore = useQuizCore(quizDefinition, userId);
  const quizTimer = useQuizTimer(timePerQuestion, !quizCore.quizCompleted, false);
  const quizSubmission = useQuizSubmission(quizDefinition, quizCore.selectedAnswers, quizCore.quizCompleted, token);

  // Derived state
  const currentQuestion = quizDefinition.questions[quizCore.currentIndex];
  const currentQuestionEvent = currentQuestion ? QUESTION_EVENTS[currentQuestion.id] : null;
  const selectedForCurrent = currentQuestion ? quizCore.selectedAnswers[currentQuestion.id] : undefined;
  const isLastQuestion = quizCore.currentIndex === quizDefinition.questions.length - 1;
  const currentExplanation =
    currentQuestion !== undefined && selectedForCurrent !== undefined
      ? buildAnswerExplanation(currentQuestion, selectedForCurrent, (key, options) => tQuiz(key, options))
      : null;
  const isCurrentAnswerCorrect = currentQuestion ? selectedForCurrent === currentQuestion.correctIndex : false;
  const currentLevelLabel = LEVEL_LABELS[selectedDifficulty];

  // Show time warning when time runs out
  const showTimeWarning = quizTimer.timeWarningMessage && selectedForCurrent === undefined;

  if (quizCore.quizCompleted) {
    return (
      <View style={styles.questionCard}>
        <Text style={typography.eyebrowWarning}>{tQuiz('finalResultEyebrow')}</Text>
        <Text style={styles.resultValue}>{quizCore.successRate}%</Text>
        <Text style={styles.resultBody}>
          {tQuiz('resultBody', {
            count: quizCore.score,
            score: quizCore.score,
            total: quizDefinition.questions.length,
          })}
        </Text>
        {token ? (
          <Text style={styles.syncStatus}>
            {quizSubmission.submissionState === 'submitting' && tQuiz('syncSubmitting')}
            {quizSubmission.submissionState === 'submitted' && quizSubmission.submissionResult
              ? tQuiz('syncSubmitted', {
                  score: quizSubmission.submissionResult.score,
                  total: quizSubmission.submissionResult.total,
                  rate: quizSubmission.submissionResult.successRate,
                })
              : null}
            {quizSubmission.submissionState === 'error' && tQuiz('syncError')}
          </Text>
        ) : (
          <Text style={styles.syncStatus}>{tQuiz('syncLoginRequired')}</Text>
        )}
        <Pressable onPress={quizCore.resetQuiz} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{tQuiz('restart')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🏆</Text>
          <Text style={styles.statText}>
            Score: <Text style={styles.statValueInline}>{quizCore.score}</Text>
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statText}>
            Serie: <Text style={styles.statValueInline}>{quizCore.streak}</Text>
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>⏱️</Text>
          <Text style={styles.statText}>
            Temps: <Text style={styles.statValueInline}>{quizTimer.timeLeft}s</Text>
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🏅</Text>
          <Text style={styles.statText}>
            Niveau: <Text style={styles.statValueInline}>{currentLevelLabel}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${quizCore.progress}%` }]} />
      </View>
      <Text style={styles.questionIndexLabel}>
        Question {Math.min(quizCore.currentIndex + 1, quizDefinition.questions.length)} sur{' '}
        {quizDefinition.questions.length}
      </Text>
      <Text style={[typography.progressLabel, styles.progressLabel]}>
        {tQuiz('overallProgress', { value: quizCore.progress })}
      </Text>

      <View style={styles.questionCard}>
        {showTimeWarning ? (
          <View style={styles.timeWarningCard}>
            <Text style={styles.timeWarningText}>{quizTimer.timeWarningMessage}</Text>
          </View>
        ) : null}
        {currentQuestion ? (
          <QuizClassicView
            currentQuestion={currentQuestion}
            currentQuestionEvent={currentQuestionEvent}
            selectedForCurrent={selectedForCurrent}
            currentExplanation={currentExplanation}
            isCurrentAnswerCorrect={isCurrentAnswerCorrect}
            isLastQuestion={isLastQuestion}
            onSelectOption={quizCore.selectOption}
            onNextQuestion={quizCore.goToNextQuestion}
            tQuiz={tQuiz}
            styles={styles}
          />
        ) : (
          <Text style={styles.warningText}>{tQuiz('noQuestion')}</Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  statsBar: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    fontSize: 17,
  },
  statText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  statValueInline: {
    color: colors.text,
    fontWeight: '900',
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
  questionIndexLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
  questionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 12,
  },
  warningText: {
    marginTop: 8,
    color: '#ffb9b9',
    fontSize: 12,
    lineHeight: 18,
  },
  timeWarningCard: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fbbf24',
    backgroundColor: '#78350f',
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#fbbf24',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  timeWarningText: {
    color: '#fef3c7',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
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
  primaryButton: {
    borderRadius: 12,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
