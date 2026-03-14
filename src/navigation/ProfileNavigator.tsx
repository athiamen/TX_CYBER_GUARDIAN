import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { EditProfileScreen } from '../features/profile/screens/EditProfileScreen';
import { ExportReportScreen } from '../features/profile/screens/ExportReportScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

type ProfileNavigatorProps = {
  token: string;
  userId: string;
  onLogout?: () => void;
};

export function ProfileNavigator({ token, userId, onLogout }: ProfileNavigatorProps) {
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
      <Stack.Screen name="ProfileHome" options={{ title: t('navigation.profile.homeTitle') }}>
        {() => <ProfileScreen token={token} userId={userId} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="EditProfile" options={{ title: t('navigation.profile.editTitle') }}>
        {() => <EditProfileScreen token={token} />}
      </Stack.Screen>
      <Stack.Screen name="ExportReport" options={{ title: t('navigation.profile.exportTitle') }}>
        {() => <ExportReportScreen token={token} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}