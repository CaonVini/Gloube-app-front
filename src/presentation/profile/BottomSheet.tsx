import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '../theme/auth-theme';
import { H_PADDING, MAX_COLUMN, pc } from './profile-theme';

interface Props {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Folha inferior simples (Modal nativo): toque fora ou "voltar" do Android fecha. */
export function BottomSheet({ visible, title, onClose, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={s.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={s.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar" />
        <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <View style={s.grabber} />
          <Text style={s.title} accessibilityRole="header">{title}</Text>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: pc.overlay },
  sheet: {
    width: '100%', maxWidth: MAX_COLUMN, alignSelf: 'center', backgroundColor: pc.bg, borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: H_PADDING, paddingTop: 10, gap: 14,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#D6D9D7' },
  title: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26, color: pc.dark },
});
