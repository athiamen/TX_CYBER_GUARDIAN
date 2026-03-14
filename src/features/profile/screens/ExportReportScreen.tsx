import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { exportReport, ExportReportResult, getApiBaseUrl } from '../../../lib/api';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

type ReportFormat = 'pdf' | 'csv';
type ReportPeriod = '7d' | '30d' | '90d';

type ExportReportScreenProps = {
  token: string;
};

export function ExportReportScreen({ token }: ExportReportScreenProps) {
  const { t } = useTranslation();
  const tReport = (key: string, options?: Record<string, unknown>) => t(`exportReport.${key}`, options);

  const [format, setFormat] = useState<ReportFormat>('pdf');
  const [period, setPeriod] = useState<ReportPeriod>('30d');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ExportReportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const periodKeyByCode: Record<ReportPeriod, 'period7' | 'period30' | 'period90'> = {
    '7d': 'period7',
    '30d': 'period30',
    '90d': 'period90',
  };

  const reportLabel = useMemo(() => {
    const localizedPeriod = tReport(periodKeyByCode[period]).replace(' ', '_');
    return `${tReport('filePrefix')}_${localizedPeriod}.${format}`;
  }, [format, period, tReport]);

  const triggerExport = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await exportReport(
        {
          format,
          period,
        },
        token
      );
      setResult(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : tReport('exportError');
      setErrorMessage(`${message} (API: ${getApiBaseUrl()})`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={typography.eyebrow}>{tReport('heroEyebrow')}</Text>
        <Text style={[typography.screenTitle, styles.title]}>{tReport('heroTitle')}</Text>
        <Text style={[typography.body, styles.body]}>{tReport('heroBody')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{tReport('format')}</Text>
        <View style={styles.row}>
          {(['pdf', 'csv'] as ReportFormat[]).map((item) => (
            <Pressable key={item} style={[styles.chip, format === item && styles.chipActive]} onPress={() => setFormat(item)}>
              <Text style={[styles.chipText, format === item && styles.chipTextActive]}>{item.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>{tReport('period')}</Text>
        <View style={styles.row}>
          {(['7d', '30d', '90d'] as ReportPeriod[]).map((item) => (
            <Pressable key={item} style={[styles.chip, period === item && styles.chipActive]} onPress={() => setPeriod(item)}>
              <Text style={[styles.chipText, period === item && styles.chipTextActive]}>{tReport(periodKeyByCode[item])}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.previewCard}>
          <Text style={typography.eyebrowWarning}>{tReport('previewEyebrow')}</Text>
          <Text style={styles.previewFile}>{reportLabel}</Text>
          <Text style={styles.previewMeta}>{tReport('previewMeta')}</Text>
        </View>

        <Pressable style={[styles.exportButton, isSubmitting && styles.exportButtonDisabled]} onPress={triggerExport} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color={colors.background} /> : <Text style={styles.exportButtonText}>{tReport('export')}</Text>}
        </Pressable>

        {result ? (
          <View style={styles.successCard}>
            <Text style={styles.successText}>{result.message}</Text>
            <Text style={styles.successMeta}>{tReport('fileName', { name: result.fileName })}</Text>
            <Text style={styles.successMeta}>{tReport('attempts', { count: result.stats.attempts })}</Text>
            <Text style={styles.successMeta}>{tReport('averageRate', { rate: result.stats.averageSuccessRate })}</Text>
          </View>
        ) : null}

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
  card: {
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    borderColor: colors.accent,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: colors.accent,
  },
  previewCard: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: 12,
    gap: 4,
  },
  previewFile: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  previewMeta: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  exportButton: {
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    alignItems: 'center',
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  successCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: 12,
    gap: 3,
  },
  successText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '800',
  },
  successMeta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  errorText: {
    color: '#ffb9b9',
    fontSize: 12,
    lineHeight: 18,
  },
});
