import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { getApiBaseUrl, getModules, getProfileMe, ModuleItem, ProfileItem } from '../../../lib/api';
import { getLearningProgress } from '../../../lib/learningProgress';
import { ProfileStackParamList } from '../../../navigation/types';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

type ProfileScreenProps = {
  token: string;
  userId: string;
  onLogout?: () => void;
};

export function ProfileScreen({ token, userId, onLogout }: ProfileScreenProps) {
  const { t } = useTranslation();
  const tProfile = (key: string, options?: Record<string, unknown>) => t(`profile.${key}`, options);

  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [weeklyRecap, setWeeklyRecap] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileItem | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [completedCourseCodes, setCompletedCourseCodes] = useState<string[]>([]);
  const [completedQuizCodes, setCompletedQuizCodes] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadData() {
        setIsLoading(true);
        setErrorMessage(null);

        try {
          const [me, modulesResponse, learningProgress] = await Promise.all([
            getProfileMe(token),
            getModules(),
            getLearningProgress(userId),
          ]);
          if (!isMounted) {
            return;
          }

          setProfile(me);
          setModules(modulesResponse);
          setCompletedCourseCodes(learningProgress.completedCourseCodes);
          setCompletedQuizCodes(learningProgress.completedQuizCodes);
        } catch (error) {
          if (!isMounted) {
            return;
          }

          const message = error instanceof Error ? error.message : t('profile.loadError');
          setErrorMessage(`${message} (API: ${getApiBaseUrl()})`);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }

      loadData();

      return () => {
        isMounted = false;
      };
    }, [token, userId, t])
  );

  const progression = useMemo(() => {
    const totalCourses = modules.reduce((acc, moduleItem) => acc + moduleItem.courses.length, 0);
    const totalQuizzes = modules.reduce((acc, moduleItem) => acc + moduleItem.quizzes.length, 0);
    const totalItems = totalCourses + totalQuizzes;

    if (!totalItems) {
      return 0;
    }

    const validCourseCodes = new Set(modules.flatMap((moduleItem) => moduleItem.courses.map((course) => course.code)));
    const validQuizCodes = new Set(modules.flatMap((moduleItem) => moduleItem.quizzes.map((quiz) => quiz.code)));

    const completedCourses = completedCourseCodes.filter((code) => validCourseCodes.has(code)).length;
    const completedQuizzes = completedQuizCodes.filter((code) => validQuizCodes.has(code)).length;

    return Math.round(((completedCourses + completedQuizzes) / totalItems) * 100);
  }, [completedCourseCodes, completedQuizCodes, modules]);

  const totalCourses = useMemo(
    () => modules.reduce((acc, moduleItem) => acc + moduleItem.courses.length, 0),
    [modules]
  );

  const totalQuizzes = useMemo(
    () => modules.reduce((acc, moduleItem) => acc + moduleItem.quizzes.length, 0),
    [modules]
  );

  const completedCourses = useMemo(() => {
    const validCourseCodes = new Set(modules.flatMap((moduleItem) => moduleItem.courses.map((course) => course.code)));
    return completedCourseCodes.filter((code) => validCourseCodes.has(code)).length;
  }, [completedCourseCodes, modules]);

  const completedQuizzes = useMemo(() => {
    const validQuizCodes = new Set(modules.flatMap((moduleItem) => moduleItem.quizzes.map((quiz) => quiz.code)));
    return completedQuizCodes.filter((code) => validQuizCodes.has(code)).length;
  }, [completedQuizCodes, modules]);

  const initials = useMemo(() => {
    const name = profile?.fullName?.trim();
    if (!name) {
      return '??';
    }

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }, [profile?.fullName]);

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>{tProfile('loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroTextWrap}>
            <Text style={typography.eyebrowWarning}>{tProfile('heroEyebrow')}</Text>
            <Text style={[typography.screenTitle, styles.heroTitle]}>{tProfile('heroTitle')}</Text>
            <Text style={[typography.body, styles.heroBody]}>
              {tProfile('heroBody')}
            </Text>
          </View>
          <Image
            source={require('../../../../assets/cyber_guardian.png')}
            style={styles.heroImage}
          />
        </View>
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <View style={styles.identityCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.identityTextWrap}>
          <Text style={styles.name}>{profile?.fullName ?? tProfile('fallbackUser')}</Text>
          <Text style={styles.email}>{profile?.email ?? '-'}</Text>
          <Text style={styles.role}>
            {profile?.role ?? tProfile('fallbackRole')} • {profile?.organization ?? tProfile('fallbackOrganization')}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={typography.statValue}>{progression}%</Text>
          <Text style={[typography.statLabel, styles.statLabel]}>{tProfile('progress')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={typography.statValue}>{completedCourses}/{totalCourses}</Text>
          <Text style={[typography.statLabel, styles.statLabel]}>{tProfile('completedCourses')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={typography.statValue}>{completedQuizzes}/{totalQuizzes}</Text>
          <Text style={[typography.statLabel, styles.statLabel]}>{tProfile('completedQuizzes')}</Text>
        </View>
      </View>

      <View style={styles.preferencesCard}>
        <Text style={[typography.sectionTitle, styles.sectionTitle]}>{tProfile('preferences')}</Text>

        <View style={styles.preferenceRow}>
          <View style={styles.preferenceTextWrap}>
            <Text style={styles.preferenceTitle}>{tProfile('notifications')}</Text>
            <Text style={styles.preferenceMeta}>{tProfile('notificationsMeta')}</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            thumbColor={colors.text}
            trackColor={{ false: colors.surfaceSoft, true: colors.accent }}
          />
        </View>

        <View style={styles.preferenceRow}>
          <View style={styles.preferenceTextWrap}>
            <Text style={styles.preferenceTitle}>{tProfile('weeklyRecap')}</Text>
            <Text style={styles.preferenceMeta}>{tProfile('weeklyRecapMeta')}</Text>
          </View>
          <Switch
            value={weeklyRecap}
            onValueChange={setWeeklyRecap}
            thumbColor={colors.text}
            trackColor={{ false: colors.surfaceSoft, true: colors.accent }}
          />
        </View>
      </View>

      <View style={styles.actionsCard}>
        <Text style={[typography.sectionTitle, styles.sectionTitle]}>{tProfile('quickActions')}</Text>
        <Pressable style={styles.actionButton} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.actionText}>{tProfile('editProfile')}</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => navigation.navigate('AttemptsReport')}>
          <Text style={styles.actionText}>{tProfile('attemptsReport')}</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.actionDanger]} onPress={onLogout}>
          <Text style={styles.actionDangerText}>{tProfile('logout')}</Text>
        </Pressable>
      </View>
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
  heroTitle: {
    marginTop: 8,
  },
  heroBody: {
    marginTop: 10,
    maxWidth: 320,
  },
  heroImage: {
    width: 220,
    maxWidth: '42%',
    height: 140,
    borderRadius: 14,
    resizeMode: 'cover',
  },
  errorText: {
    color: '#ffb9b9',
    fontSize: 12,
    lineHeight: 18,
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  identityTextWrap: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  email: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  role: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
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
  preferencesCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 2,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  preferenceTextWrap: {
    flex: 1,
    gap: 3,
  },
  preferenceTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  preferenceMeta: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  actionsCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 10,
  },
  actionButton: {
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  actionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  actionDanger: {
    borderColor: '#7a2a2a',
    backgroundColor: '#3f1d1d',
  },
  actionDangerText: {
    color: '#ffb9b9',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
});
