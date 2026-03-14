import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  eyebrowWarning: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  screenTitle: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 38,
    letterSpacing: -0.4,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  body: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 26,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  statValue: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  cardCode: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  cardMeta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  progressLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
});