'use client';

import React, { useState } from 'react';
import { MultilangText } from '@/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

interface MultilangInputProps {
  label?: string;
  value: MultilangText;
  onChange: (value: MultilangText) => void;
  placeholder?: {
    uz?: string;
    ru?: string;
    en?: string;
  };
  required?: boolean;
  error?: string;
}

export function MultilangInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
}: MultilangInputProps) {
  const [activeTab, setActiveTab] = useState<'uz' | 'ru' | 'en'>('uz');
  const safeValue = value || { uz: '', ru: '', en: '' };

  const handleChange = (lang: 'uz' | 'ru' | 'en', text: string) => {
    onChange({
      ...safeValue,
      [lang]: text,
    });
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium leading-none mb-2">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'uz' | 'ru' | 'en')}>
        <TabsList className="mb-3">
          <TabsTrigger value="uz">UZ</TabsTrigger>
          <TabsTrigger value="ru">RU</TabsTrigger>
          <TabsTrigger value="en">EN</TabsTrigger>
        </TabsList>
        <TabsContent value="uz">
          <input
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={safeValue.uz || ''}
            onChange={(e) => handleChange('uz', e.target.value)}
            placeholder={placeholder?.uz}
            required={required && activeTab === 'uz'}
          />
        </TabsContent>
        <TabsContent value="ru">
          <input
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={safeValue.ru || ''}
            onChange={(e) => handleChange('ru', e.target.value)}
            placeholder={placeholder?.ru}
            required={required && activeTab === 'ru'}
          />
        </TabsContent>
        <TabsContent value="en">
          <input
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={safeValue.en || ''}
            onChange={(e) => handleChange('en', e.target.value)}
            placeholder={placeholder?.en}
            required={required && activeTab === 'en'}
          />
        </TabsContent>
      </Tabs>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}

