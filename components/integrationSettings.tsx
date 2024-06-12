// components/IntegrationSettings.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { upsertIntegration, disconnectIntegration, listChatbotIntegrations } from '@/lib/prismaOperations';
import { Form, FormField, FormItem, FormControl, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { buttonVariants } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

function IntegrationSettings({ chatbot }) {
    const [integrations, setIntegrations] = useState([]);

    useEffect(() => {
        fetchIntegrations();
    }, [chatbot.id]);

    const fetchIntegrations = async () => {
        const integrationData = await listChatbotIntegrations(chatbot.id);
        setIntegrations(integrationData);
    };

    const handleConnect = async (platform) => {
        const { platformId, accessToken } = await triggerOAuthFlow(platform); // Ensure this function handles OAuth flow
        await upsertIntegration(chatbot.id, platform, platformId, accessToken);
        fetchIntegrations();
    };

    const handleDisconnect = async (platform) => {
        await disconnectIntegration(chatbot.id, platform);
        fetchIntegrations();
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
                                    onCheckedChange={() => integration.connected ? handleDisconnect(integration.platform) : handleConnect(integration.platform)}
                                />
                            </FormControl>
                        </FormItem>
                    </FormField>
                ))}
                {/* Additional button to connect to Facebook if not already connected */}
                {!integrations.some(int => int.platform === 'facebook' && int.connected) && (
                    <button
                        onClick={() => handleConnect('facebook')}
                        className={buttonVariants({ variant: 'solid' })}
                    >
                        Connect to Facebook
                    </button>
                )}
            </div>
        </Form>
    );
}

export default IntegrationSettings;
