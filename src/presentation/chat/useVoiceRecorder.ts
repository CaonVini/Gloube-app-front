import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MAX_AUDIO_MS, validateAudio } from '../../domain/chat/messages';

interface Options {
  onRecorded: (r: { uri: string; durationMs: number }) => void;
  onError: (message: string) => void;
}

/**
 * Gravação de áudio com toque para iniciar/parar. Pede o microfone só no primeiro uso, limita a duração
 * (o próprio recorder para em MAX_AUDIO_MS) e libera o microfone ao parar, cancelar ou sair da tela.
 */
export function useVoiceRecorder({ onRecorded, onError }: Options) {
  const recorder = useAudioRecorder({ ...RecordingPresets.LOW_QUALITY, isMeteringEnabled: true }); // voz: arquivo pequeno
  const state = useAudioRecorderState(recorder, 200);
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const sawRecording = useRef(false);
  const cb = useRef({ onRecorded, onError });
  cb.current = { onRecorded, onError };

  const release = useCallback(async () => {
    try { await setAudioModeAsync({ allowsRecording: false }); } catch { /* sem efeito na web */ }
  }, []);

  const finish = useCallback(async (discard: boolean) => {
    if (!activeRef.current) return;
    activeRef.current = false;
    sawRecording.current = false;
    setActive(false);
    let durationMs = 0;
    try {
      durationMs = recorder.getStatus().durationMillis;
      await recorder.stop();
    } catch { /* já parado */ }
    await release();
    if (discard) return;
    const uri = recorder.uri;
    const check = validateAudio(durationMs, uri);
    if (!check.ok) { cb.current.onError(check.reason); return; }
    cb.current.onRecorded({ uri: uri!, durationMs: Math.min(durationMs, MAX_AUDIO_MS) });
  }, [recorder, release]);

  const start = useCallback(async () => {
    if (activeRef.current) return;
    try {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        cb.current.onError(perm.canAskAgain
          ? 'Preciso do microfone para gravar o áudio. Toque no microfone de novo e permita o acesso.'
          : 'O microfone está bloqueado. Ative a permissão nas configurações do aparelho ou do navegador.');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record({ forDuration: MAX_AUDIO_MS / 1000 });
      activeRef.current = true;
      setActive(true);
    } catch {
      activeRef.current = false;
      setActive(false);
      await release();
      cb.current.onError('Não consegui acessar o microfone neste aparelho ou navegador.');
    }
  }, [recorder, release]);

  // Se o recorder parar sozinho (limite de duração), finaliza como envio normal.
  useEffect(() => {
    if (!active) return;
    if (state.isRecording) { sawRecording.current = true; return; }
    if (sawRecording.current) void finish(false);
  }, [active, state.isRecording, finish]);

  // Sair da tela com gravação ativa: para e descarta (libera o microfone).
  useEffect(() => () => { void finish(true); }, [finish]);

  return {
    recording: active,
    durationMs: active ? state.durationMillis : 0,
    /** Nível do microfone em dBFS (pode faltar em alguns aparelhos). */
    metering: active ? state.metering : undefined,
    start,
    stopAndSend: useCallback(() => finish(false), [finish]),
    cancel: useCallback(() => finish(true), [finish]),
  };
}
