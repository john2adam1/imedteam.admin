'use client';

import { useState } from 'react';
import { User, Teacher } from '@/types';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';

interface PasswordUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | Teacher | null;
    defaultRole?: string;
    onSubmit: (userId: string, role: string) => Promise<string>;
}

export function PasswordUpdateModal({ isOpen, onClose, user, defaultRole, onSubmit }: PasswordUpdateModalProps) {
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleClose = () => {
        setGeneratedPassword('');
        setError('');
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        try {
            setLoading(true);
            setError('');
            const role = user.role || defaultRole || 'user';
            const password = await onSubmit(user.id, role);
            setGeneratedPassword(password);
        } catch (err: any) {
            console.error('Failed to reset password:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedPassword);
        alert('Password copied to clipboard!');
    };

    if (!user) return null;

    const userName = user.name || 'User';
    const userPhone = user.phone_number;
    const userRole = user.role || defaultRole || 'user';

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Reset Password for ${userName}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">User Information</label>
                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                        <p><strong>Name:</strong> {userName}</p>
                        <p><strong>Phone:</strong> {userPhone}</p>
                        <p><strong>Role:</strong> {userRole}</p>
                    </div>
                </div>

                {!generatedPassword ? (
                    <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md text-sm text-yellow-800">
                            <strong>Warning:</strong> This will generate a new random password for the user. The old password will stop working immediately.
                        </div>
                        <div className="flex gap-2 justify-end pt-4">
                            <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Generating...' : 'Generate New Password'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 p-4 rounded-md text-center">
                            <p className="text-green-800 font-medium mb-2">Password Generated Successfully!</p>
                            <div className="flex items-center gap-2 justify-center">
                                <code className="bg-white px-4 py-2 rounded border border-green-300 text-lg font-mono font-bold select-all">
                                    {generatedPassword}
                                </code>
                                <Button type="button" size="sm" onClick={copyToClipboard}>
                                    Copy
                                </Button>
                            </div>
                            <p className="text-xs text-green-700 mt-2">
                                Please copy this password and share it with the user correctly. You will not be able to see it again after closing this window.
                            </p>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button type="button" onClick={handleClose}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                        {error}
                    </div>
                )}
            </form>
        </Modal>
    );
}
