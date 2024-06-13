// components/IntegrationSettings.tsx
"use client";
import React, { useState, useEffect } from 'react';
// import { upsertIntegration, disconnectIntegration, listChatbotIntegrations } from '@/lib/prismaOperations';
import { Form, FormField, FormItem, FormControl, FormLabel, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';

function IntegrationSettings({ chatbot }) {
    const [integrations, setIntegrations] = useState([]);

    useEffect(() => {
        // Mock data to focus on aesthetics
        setIntegrations([
            { platform: 'facebook', connected: false },
            { platform: 'twitter', connected: true }
        ]);

        // const fetchIntegrations = async () => {
        //     try {
        //         const integrationData = await listChatbotIntegrations(chatbot.id);
        //         setIntegrations(integrationData);
        //     } catch (error) {
        //         console.error("Error fetching integrations:", error);
        //         // Handle or display error appropriately
        //     }
        // };
        // fetchIntegrations();
    }, [chatbot.id]);

    // Commented out functional handlers
    // const handleConnect = async (platform) => {
    //     const { platformId, accessToken } = await triggerOAuthFlow(platform);
    //     await upsertIntegration(chatbot.id, platform, platformId, accessToken);
    //     fetchIntegrations();
    // };

    // const handleDisconnect = async (platform) => {
    //     await disconnectIntegration(chatbot.id, platform);
    //     fetchIntegrations();
    // };

    const handleToggle = (platform) => {
        // Log actions to console instead of performing them
        console.log(`${platform} toggle clicked`);
        // Update local state to simulate toggle for aesthetic purposes
        setIntegrations(integrations.map(int => {
            if (int.platform === platform) {
                return { ...int, connected: !int.connected };
            }
            return int;
        }));
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
            </div>
        </Form>
    );
}

export default IntegrationSettings;
