// components/IntegrationSettings.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { upsertIntegration, disconnectIntegration, listChatbotIntegrations } from '@/lib/prismaOperations';

function IntegrationSettings({ chatbot }) {
    const [integrations, setIntegrations] = useState([]);

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        const integrationData = await listChatbotIntegrations(chatbot.id);
        setIntegrations(integrationData);
    };

    const handleConnect = async (platform) => {
        // This should trigger the OAuth flow and handle integration logic
        const { platformId, accessToken } = await triggerOAuthFlow(platform);
        await upsertIntegration(chatbot.id, platform, platformId, accessToken);
        fetchIntegrations();
    };

    const handleDisconnect = async (platform) => {
        await disconnectIntegration(chatbot.id, platform);
        fetchIntegrations();
    };

    return (
        <div>
            <h3>Manage Your Integrations</h3>
            {integrations.map(integration => (
                <div key={integration.platform}>
                    <p>{integration.platform} is {integration.connected ? 'connected' : 'not connected'}.</p>
                    <button onClick={() => integration.connected ? handleDisconnect(integration.platform) : handleConnect(integration.platform)}>
                        {integration.connected ? 'Disconnect' : 'Connect'}
                    </button>
                </div>
            ))}
            {/* Button to connect to Facebook if not already connected */}
            {!integrations.some(int => int.platform === 'facebook' && int.connected) && (
                <button onClick={() => handleConnect('facebook')}>Connect to Facebook</button>
            )}
        </div>
    );
}

export default IntegrationSettings;
