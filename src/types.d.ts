declare namespace App {
  interface Locals {
    user: User;
  }

  interface User {
    id: string;
    email: string | null;
    name: string;
    role: 'ADMIN' | 'COORDENADOR' | 'LIDER' | 'LIDER_TREINAMENTO' | 'MEMBRO';
  }
}
