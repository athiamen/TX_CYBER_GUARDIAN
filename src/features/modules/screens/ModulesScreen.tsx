import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { getApiBaseUrl, getModules, ModuleItem } from '../../../lib/api';
import { getLearningProgress } from '../../../lib/learningProgress';
import { ModulesStackParamList } from '../../../navigation/types';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

type ModulesScreenProps = {
  userId: string;
};

export function ModulesScreen({ userId }: ModulesScreenProps) {
  const { t } = useTranslation();
  const tModules = (key: string, options?: Record<string, unknown>) => t(`modules.${key}`, options);

  const navigation = useNavigation<NativeStackNavigationProp<ModulesStackParamList>>();
  const [tracks, setTracks] = useState<ModuleItem[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [readCourseCodes, setReadCourseCodes] = useState<string[]>([]);
  const [completedCourseCodes, setCompletedCourseCodes] = useState<string[]>([]);
  const [completedQuizCodes, setCompletedQuizCodes] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadModules() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const modules = await getModules();
        if (!isMounted) {
          return;
        }

        setTracks(modules);
        setSelectedModuleId((current) => current ?? modules[0]?.id ?? null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error ? error.message : t('modules.loadError');
        setErrorMessage(`${message} (API: ${getApiBaseUrl()})`);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadModules();

    return () => {
      isMounted = false;
    };
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      getLearningProgress(userId).then((progress) => {
        if (!isMounted) {
          return;
        }

        setReadCourseCodes(progress.readCourseCodes);
        setCompletedCourseCodes(progress.completedCourseCodes);
        setCompletedQuizCodes(progress.completedQuizCodes);
      });

      return () => {
        isMounted = false;
      };
    }, [userId])
  );

  const totalCourses = useMemo(
    () => tracks.reduce((acc, track) => acc + track.courses.length, 0),
    [tracks]
  );
  const totalQuizzes = useMemo(
    () => tracks.reduce((acc, track) => acc + track.quizzes.length, 0),
    [tracks]
  );
  const averageProgress = useMemo(() => {
    if (!tracks.length) {
      return 0;
    }

    return Math.round(tracks.reduce((acc, track) => acc + track.progress, 0) / tracks.length);
  }, [tracks]);

  const selectedModule = useMemo(() => {
    if (!tracks.length) {
      return null;
    }

    return tracks.find((track) => track.id === selectedModuleId) ?? tracks[0];
  }, [selectedModuleId, tracks]);

  const moduleProgressById = useMemo(() => {
    return tracks.reduce<Record<string, number>>((acc, track) => {
      const totalCourses = track.courses.length;
      const totalQuizzes = track.quizzes.length;
      const totalPoints = totalCourses * 2 + totalQuizzes;

      if (!totalPoints) {
        acc[track.id] = 0;
        return acc;
      }

      const moduleCourseCodes = new Set(track.courses.map((course) => course.code));
      const moduleQuizCodes = new Set(track.quizzes.map((quiz) => quiz.code));

      const readCount = readCourseCodes.filter((code) => moduleCourseCodes.has(code)).length;
      const completedCoursesCount = completedCourseCodes.filter((code) => moduleCourseCodes.has(code)).length;
      const completedQuizzesCount = completedQuizCodes.filter((code) => moduleQuizCodes.has(code)).length;

      const earnedPoints = readCount + completedCoursesCount + completedQuizzesCount;
      acc[track.id] = Math.round((earnedPoints / totalPoints) * 100);

      return acc;
    }, {});
  }, [completedCourseCodes, completedQuizCodes, readCourseCodes, tracks]);

  const selectedModuleReadCount = useMemo(() => {
    if (!selectedModule) {
      return 0;
    }

    const moduleCourseCodes = new Set(selectedModule.courses.map((course) => course.code));
    return readCourseCodes.filter((code) => moduleCourseCodes.has(code)).length;
  }, [readCourseCodes, selectedModule]);

  const selectedModuleCompletedCoursesCount = useMemo(() => {
    if (!selectedModule) {
      return 0;
    }

    const moduleCourseCodes = new Set(selectedModule.courses.map((course) => course.code));
    return completedCourseCodes.filter((code) => moduleCourseCodes.has(code)).length;
  }, [completedCourseCodes, selectedModule]);

  const completedInSelectedModule = useMemo(() => {
    if (!selectedModule) {
      return 0;
    }

    return selectedModule.quizzes.filter((quiz) => completedQuizCodes.includes(quiz.code)).length;
  }, [completedQuizCodes, selectedModule]);

  const selectedModuleAllCoursesCompleted = useMemo(() => {
    if (!selectedModule) {
      return false;
    }

    if (!selectedModule.courses.length) {
      return true;
    }

    return selectedModuleCompletedCoursesCount >= selectedModule.courses.length;
  }, [selectedModule, selectedModuleCompletedCoursesCount]);

  const remainingCoursesToUnlockQuiz = useMemo(() => {
    if (!selectedModule || !selectedModule.courses.length) {
      return 0;
    }

    return Math.max(selectedModule.courses.length - selectedModuleCompletedCoursesCount, 0);
  }, [selectedModule, selectedModuleCompletedCoursesCount]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroTextWrap}>
            <Text style={typography.eyebrowWarning}>{tModules('heroEyebrow')}</Text>
            <Text style={[typography.heroTitle, styles.heroTitle]}>{tModules('heroTitle')}</Text>
            <Text style={[typography.body, styles.heroBody]}>
              {tModules('heroBody')}
            </Text>
          </View>
          <Image source={require('../../../../assets/cyber_guardian.png')} style={styles.heroImage} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={typography.statValue}>{totalCourses}</Text>
          <Text style={[typography.statLabel, styles.statLabel]}>{tModules('lessons')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={typography.statValue}>{totalQuizzes}</Text>
          <Text style={[typography.statLabel, styles.statLabel]}>{tModules('quizzes')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={typography.statValue}>{averageProgress}%</Text>
          <Text style={[typography.statLabel, styles.statLabel]}>{tModules('progress')}</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.stateText}>{tModules('loading')}</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.stateCard}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {!isLoading && !errorMessage && selectedModule ? (
        <>
          <Text style={[typography.sectionTitle, styles.sectionTitle]}>{tModules('availableModules')}</Text>
          {tracks.map((track) => (
            <Pressable
              key={track.id}
              style={[styles.moduleCard, selectedModule.id === track.id && styles.moduleCardActive]}
              onPress={() => setSelectedModuleId(track.id)}
            >
              <View style={styles.moduleTopRow}>
                <Text style={typography.cardCode}>{track.code}</Text>
                <Text style={styles.moduleBadge}>
                  {tModules('courseCount', { count: track.courses.length })} • {tModules('quizCount', { count: track.quizzes.length })}
                </Text>
              </View>
              <Text style={typography.cardTitle}>{track.title}</Text>
              <Text style={typography.cardMeta}>{track.level}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${moduleProgressById[track.id] ?? 0}%` }]} />
              </View>
              <Text style={[typography.progressLabel, styles.progressLabel]}>
                {tModules('moduleProgress', { value: moduleProgressById[track.id] ?? 0 })}
              </Text>
            </Pressable>
          ))}

          <View style={styles.coursesPanel}>
            <Text style={typography.eyebrow}>{tModules('coursePanelEyebrow')}</Text>
            <Text style={[typography.sectionTitle, styles.coursesPanelTitle]}>{selectedModule.title}</Text>
            <Text style={styles.coursesPanelMeta}>
              {tModules('courseMeta', {
                available: selectedModule.courses.length,
                read: selectedModuleReadCount,
                completed: selectedModuleCompletedCoursesCount,
              })}
            </Text>

            {selectedModule.courses.map((course) => (
              <View key={course.id} style={styles.courseItem}>
                <View style={styles.itemInfoWrap}>
                  <Text style={typography.cardCode}>{course.code}</Text>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseMeta}>{course.format} • {course.duration}</Text>
                </View>
                <Pressable
                  style={styles.courseButton}
                  onPress={() =>
                    navigation.navigate('CourseDetails', {
                      courseCode: course.code,
                      courseTitle: course.title,
                      moduleTitle: selectedModule.title,
                      autoStart: true,
                    })
                  }
                >
                  <Text style={styles.courseButtonText}>{tModules('startCourse')}</Text>
                </Pressable>
              </View>
            ))}
          </View>

          <View style={styles.quizPanel}>
            <Text style={typography.eyebrow}>{tModules('quizPanelEyebrow')}</Text>
            <Text style={[typography.sectionTitle, styles.quizPanelTitle]}>{selectedModule.title}</Text>
            <Text style={styles.quizPanelMeta}>
              {tModules('quizMeta', {
                available: selectedModule.quizzes.length,
                completed: completedInSelectedModule,
              })}
            </Text>
            {!selectedModuleAllCoursesCompleted ? (
              <Text style={styles.quizLockHint}>
                {tModules('quizUnlockHint', { count: remainingCoursesToUnlockQuiz })}
              </Text>
            ) : null}

            {selectedModule.quizzes.map((quiz) => {
              const isQuizCompleted = completedQuizCodes.includes(quiz.code);
              const isQuizUnlocked = selectedModuleAllCoursesCompleted || isQuizCompleted;

              return (
                <View
                  key={quiz.id}
                  style={[
                    styles.quizItem,
                    isQuizCompleted && styles.quizItemCompleted,
                    !isQuizUnlocked && styles.quizItemLocked,
                  ]}
                >
                  <View style={styles.itemInfoWrap}>
                    <Text style={typography.cardCode}>{quiz.code}</Text>
                    <Text style={styles.quizTitle}>{quiz.title}</Text>
                    <Text style={styles.quizMeta}>{quiz.duration}</Text>
                    {isQuizCompleted ? <Text style={styles.quizDoneBadge}>{tModules('alreadyCompleted')}</Text> : null}
                    {!isQuizUnlocked ? <Text style={styles.quizLockedBadge}>{tModules('locked')}</Text> : null}
                  </View>
                  <Pressable
                    style={[
                      styles.quizButton,
                      isQuizCompleted && styles.quizButtonCompleted,
                      !isQuizUnlocked && styles.quizButtonLocked,
                    ]}
                    disabled={!isQuizUnlocked}
                    onPress={() =>
                      navigation.navigate('QuizDetails', {
                        quizId: quiz.code,
                        quizTitle: quiz.title,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.quizButtonText,
                        isQuizCompleted && styles.quizButtonTextCompleted,
                        !isQuizUnlocked && styles.quizButtonTextLocked,
                      ]}
                    >
                      {isQuizCompleted ? tModules('resumeQuiz') : isQuizUnlocked ? tModules('startQuiz') : tModules('locked')}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  content: {
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
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
  heroImage: {
    width: 220,
    maxWidth: '42%',
    height: 140,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  heroTitle: {
    marginTop: 8,
  },
  heroBody: {
    marginTop: 10,
    maxWidth: 330,
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
  sectionTitle: {
    marginTop: 6,
  },
  stateCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  stateText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  errorText: {
    color: '#ffb9b9',
    fontSize: 12,
    lineHeight: 18,
  },
  moduleCard: {
    gap: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
  },
  moduleCardActive: {
    borderColor: colors.accent,
    backgroundColor: '#0f3a4b',
  },
  moduleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleBadge: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  progressTrack: {
    marginTop: 8,
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
    marginTop: 6,
  },
  coursesPanel: {
    marginTop: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 10,
  },
  coursesPanelTitle: {
    marginTop: -2,
  },
  coursesPanelMeta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  courseItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  itemInfoWrap: {
    flex: 1,
  },
  courseTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 2,
  },
  courseMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
  courseButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  courseButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  quizPanel: {
    marginTop: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 10,
  },
  quizPanelTitle: {
    marginTop: -2,
  },
  quizPanelMeta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  quizLockHint: {
    marginTop: -2,
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  quizItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  quizItemLocked: {
    borderColor: '#36526a',
    backgroundColor: '#102536',
    opacity: 0.8,
  },
  quizItemCompleted: {
    borderColor: '#34d399',
    backgroundColor: '#123528',
  },
  quizTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 2,
  },
  quizMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
  quizDoneBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#34d399',
    color: '#86efac',
    backgroundColor: '#0f2b21',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  quizLockedBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#7c8fa5',
    color: '#c1cfdb',
    backgroundColor: '#1d3446',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  quizButton: {
    borderRadius: 10,
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  quizButtonLocked: {
    backgroundColor: '#30485f',
    borderWidth: 1,
    borderColor: '#486177',
  },
  quizButtonCompleted: {
    backgroundColor: '#1a4a3a',
    borderWidth: 1,
    borderColor: '#34d399',
  },
  quizButtonText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  quizButtonTextCompleted: {
    color: '#d1fae5',
  },
  quizButtonTextLocked: {
    color: '#c8d4df',
  },
});
