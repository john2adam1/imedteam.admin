'use client';

import { useState, useEffect } from 'react';
import { AppConfig } from '@/types';
import { appRouteService } from '@/services/app-route.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
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
            toast.error('Ilova sozlamalarini yuklashda xatolik');
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
            toast.success('Sozlamalar muvaffaqiyatli saqlandi');
            loadConfig();
        } catch (error: any) {
            console.error('Failed to save app config:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Sozlamalarni saqlashda xatolik';
            toast.error(`Xatolik: ${errorMessage}`);
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
        return <div className="text-center py-8 text-muted-foreground">Sozlamalar yuklanmoqda...</div>;
    }

    if (!config) {
        return <div className="text-center py-8 text-destructive">Sozlamalarni yuklashda xatolik.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Ilova Sozlamalari</h1>
                <Button onClick={handleSubmit} disabled={saving}>
                    {saving ? 'Saqlanmoqda...' : 'O\'zgarishlarni saqlash'}
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Aloqa va Yordam</CardTitle>
                        <CardDescription>Rasmiy aloqa ma'lumotlari va yordam kanallari.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="Call Markaz"
                            value={config.call_center ?? ''}
                            onChange={(e) => handleChange('call_center', e.target.value)}
                            placeholder="+998901234567"
                            required
                        />
                        <Input
                            label="Yordam URL (Telegram)"
                            value={config.support_url ?? ''}
                            onChange={(e) => handleChange('support_url', e.target.value)}
                            placeholder="https://t.me/support"
                            required
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ilova Versiyalari va To'lovlar</CardTitle>
                        <CardDescription>Minimal versiyalar va to'lovlarni boshqarish.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Android Versiya"
                                value={config.app_version?.android ?? ''}
                                onChange={(e) => handleChange('app_version.android', e.target.value)}
                                placeholder="1.0.0"
                                required
                            />
                            <Input
                                label="iOS Versiya"
                                value={config.app_version?.ios ?? ''}
                                onChange={(e) => handleChange('app_version.ios', e.target.value)}
                                placeholder="1.0.0"
                                required
                            />
                        </div>
                        <Input
                            label="Minimal To'lov Versiyasi"
                            value={config.payment_min_version ?? ''}
                            onChange={(e) => handleChange('payment_min_version', e.target.value)}
                            placeholder="1.0.0"
                            required
                        />
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Yuklab olish havolalari</CardTitle>
                        <CardDescription>Foydalanuvchilar uchun ilova do'konlariga havolalar.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Google Play Store Havolasi"
                            value={config.app_links?.google ?? ''}
                            onChange={(e) => handleChange('app_links.google', e.target.value)}
                            placeholder="https://play.google.com/..."
                            required
                        />
                        <Input
                            label="Apple App Store Havolasi"
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
