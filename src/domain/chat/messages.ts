/** Regras puras do chat com a Aurora (sem UI, sem rede): tudo fica na memória do aparelho. */

export type ChatAuthor = 'user' | 'aurora';

interface BaseMessage {
  id: string;
  author: ChatAuthor;
  /** Epoch em ms. */
  at: number;
}
export interface TextMessage extends BaseMessage { kind: 'text'; text: string }
export interface ImageMessage extends BaseMessage { kind: 'image'; uri: string; width: number; height: number }
export interface AudioMessage extends BaseMessage { kind: 'audio'; uri: string; durationMs: number }
export type ChatMessage = TextMessage | ImageMessage | AudioMessage;

export const MAX_TEXT_LENGTH = 1000;
export const MAX_MESSAGES = 300;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_AUDIO_MS = 2 * 60 * 1000;
export const MIN_AUDIO_MS = 500;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'] as const;

/**
 * Limpa o texto digitado: remove caracteres de controle e de direção invisíveis (usados para "disfarçar" texto),
 * normaliza quebras de linha, limita linhas em branco seguidas e corta no tamanho máximo.
 * (O RN renderiza <Text> como texto puro, sem HTML/Markdown, então não há injeção de marcação.)
 */
export function sanitizeText(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F​-‏‪-‮⁦-⁩﻿]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_TEXT_LENGTH);
}

export function canSend(raw: string): boolean {
  return sanitizeText(raw).length > 0;
}

export type MediaCheck = { ok: true } | { ok: false; reason: string };

/** Valida a imagem escolhida: só tipos de foto conhecidos e tamanho máximo (quando o sistema informa). */
export function validateImage(a: { mimeType?: string | null; fileSize?: number | null; uri?: string | null }): MediaCheck {
  if (!a.uri) return { ok: false, reason: 'Não consegui abrir essa imagem. Tente outra.' };
  const type = a.mimeType?.toLowerCase();
  if (type && !(ALLOWED_IMAGE_TYPES as readonly string[]).includes(type)) {
    return { ok: false, reason: 'Formato não suportado. Envie uma foto JPG, PNG, WebP ou HEIC.' };
  }
  if (a.fileSize != null && a.fileSize > MAX_IMAGE_BYTES) {
    return { ok: false, reason: `A foto é grande demais (máx. ${MAX_IMAGE_BYTES / 1024 / 1024} MB).` };
  }
  return { ok: true };
}

export function validateAudio(durationMs: number, uri: string | null | undefined): MediaCheck {
  if (!uri) return { ok: false, reason: 'A gravação falhou. Tente de novo.' };
  if (durationMs < MIN_AUDIO_MS) return { ok: false, reason: 'Áudio muito curto. Segure um pouco mais.' };
  return { ok: true };
}

/** Tamanho de exibição da foto na bolha: respeita a proporção dentro de uma caixa máxima. */
export function fitImage(width: number, height: number, maxW: number, maxH: number): { width: number; height: number } {
  if (!(width > 0) || !(height > 0)) return { width: maxW, height: Math.round(maxW * 0.75) };
  const k = Math.min(maxW / width, maxH / height, 1);
  return { width: Math.max(1, Math.round(width * k)), height: Math.max(1, Math.round(height * k)) };
}

/** "0:07", "1:05". */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round((Number.isFinite(ms) ? ms : 0) / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** "14:05" (24h, fuso local). */
export function formatTime(at: number): string {
  const d = new Date(at);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Mantém só as últimas `max` mensagens (evita crescer sem limite na memória). */
export function capMessages<T>(list: readonly T[], max = MAX_MESSAGES): T[] {
  return list.length > max ? list.slice(list.length - max) : [...list];
}

let seq = 0;
/** Id local, único na sessão (não precisa ser criptográfico: nada sai do aparelho). */
export function nextMessageId(): string {
  seq += 1;
  return `m${Date.now().toString(36)}${seq}`;
}

export interface DateSeparator { kind: 'date'; id: string; label: string }
export type ChatRow = ChatMessage | DateSeparator;

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function startOfDay(at: number): number {
  const d = new Date(at);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** "Hoje", "Ontem", dia da semana (últimos 6 dias) ou "03/11/2026". */
export function dayLabel(at: number, now: number = Date.now()): string {
  const diff = Math.round((startOfDay(now) - startOfDay(at)) / 86_400_000);
  if (diff <= 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  const d = new Date(at);
  if (diff < 7) return WEEKDAYS[d.getDay()]!;
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

/** Insere um separador de data antes da primeira mensagem de cada dia. */
export function withDateSeparators(messages: readonly ChatMessage[], now: number = Date.now()): ChatRow[] {
  const out: ChatRow[] = [];
  let lastDay = -1;
  for (const m of messages) {
    const day = startOfDay(m.at);
    if (day !== lastDay) {
      out.push({ kind: 'date', id: `d${day}`, label: dayLabel(m.at, now) });
      lastDay = day;
    }
    out.push(m);
  }
  return out;
}
