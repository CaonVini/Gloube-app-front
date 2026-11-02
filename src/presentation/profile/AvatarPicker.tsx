import { memo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { fonts } from '../theme/auth-theme';
import { BottomSheet } from './BottomSheet';
import { ProfileIcon, type ProfileIconName } from './ProfileIcon';
import { pc } from './profile-theme';
import type { AvatarSource } from './useAvatarPicker';

const SIZE = 104;

interface Props {
  photo: ImageSourcePropType;
  hasCustomPhoto: boolean;
  onPick: (source: AvatarSource) => void;
  onRemove: () => void;
}

/** Avatar grande com botão de câmera; ao tocar abre as opções (tirar foto, galeria, remover). */
export const AvatarPicker = memo(function AvatarPicker({ photo, hasCustomPhoto, onPick, onRemove }: Props) {
  const [open, setOpen] = useState(false);
  const choose = (fn: () => void) => () => { setOpen(false); fn(); };
  return (
    <>
      <View style={s.wrap}>
        <Image source={photo} style={s.photo} accessibilityLabel="Sua foto de perfil" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Trocar foto de perfil"
          onPress={() => setOpen(true)}
          hitSlop={10}
          style={({ pressed }) => [s.badge, pressed && s.pressed]}
        >
          <ProfileIcon name="camera" size={16} color={pc.dark} />
        </Pressable>
      </View>

      <BottomSheet visible={open} title="Foto de perfil" onClose={() => setOpen(false)}>
        <Option icon="camera" label="Tirar foto" onPress={choose(() => onPick('camera'))} />
        <Option icon="gallery" label="Escolher da galeria" onPress={choose(() => onPick('gallery'))} />
        {hasCustomPhoto ? <Option icon="close" label="Remover foto" danger onPress={choose(onRemove)} /> : null}
      </BottomSheet>
    </>
  );
});

function Option({ icon, label, onPress, danger }: { icon: ProfileIconName; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [s.option, pressed && s.pressed]}>
      <ProfileIcon name={icon} size={22} color={danger ? pc.danger : pc.dark} />
      <Text style={[s.optionText, danger && { color: pc.danger }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE },
  photo: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: pc.badgeBg },
  badge: {
    position: 'absolute', right: -2, bottom: 2, width: 34, height: 34, borderRadius: 17, backgroundColor: pc.badgeBg,
    borderWidth: 3, borderColor: pc.bg, alignItems: 'center', justifyContent: 'center',
  },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 52, paddingHorizontal: 16, borderRadius: 14, backgroundColor: pc.card },
  optionText: { fontFamily: fonts.medium, fontSize: 16, color: pc.dark },
  pressed: { opacity: 0.7 },
});
