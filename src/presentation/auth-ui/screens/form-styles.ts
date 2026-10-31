import { StyleSheet } from 'react-native';
import { authColors, fonts } from '../../theme/auth-theme';

export const formStyles = StyleSheet.create({
  form: { gap: 8 },
  title: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 38, color: authColors.text, letterSpacing: -0.5 },
  subtitle: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 22, color: authColors.muted, marginTop: 4, marginBottom: 6 },
  formError: { fontFamily: fonts.medium, fontSize: 14, color: authColors.danger },
  footer: { textAlign: 'center', fontFamily: fonts.regular, fontSize: 15, color: authColors.muted, marginTop: 4 },
  legal: { textAlign: 'center', fontFamily: fonts.regular, fontSize: 12, color: authColors.muted, marginTop: 6, marginBottom: 4 },
});
