'use client';

import { useState, useEffect } from 'react';
import { AppConfig } from '@/types';
import { appRouteService } from '@/services/app-route.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AppConfigPage() {
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const defaultConfig: AppConfig = {
        call_center: '',
        support_url: '',
        app_version: { android: '', ios: '' },
        app_links: { google: '', apple: '' },
        payment_min_version: ''
    };

    const loadConfig = async () => {
        try {
            setLoading(true);
            const data = await appRouteService.get();
            // Deep merge or at least ensure top level objects exist
            const mergedConfig = {
                ...defaultConfig,
                ...data,
                app_version: { ...defaultConfig.app_version, ...data?.app_version },
                app_links: { ...defaultConfig.app_links, ...data?.app_links },
            };
            setConfig(mergedConfig);
        } catch (error: any) {
            console.error('Failed to load app config:', error);
            toast.error('Failed to load app configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!config) return;

        try {
            setSaving(true);
            await appRouteService.update(config);
            toast.success('Configuration saved successfully');
            loadConfig();
        } catch (error: any) {
            console.error('Failed to save app config:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save configuration';
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (path: string, value: string) => {
        if (!config) return;
        const newConfig = { ...config };

        // Handle nested paths like 'app_version.android'
        const keys = path.split('.');
        let current: any = newConfig;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {}; // Initialize if missing
            }
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;

        setConfig(newConfig);
    };

    if (loading) {
        return <div className="text-center py-8 text-muted-foreground">Loading configuration...</div>;
    }

    if (!config) {
        return <div className="text-center py-8 text-destructive">Failed to load configuration.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">App Configuration</h1>
                <Button onClick={handleSubmit} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact & Support</CardTitle>
                        <CardDescription>Official contact information and support channels.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="Call Center"
                            value={config.call_center ?? ''}
                            onChange={(e) => handleChange('call_center', e.target.value)}
                            placeholder="+998901234567"
                            required
                        />
                        <Input
                            label="Support URL (Telegram)"
                            value={config.support_url ?? ''}
                            onChange={(e) => handleChange('support_url', e.target.value)}
                            placeholder="https://t.me/support"
                            required
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>App Versions & Payments</CardTitle>
                        <CardDescription>Control minimum versions and payment enforcement.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Android Version"
                                value={config.app_version?.android ?? ''}
                                onChange={(e) => handleChange('app_version.android', e.target.value)}
                                placeholder="1.0.0"
                                required
                            />
                            <Input
                                label="iOS Version"
                                value={config.app_version?.ios ?? ''}
                                onChange={(e) => handleChange('app_version.ios', e.target.value)}
                                placeholder="1.0.0"
                                required
                            />
                        </div>
                        <Input
                            label="Payment Min Version"
                            value={config.payment_min_version ?? ''}
                            onChange={(e) => handleChange('payment_min_version', e.target.value)}
                            placeholder="1.0.0"
                            required
                        />
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Download Links</CardTitle>
                        <CardDescription>Links to app stores for user downloads.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Google Play Store Link"
                            value={config.app_links?.google ?? ''}
                            onChange={(e) => handleChange('app_links.google', e.target.value)}
                            placeholder="https://play.google.com/..."
                            required
                        />
                        <Input
                            label="Apple App Store Link"
                            value={config.app_links?.apple ?? ''}
                            onChange={(e) => handleChange('app_links.apple', e.target.value)}
                            placeholder="https://apps.apple.com/..."
                            required
                        />
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
