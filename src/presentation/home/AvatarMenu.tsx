import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authColors, fonts, homeColors } from '../theme/auth-theme';
import { ChevronDownIcon } from '../auth-ui/icons';

interface Props {
  initials: string;
  fullName: string;
  onSignOut: () => void;
  /** Foto opcional: quando presente, é o único elemento do gatilho (sem iniciais nem seta). */
  photo?: ImageSourcePropType;
  /** Quando informado, o menu mostra "Meu perfil". */
  onProfile?: () => void;
}

/** Avatar com iniciais + chevron; ao tocar abre um menu simples com a opção "Sair". */
export function AvatarMenu({ initials, fullName, onSignOut, photo, onProfile }: Props) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Menu da conta de ${fullName}`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((v) => !v)}
        hitSlop={8}
        style={({ pressed }) => [s.trigger, pressed && s.pressed]}
      >
        {photo ? (
          <Image source={photo} style={s.photo} accessible={false} />
        ) : (
          <>
            <View style={s.avatar}>
              <Text style={s.initials}>{initials}</Text>
            </View>
            <ChevronDownIcon />
          </>
        )}
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Fechar menu">
          <View style={[s.menu, { top: Math.max(insets.top, 47) + 62 }]}>
            <Text style={s.menuName} numberOfLines={1}>{fullName}</Text>
            {onProfile ? (
              <Pressable accessibilityRole="menuitem" onPress={() => { setOpen(false); onProfile(); }} style={({ pressed }) => [s.item, pressed && s.pressed]}>
                <Text style={s.itemTextDark}>Meu perfil</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="menuitem"
              onPress={() => { setOpen(false); onSignOut(); }}
              style={({ pressed }) => [s.item, pressed && s.pressed]}
            >
              <Text style={s.itemText}>Sair</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  trigger: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: homeColors.avatarBg, alignItems: 'center', justifyContent: 'center',
  },
  photo: { width: 44, height: 44, borderRadius: 22 },
  initials: { fontFamily: fonts.medium, fontSize: 18, color: authColors.text },
  pressed: { opacity: 0.7 },
  backdrop: { flex: 1 },
  menu: {
    position: 'absolute', right: 20, minWidth: 190, backgroundColor: authColors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: authColors.border, paddingVertical: 8, paddingHorizontal: 6,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  menuName: { fontFamily: fonts.medium, fontSize: 14, color: authColors.muted, paddingHorizontal: 12, paddingVertical: 6 },
  item: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 10 },
  itemTextDark: { fontFamily: fonts.semibold, fontSize: 16, color: authColors.text },
  itemText: { fontFamily: fonts.semibold, fontSize: 16, color: authColors.danger },
});
