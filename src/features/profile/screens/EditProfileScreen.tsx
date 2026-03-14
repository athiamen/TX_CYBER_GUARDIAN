import { useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { getApiBaseUrl, getProfileMe, updateProfileMe } from '../../../lib/api';
import { ProfileStackParamList } from '../../../navigation/types';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

type EditProfileScreenProps = {
  token: string;
};

export function EditProfileScreen({ token }: EditProfileScreenProps) {
  const { t } = useTranslation();
  const tEdit = (key: string) => t(`editProfile.${key}`);

  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [organization, setOrganization] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      setStatusMessage(null);

      try {
        const me = await getProfileMe(token);
        if (!isMounted) {
          return;
        }

        setFullName(me.fullName);
        setEmail(me.email);
        setRole(me.role);
        setOrganization(me.organization ?? '');
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error ? error.message : tEdit('loadError');
        setStatusMessage(`${message} (API: ${getApiBaseUrl()})`);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const canSave = useMemo(() => {
    return fullName.trim().length >= 3 && email.includes('@') && role.trim().length >= 2;
  }, [email, fullName, role]);

  const handleSave = async () => {
    if (!canSave || isSaving) {
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      await updateProfileMe(
        {
          fullName: fullName.trim(),
          role: role.trim(),
          organization: organization.trim() || undefined,
        },
        token
      );

      navigation.navigate('ProfileHome');
    } catch (error) {
      const message = error instanceof Error ? error.message : tEdit('saveError');
      setStatusMessage(`${message} (API: ${getApiBaseUrl()})`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>{tEdit('loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={typography.eyebrow}>{tEdit('heroEyebrow')}</Text>
        <Text style={[typography.screenTitle, styles.title]}>{tEdit('heroTitle')}</Text>
        <Text style={[typography.body, styles.body]}>{tEdit('heroBody')}</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>{tEdit('fullName')}</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder={tEdit('fullNamePlaceholder')} placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>{tEdit('emailReadonly')}</Text>
        <TextInput
          style={[styles.input, styles.readonlyInput]}
          value={email}
          editable={false}
          placeholder={tEdit('emailPlaceholder')}
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>{tEdit('role')}</Text>
        <TextInput style={styles.input} value={role} onChangeText={setRole} placeholder={tEdit('rolePlaceholder')} placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>{tEdit('organization')}</Text>
        <TextInput
          style={styles.input}
          value={organization}
          onChangeText={setOrganization}
          placeholder={tEdit('organizationPlaceholder')}
          placeholderTextColor={colors.textMuted}
        />

        <Pressable style={[styles.saveButton, (!canSave || isSaving) && styles.saveButtonDisabled]} onPress={handleSave} disabled={!canSave || isSaving}>
          {isSaving ? <ActivityIndicator color={colors.background} /> : <Text style={styles.saveButtonText}>{tEdit('save')}</Text>}
        </Pressable>

        {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}
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
  title: {
    marginTop: 8,
  },
  body: {
    marginTop: 10,
  },
  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 10,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
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
  readonlyInput: {
    opacity: 0.65,
  },
  saveButton: {
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  statusText: {
    color: '#ffb9b9',
    fontSize: 12,
    lineHeight: 18,
  },
});
