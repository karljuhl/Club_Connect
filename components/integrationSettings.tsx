// components/IntegrationSettings.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { upsertIntegration, disconnectIntegration, listChatbotIntegrations } from '@/lib/prismaOperations';
import { Form, FormField, FormItem, FormControl, FormLabel, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';

function IntegrationSettings({ chatbot }) {
    const [integrations, setIntegrations] = useState([]);

    useEffect(() => {
        const fetchIntegrations = async () => {
            try {
                const integrationData = await listChatbotIntegrations(chatbot.id);
                setIntegrations(integrationData);
            } catch (error) {
                console.error("Error fetching integrations:", error);
                // Handle or display error appropriately
            }
        };

        fetchIntegrations();
    }, [chatbot.id]);

    const handleConnect = async (platform) => {
        try {
            const { platformId, accessToken } = await triggerOAuthFlow(platform);
            await upsertIntegration(chatbot.id, platform, platformId, accessToken);
            fetchIntegrations();
        } catch (error) {
            console.error("Failed to connect:", error);
            // Optionally handle error in UI, such as showing a notification or message
        }
    };

    const handleDisconnect = async (platform) => {
        try {
            await disconnectIntegration(chatbot.id, platform);
            fetchIntegrations();
        } catch (error) {
            console.error("Failed to disconnect:", error);
            // Optionally handle error in UI
        }
    };

    const handleToggle = (platform) => {
        const integration = integrations.find(int => int.platform === platform);
        if (integration) {
            if (integration.connected) {
                handleDisconnect(platform);
            } else {
                handleConnect(platform);
            }
        }
    };

    return (
        <Form>
            <div className="space-y-6">
                <h3 className="text-lg font-semibold">Manage Your Integrations</h3>
                {integrations.map(integration => (
                    <FormField key={integration.platform}>
                        <FormItem className="flex justify-between items-center p-4 border rounded-lg">
                            <div>
                                <FormLabel>{integration.platform.charAt(0).toUpperCase() + integration.platform.slice(1)}</FormLabel>
                                <FormDescription>
                                    {integration.connected ? 'Integration is currently connected.' : 'Integration is not connected.'}
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={integration.connected}
                                    onCheckedChange={() => handleToggle(integration.platform)}
                                />
                            </FormControl>
                        </FormItem>
                    </FormField>
                ))}
                {/* Toggle switch for Facebook connection */}
                <FormField>
                    <FormItem className="flex justify-between items-center p-4 border rounded-lg">
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                            <Switch
                                checked={integrations.some(int => int.platform === 'facebook' && int.connected)}
                                onCheckedChange={() => handleToggle('facebook')}
                            />
                        </FormControl>
                    </FormItem>
                </FormField>
            </div>
        </Form>
    );
}

export default IntegrationSettings;
