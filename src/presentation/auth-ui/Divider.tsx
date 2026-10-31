import { StyleSheet, Text, View } from 'react-native';
import { authColors, fonts } from '../theme/auth-theme';

export const Divider = ({ label }: { label: string }) => (
  <View style={s.row} accessible accessibilityLabel={label}>
    <View style={s.line} />
    <Text style={s.text}>{label}</Text>
    <View style={s.line} />
  </View>
);

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: StyleSheet.hairlineWidth * 2, backgroundColor: authColors.border },
  text: { fontFamily: fonts.regular, fontSize: 14, color: authColors.muted },
});
