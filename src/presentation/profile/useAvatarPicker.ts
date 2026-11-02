import * as ImagePicker from 'expo-image-picker';
import { useCallback, useRef } from 'react';
import { validateAvatar } from '../../domain/profile';

export type AvatarSource = 'camera' | 'gallery';

/**
 * Escolhe a foto de perfil (câmera ou galeria) e valida tipo/tamanho antes de aceitar.
 * `exif: false` descarta a localização (GPS) da foto; recorte quadrado + qualidade 0.8 mantêm o arquivo pequeno.
 */
export function useAvatarPicker(onPicked: (uri: string) => void, onNotice: (text: string) => void) {
  const busy = useRef(false); // evita abrir o seletor duas vezes com toques rápidos

  return useCallback(async (source: AvatarSource) => {
    if (busy.current) return;
    busy.current = true;
    try {
      const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8, exif: false };
      let res: ImagePicker.ImagePickerResult;
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          onNotice(perm.canAskAgain
            ? 'Preciso da câmera para tirar a foto. Toque em Tirar foto de novo e permita o acesso.'
            : 'A câmera está bloqueada. Ative a permissão nas configurações do aparelho.');
          return;
        }
        res = await ImagePicker.launchCameraAsync(opts);
      } else {
        res = await ImagePicker.launchImageLibraryAsync({ ...opts, allowsMultipleSelection: false });
      }
      if (res.canceled) return;
      const asset = res.assets[0];
      if (!asset) return;
      const check = validateAvatar(asset);
      if (!check.ok) { onNotice(check.reason); return; }
      onPicked(asset.uri);
    } catch {
      onNotice('Não foi possível abrir a imagem. Tente de novo.');
    } finally {
      busy.current = false;
    }
  }, [onPicked, onNotice]);
}
