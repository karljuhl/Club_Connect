"use client";
import React, { useState, useEffect } from 'react';
import { upsertIntegration, disconnectIntegration, listChatbotIntegrations } from '@/lib/prismaOperations';
import { Form, FormField, FormItem, FormControl, FormLabel, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';

function IntegrationSettings({ chatbot }) {
    const [integrations, setIntegrations] = useState([]);

    console.log("Chatbot prop:", chatbot);  // Log the chatbot prop to verify it's passed correctly

    useEffect(() => {
        const fetchIntegrations = async () => {
            console.log("Fetching integrations for chatbot ID:", chatbot?.id);  // Log to check chatbot ID before fetching
            try {
                const integrationData = await listChatbotIntegrations(chatbot.id);
                console.log("Fetched integrations:", integrationData);  // Log fetched data
                setIntegrations(integrationData);
            } catch (error) {
                console.error("Error fetching integrations:", error);
            }
        };

        fetchIntegrations();
    }, [chatbot.id]);

    const handleConnect = async (platform) => {
        console.log("Attempting to connect platform:", platform);  // Log which platform is being connected
        try {
            const { platformId, accessToken } = await triggerOAuthFlow(platform);
            console.log("Received platform ID and access token:", platformId, accessToken);  // Log received IDs and tokens
            await upsertIntegration(chatbot.id, platform, platformId, accessToken);
            fetchIntegrations();
        } catch (error) {
            console.error("Failed to connect:", error);
        }
    };

    const handleDisconnect = async (platform) => {
        console.log("Attempting to disconnect platform:", platform);  // Log which platform is being disconnected
        try {
            await disconnectIntegration(chatbot.id, platform);
            fetchIntegrations();
        } catch (error) {
            console.error("Failed to disconnect:", error);
        }
    };

    const handleToggle = (platform) => {
        console.log("Toggling platform:", platform);  // Log which platform toggle is being initiated
        const integration = integrations.find(int => int.platform === platform);
        console.log("Current integration status:", integration);  // Log the current status of the integration
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
