import { RouteProp, useRoute } from '@react-navigation/native';
import { ResizeMode, Video } from 'expo-av';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { resolveCourseVideoUrl } from '../data/courseVideos';
import { ModulesStackParamList } from '../../../navigation/types';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

type CourseVideoRoute = RouteProp<ModulesStackParamList, 'CourseVideo'>;

export function CourseVideoScreen() {
  const { t } = useTranslation();
  const route = useRoute<CourseVideoRoute>();
  const { courseCode, courseTitle, moduleTitle, videoUrl } = route.params;
  const resolvedVideoUrl = videoUrl ?? resolveCourseVideoUrl(courseCode);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={typography.eyebrow}>{t('course.video')}</Text>
        <Text style={[typography.screenTitle, styles.title]}>{courseTitle ?? courseCode}</Text>
        <Text style={[typography.body, styles.body]}>{moduleTitle ?? 'Module'}</Text>
      </View>

      <View style={styles.playerCard}>
        <Video
          source={{ uri: resolvedVideoUrl }}
          style={styles.player}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          isLooping
        />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>{t('course.videoHelp')}</Text>
        <Pressable style={styles.linkPill}>
          <Text style={styles.linkPillText}>{t('course.reference')} : {courseCode}</Text>
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
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
  },
  title: {
    marginTop: 8,
  },
  body: {
    marginTop: 10,
  },
  playerCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 12,
  },
  player: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignContent: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: 12,
    gap: 8,
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  linkPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  linkPillText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
});
