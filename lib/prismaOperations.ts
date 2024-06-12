// lib/prismaOperations.ts
import { db } from '@/lib/db';

export async function upsertIntegration(chatbotId, platform, platformId, accessToken) {
  return db.integration.upsert({
    where: {
      chatbotId_platform: { chatbotId, platform }
    },
    update: {
      platformId,
      accessToken,
      connected: true
    },
    create: {
      chatbotId,
      platform,
      platformId,
      accessToken,
      connected: true
    }
  });
}

export async function disconnectIntegration(chatbotId, platform) {
  return db.integration.updateMany({
    where: {
      chatbotId,
      platform
    },
    data: {
      connected: false,
      accessToken: ''
    }
  });
}

export async function listChatbotIntegrations(chatbotId) {
  return db.integration.findMany({
    where: {
      chatbotId,
      connected: true
    }
  });
}
