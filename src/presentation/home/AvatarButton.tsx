import { memo } from 'react';
import { Image, Pressable, StyleSheet, type ImageSourcePropType } from 'react-native';
import { homeColors } from '../theme/auth-theme';

interface Props {
  fullName: string;
  photo: ImageSourcePropType;
  onPress: () => void;
}

/** Avatar do cabeçalho: um toque abre "Meu perfil". */
export const AvatarButton = memo(function AvatarButton({ fullName, photo, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir meu perfil, ${fullName}`}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => pressed && s.pressed}
    >
      <Image source={photo} style={s.photo} accessible={false} />
    </Pressable>
  );
});

const s = StyleSheet.create({
  photo: { width: 44, height: 44, borderRadius: 22, backgroundColor: homeColors.avatarBg },
  pressed: { opacity: 0.7 },
});
