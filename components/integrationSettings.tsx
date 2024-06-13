"use client";
import React, { useState, useEffect } from 'react';
import { upsertIntegration, disconnectIntegration, listChatbotIntegrations } from '@/lib/prismaOperations';
import { Form, FormField, FormItem, FormControl, FormLabel, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';

function IntegrationSettings({ chatbot }) {
    const [integrations, setIntegrations] = useState([]);
    const [isFacebookConnected, setIsFacebookConnected] = useState(false);

    useEffect(() => {
        const fetchIntegrations = async () => {
            try {
                const integrationData = await listChatbotIntegrations(chatbot.id);
                if (integrationData && integrationData.length > 0) {
                    setIntegrations(integrationData);
                    // Check if Facebook is already connected in the fetched integrations
                    const fbIntegration = integrationData.find(int => int.platform === 'facebook');
                    setIsFacebookConnected(fbIntegration?.connected ?? false);
                } else {
                    console.log("No integrations found for this chatbot.");
                    setIsFacebookConnected(false);  // Ensure this is set to false if no integrations exist
                }
            } catch (error) {
                console.error("Error fetching integrations:", error);
            }
        };

        fetchIntegrations();
    }, [chatbot.id]);

    const handleToggle = (platform) => {
        const integration = integrations.find(int => int.platform === platform);
        if (integration) {
            if (integration.connected) {
                handleDisconnect(platform);
            } else {
                handleConnect(platform);
            }
        } else {
            console.log("No integration found for this platform:", platform);
        }
    };

    const handleToggleFacebook = async () => {
        if (isFacebookConnected) {
            console.log("Disconnecting Facebook");
            await handleDisconnect('facebook');
        } else {
            console.log("Connecting Facebook");
            await handleConnect('facebook');
        }
        setIsFacebookConnected(!isFacebookConnected);
    };

    const handleConnect = async (platform) => {
        console.log(`Connecting to ${platform}`);
        // Implement connection logic here, including obtaining access tokens
    };

    const handleDisconnect = async (platform) => {
        console.log(`Disconnecting from ${platform}`);
        // Implement disconnection logic here
    };

    return (
        <Form>
            <div className="space-y-6">
                <h3 className="text-lg font-semibold">Manage Your Integrations</h3>
                {integrations.length > 0 ? integrations.map(integration => (
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
                )) : (
                    <div>No integrations available. Please set up new integrations.</div>
                )}
                <FormField>
                    <FormItem className="flex justify-between items-center p-4 border rounded-lg">
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                            <Switch
                                checked={isFacebookConnected}
                                onCheckedChange={handleToggleFacebook}
                            />
                        </FormControl>
                    </FormItem>
                </FormField>
            </div>
        </Form>
    );
}

export default IntegrationSettings;
