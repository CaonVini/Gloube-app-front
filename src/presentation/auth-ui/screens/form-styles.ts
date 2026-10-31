import { StyleSheet } from 'react-native';
import { authColors, fonts } from '../../theme/auth-theme';

export const formStyles = StyleSheet.create({
  form: { gap: 16 },
  title: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 38, color: authColors.text, letterSpacing: -0.5 },
  subtitle: { fontFamily: fonts.regular, fontSize: 18, color: authColors.muted, marginTop: 4 },
  formError: { fontFamily: fonts.medium, fontSize: 14, color: authColors.danger },
  footer: { textAlign: 'center', fontFamily: fonts.regular, fontSize: 16, color: authColors.muted, marginTop: 4 },
  legal: { textAlign: 'center', fontFamily: fonts.regular, fontSize: 13, color: authColors.muted, marginBottom: 4 },
});
