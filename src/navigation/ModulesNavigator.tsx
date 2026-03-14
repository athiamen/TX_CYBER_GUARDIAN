import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ModulesScreen } from '../features/modules/screens/ModulesScreen';
import { CourseScreen } from '../features/modules/screens/CourseScreen';
import { QuizScreen } from '../features/quiz/screens/QuizScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { ModulesStackParamList } from './types';

const Stack = createNativeStackNavigator<ModulesStackParamList>();

type ModulesNavigatorProps = {
  token: string;
  userId: string;
};

export function ModulesNavigator({ token, userId }: ModulesNavigatorProps) {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: {
          color: colors.text,
          fontSize: typography.sectionTitle.fontSize,
          fontWeight: '800',
        },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="ModulesHome" options={{ title: t('navigation.modules.homeTitle') }}>
        {() => <ModulesScreen userId={userId} />}
      </Stack.Screen>
      <Stack.Screen
        name="CourseDetails"
        options={({ route }) => ({ title: route.params.courseTitle ?? route.params.courseCode })}
      >
        {() => <CourseScreen userId={userId} />}
      </Stack.Screen>
      <Stack.Screen name="QuizDetails" options={{ title: t('navigation.modules.quizTitle') }}>
        {() => <QuizScreen token={token} userId={userId} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
