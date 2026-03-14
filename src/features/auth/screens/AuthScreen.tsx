import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,

} from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { AuthSession, getApiBaseUrl, login, register } from '../../../lib/api';
import { useTranslation } from 'react-i18next';

type AuthScreenProps = {
  onAuthenticated?: (session: AuthSession) => void;
};

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  const tAuth = (key: string, options?: Record<string, unknown>) => t(`auth.${key}`, options);

  const isPasswordValid = password.length >= 8;
  const canSubmit = useMemo(() => {
    if (!email.includes('@') || !isPasswordValid) {
      return false;
    }

    if (isRegisterMode) {
      return fullName.trim().length >= 2 && confirmPassword.length >= 8 && confirmPassword === password;
    }

    return true;
  }, [confirmPassword, email, isPasswordValid, isRegisterMode, password]);

  const modeTitle = isRegisterMode ? tAuth('secureAccountTitle') : tAuth('secureLoginTitle');
  const modeBody = isRegisterMode
    ? tAuth('registerBody')
    : tAuth('loginBody');

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const session = isRegisterMode
        ? await register({
            email: email.trim().toLowerCase(),
            password,
            fullName: fullName.trim(),
          })
        : await login({
            email: email.trim().toLowerCase(),
            password,
          });

      onAuthenticated?.(session);
    } catch (error) {
      const message = error instanceof Error ? error.message : tAuth('loginError');
      setErrorMessage(`${message} (API: ${getApiBaseUrl()})`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.modeTabs}>
        <Pressable
          onPress={() => setIsRegisterMode(false)}
          style={[styles.modeTab, !isRegisterMode && styles.modeTabActive]}
        >
          <Text style={[styles.modeTabText, !isRegisterMode && styles.modeTabTextActive]}>{tAuth('tabLogin')}</Text>
        </Pressable>
        <Pressable
          onPress={() => setIsRegisterMode(true)}
          style={[styles.modeTab, isRegisterMode && styles.modeTabActive]}
        >
          <Text style={[styles.modeTabText, isRegisterMode && styles.modeTabTextActive]}>{tAuth('tabRegister')}</Text>
        </Pressable>
      </View>

      <View style={styles.heroCard}>
        <Text style={typography.eyebrow}>{tAuth('heroEyebrow')}</Text>
        <Text style={[typography.screenTitle, styles.title]}>{modeTitle}</Text>
        <Text style={[typography.body, styles.body]}>{modeBody}</Text>
      </View>

      <View style={styles.formCard}>
        {isRegisterMode && (
          <>
            <Text style={styles.fieldLabel}>{tAuth('fullName')}</Text>
            <TextInput
              placeholder={tAuth('yourName')}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
            />
          </>
        )}

        <Text style={styles.fieldLabel}>{tAuth('email')}</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder={tAuth('emailPlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.fieldLabel}>{tAuth('password')}</Text>
        <TextInput
          placeholder={tAuth('passwordPlaceholder')}
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {isRegisterMode && (
          <>
            <Text style={styles.fieldLabel}>{tAuth('confirmPassword')}</Text>
            <TextInput
              placeholder={tAuth('confirmPasswordPlaceholder')}
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </>
        )}

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{tAuth('keepSession')}</Text>
          <Switch
            value={rememberSession}
            onValueChange={setRememberSession}
            thumbColor={colors.text}
            trackColor={{ false: colors.surfaceSoft, true: colors.accent }}
          />
        </View>

        <View style={styles.securityHint}>
          <Text style={typography.eyebrowWarning}>{tAuth('securityEyebrow')}</Text>
          <Text style={styles.securityBody}>
            {tAuth('securityBody')}
          </Text>
        </View>

        <Pressable
          onPress={handleSubmit}
          style={[styles.submitButton, (!canSubmit || isSubmitting) && styles.submitButtonDisabled]}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.submitText}>{isRegisterMode ? tAuth('createAccount') : tAuth('signIn')}</Text>
          )}
        </Pressable>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
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
  modeTabs: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 4,
    gap: 6,
  },
  modeTab: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: colors.accent,
  },
  modeTabText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  modeTabTextActive: {
    color: colors.background,
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
    maxWidth: 320,
  },
  formCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 10,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
  },
  switchRow: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  securityHint: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: 12,
    gap: 6,
  },
  securityBody: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  submitButton: {
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: colors.accent,
    paddingVertical: 13,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.45,
  },
  submitText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  errorText: {
    marginTop: 4,
    color: '#ffb9b9',
    fontSize: 12,
    lineHeight: 18,
  },
});
