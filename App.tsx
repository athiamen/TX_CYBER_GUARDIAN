import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthScreen } from './src/features/auth/screens/AuthScreen';
import { AuthSession } from './src/lib/api';
import { clearSession, loadSession, saveSession } from './src/lib/sessionStorage';
import { colors } from './src/theme/colors';

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    loadSession()
      .then((storedSession) => {
        if (!isMounted) {
          return;
        }

        setSession(storedSession);
      })
      .finally(() => {
        if (isMounted) {
          setIsRestoringSession(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAuthenticated = async (nextSession: AuthSession) => {
    setSession(nextSession);
    await saveSession(nextSession);
  };

  const handleLogout = async () => {
    setSession(null);
    await clearSession();
  };

  if (isRestoringSession) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      {session ? (
        <RootNavigator token={session.token} userId={session.user.id} onLogout={handleLogout} />
      ) : (
        <AuthScreen onAuthenticated={handleAuthenticated} />
      )}
    </>
  );
}
