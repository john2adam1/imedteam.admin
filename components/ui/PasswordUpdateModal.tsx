'use client';

import { useState } from 'react';
import { User } from '@/types';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';

interface PasswordUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSubmit: (userId: string, newPassword: string) => Promise<void>;
}

export function PasswordUpdateModal({ isOpen, onClose, user, onSubmit }: PasswordUpdateModalProps) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleClose = () => {
        setNewPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setError('');
        onClose();
    };

    const validatePassword = (): boolean => {
        setError('');

        if (!newPassword || newPassword.trim() === '') {
            setError('Password is required');
            return false;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        if (!validatePassword()) {
            return;
        }

        try {
            setLoading(true);
            setError('');
            await onSubmit(user.id, newPassword);
            handleClose();
        } catch (err: any) {
            console.error('Failed to update password:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Reset Password for ${user.first_name} ${user.last_name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">User Information</label>
                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                        <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
                        <p><strong>Phone:</strong> {user.phone}</p>
                    </div>
                </div>

                <div className="relative">
                    <Input
                        label="New Password"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="Enter new password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-sm text-blue-600 hover:text-blue-800"
                    >
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                </div>

                <Input
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm new password"
                />

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-md">
                    <strong>Password Requirements:</strong>
                    <ul className="list-disc list-inside mt-1">
                        <li>Minimum 6 characters</li>
                        <li>Both passwords must match</li>
                    </ul>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
