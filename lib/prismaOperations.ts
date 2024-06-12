// lib/prismaOperations.ts
import prisma from './prisma';

export async function upsertIntegration(chatbotId, platform, platformId, accessToken) {
  return prisma.integration.upsert({
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
  return prisma.integration.updateMany({
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
  return prisma.integration.findMany({
    where: {
      chatbotId,
      connected: true
    }
  });
}
