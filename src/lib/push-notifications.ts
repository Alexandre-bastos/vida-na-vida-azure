import prisma from './prisma';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export type PushTargetType = 'ALL' | 'ROLE' | 'CELL' | 'USER';

/**
 * Resgata os tokens de push dos usuários com base nos filtros selecionados.
 */
export async function getTargetTokens(
  targetType: PushTargetType,
  targetValue?: string
): Promise<string[]> {
  let tokens: string[] = [];

  try {
    switch (targetType) {
      case 'ALL': {
        // Buscar todos os tokens de usuários ativos
        const pushTokens = await prisma.pushtoken.findMany({
          where: {
            user: { active: true }
          },
          select: { token: true }
        });
        tokens = pushTokens.map(t => t.token);
        break;
      }

      case 'ROLE': {
        // Buscar tokens de usuários ativos com o cargo (Role) específico
        if (!targetValue) break;
        const pushTokens = await prisma.pushtoken.findMany({
          where: {
            user: {
              active: true,
              role: targetValue
            }
          },
          select: { token: true }
        });
        tokens = pushTokens.map(t => t.token);
        break;
      }

      case 'CELL': {
        // Buscar tokens de usuários que pertencem a uma célula específica
        if (!targetValue) break;

        // 1. Membros ativos da célula (com fim de filiação nulo)
        const memberships = await prisma.cellmembership.findMany({
          where: {
            cellId: targetValue,
            endDate: null,
            user: { active: true }
          },
          select: {
            user: {
              select: {
                pushTokens: {
                  select: { token: true }
                }
              }
            }
          }
        });

        const memberTokens = memberships.flatMap(m => 
          m.user.pushTokens.map(pt => pt.token)
        );
        tokens.push(...memberTokens);

        // 2. Líder da célula
        const cellInfo = await prisma.cell.findUnique({
          where: { id: targetValue },
          select: {
            leader: {
              select: {
                pushTokens: {
                  select: { token: true }
                }
              }
            }
          }
        });

        if (cellInfo?.leader?.pushTokens) {
          const leaderTokens = cellInfo.leader.pushTokens.map(pt => pt.token);
          tokens.push(...leaderTokens);
        }
        break;
      }

      case 'USER': {
        // Buscar tokens de um usuário específico ativo
        if (!targetValue) break;
        const pushTokens = await prisma.pushtoken.findMany({
          where: {
            userId: targetValue,
            user: { active: true }
          },
          select: { token: true }
        });
        tokens = pushTokens.map(t => t.token);
        break;
      }
    }
  } catch (error) {
    console.error('[PUSH-RESOLVER] Erro ao carregar destinatários para push:', error);
  }

  // Filtrar tokens válidos do Expo (geralmente começam com ExponentPushToken) e remover duplicados
  const uniqueTokens = Array.from(new Set(tokens)).filter(t => 
    t && (t.startsWith('ExponentPushToken') || t.length > 10)
  );

  console.log(`[PUSH-RESOLVER] Filtro [${targetType} - ${targetValue || ''}] resolveu em ${uniqueTokens.length} aparelhos únicos.`);
  return uniqueTokens;
}

/**
 * Dispara as notificações push para uma lista de tokens em blocos (chunking) de até 100.
 */
export async function sendPushNotifications(
  tokens: string[],
  payload: PushNotificationPayload
): Promise<{ successCount: number; failureCount: number }> {
  if (tokens.length === 0) {
    return { successCount: 0, failureCount: 0 };
  }

  let successCount = 0;
  let failureCount = 0;

  // Divisão em blocos de até 100 (limite recomendado pela API da Expo)
  const chunks: string[][] = [];
  for (let i = 0; i < tokens.length; i += 100) {
    chunks.push(tokens.slice(i, i + 100));
  }

  console.log(`[PUSH-SENDER] Iniciando disparo de ${tokens.length} pushes divididos em ${chunks.length} bloco(s).`);

  for (const chunk of chunks) {
    const messages = chunk.map(token => ({
      to: token,
      sound: 'default',
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
    }));

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      if (response.ok) {
        const result = await response.json();
        // A API da Expo retorna uma lista de status individuais para cada mensagem
        const details = result.data || [];
        details.forEach((item: any) => {
          if (item.status === 'ok') {
            successCount++;
          } else {
            failureCount++;
            console.error('[PUSH-SENDER] Falha na entrega de um token:', item.message);
          }
        });
      } else {
        failureCount += chunk.length;
        const errText = await response.text();
        console.error(`[PUSH-SENDER] Servidor da Expo retornou erro HTTP ${response.status}:`, errText);
      }
    } catch (error) {
      failureCount += chunk.length;
      console.error('[PUSH-SENDER] Erro crítico ao fazer requisição POST para Expo:', error);
    }
  }

  console.log(`[PUSH-SENDER] Relatório Final: ${successCount} enviados com sucesso, ${failureCount} falhas.`);
  return { successCount, failureCount };
}
