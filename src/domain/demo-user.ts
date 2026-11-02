/** Usuário fictício do fluxo de demonstração (sem backend). */
export interface DemoUser {
  firstName: string;
  fullName: string;
  email: string;
}

export const DEMO_USER: DemoUser = { firstName: 'Vinicius', fullName: 'Vinicius Caon', email: 'vinicius@email.com' };

/** Iniciais (até 2 letras, maiúsculas) a partir do nome completo. Ex.: "Vinicius Costa" -> "VC". */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0]!.charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : '';
  return (first + last).toUpperCase();
}
