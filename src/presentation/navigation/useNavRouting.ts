import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { navHref } from './nav-items';

/**
 * Navegação da barra inferior. Só as abas com tela pronta navegam (Planeje e Aurora); as demais continuam
 * fictícias (sem efeito). Saindo da Aurora trocamos a tela (replace) para não empilhar abas no histórico.
 */
export function useNavRouting(activeKey: string) {
  const router = useRouter();
  return useCallback((key: string) => {
    if (key === activeKey) return;
    const href = navHref(key);
    if (!href) return;
    if (activeKey === 'aurora') router.replace(href as never);
    else router.push(href as never);
  }, [router, activeKey]);
}
