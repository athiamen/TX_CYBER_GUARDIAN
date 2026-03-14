import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootTabParamList } from './types';
import { ModulesNavigator } from './ModulesNavigator';
import { ProfileNavigator } from './ProfileNavigator';

const Tab = createBottomTabNavigator<RootTabParamList>();

type RootNavigatorProps = {
  token: string;
  userId: string;
  onLogout?: () => void;
};

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

export function RootNavigator({ token, userId, onLogout }: RootNavigatorProps) {
  const { t } = useTranslation();

  return (
    <NavigationContainer theme={appTheme}>
      <Tab.Navigator
        initialRouteName="Modules"
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: {
            color: colors.text,
            fontSize: typography.sectionTitle.fontSize,
            fontWeight: '800',
            letterSpacing: -0.2,
          },
          headerTintColor: colors.text,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 62,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 0.2,
          },
        }}
      >
        <Tab.Screen
          name="Modules"
          options={{
            headerShown: false,
            title: t('navigation.root.modules'),
            tabBarLabel: t('navigation.root.modules'),
          }}
        >
          {() => <ModulesNavigator token={token} userId={userId} />}
        </Tab.Screen>
        <Tab.Screen
          name="Profil"
          options={{
            headerShown: false,
            title: t('navigation.root.profile'),
            tabBarLabel: t('navigation.root.profile'),
          }}
        >
          {() => <ProfileNavigator token={token} userId={userId} onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
