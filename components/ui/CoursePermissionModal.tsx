'use client';

import { useState, useEffect } from 'react';
import { User, Course, Tariff } from '@/types';
import { Modal } from './Modal';
import { Select } from './Select';
import { Button } from './Button';

interface CoursePermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    courses: Course[];
    tariffs: Tariff[];
    onSubmit: (data: { userId: string, courseId: string, tariffId: string, startedAt: string, endedAt: string }) => Promise<void>;
}

export function CoursePermissionModal({
    isOpen,
    onClose,
    user,
    courses,
    tariffs,
    onSubmit
}: CoursePermissionModalProps) {
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedTariffId, setSelectedTariffId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleClose = () => {
        setSelectedCourseId('');
        setSelectedTariffId('');
        setError('');
        onClose();
    };

    const validateForm = (): boolean => {
        setError('');

        if (!selectedCourseId || selectedCourseId.trim() === '') {
            setError('Please select a course');
            return false;
        }

        if (!selectedTariffId || selectedTariffId.trim() === '') {
            setError('Please select a tariff');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError('');

            const selectedTariff = tariffs.find(t => t.id === selectedTariffId);
            if (!selectedTariff) throw new Error('Selected tariff not found');

            const today = new Date();
            const expirationDate = new Date(today);
            expirationDate.setDate(expirationDate.getDate() + selectedTariff.duration);

            await onSubmit({
                userId: user.id,
                courseId: selectedCourseId,
                tariffId: selectedTariffId,
                startedAt: today.toISOString(),
                endedAt: expirationDate.toISOString()
            });
            handleClose();
        } catch (err: any) {
            console.error('Failed to grant permission:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to grant course access');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const selectedTariff = tariffs.find(t => t.id === selectedTariffId);
    const selectedCourse = courses.find(c => c.id === selectedCourseId);

    // Calculate expiration date
    const getExpirationDate = () => {
        if (!selectedTariff) return null;
        const today = new Date();
        const expirationDate = new Date(today);
        expirationDate.setDate(expirationDate.getDate() + selectedTariff.duration);
        return expirationDate.toLocaleDateString();
    };

    const courseOptions = courses.map(course => ({
        value: course.id,
        label: course.name?.en || course.name?.uz || course.name?.ru || 'Untitled Course'
    }));

    // FIXED: Removed .filter(t => t.is_active) as is_active does not exist on Tariff
    const tariffOptions = tariffs
        .map(tariff => ({
            value: tariff.id,
            label: `${tariff.name} (${tariff.duration} days)`
        }));

    const userName = user.first_name || user.last_name
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
        : 'User';

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Grant Course Access for ${userName}`}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">User Information</label>
                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                        <p><strong>Name:</strong> {userName}</p>
                        <p><strong>Phone:</strong> {user.phone}</p>
                        {user.role && <p><strong>Role:</strong> {user.role}</p>}
                    </div>
                </div>

                <Select
                    label="Select Course"
                    options={courseOptions}
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    required
                />

                <Select
                    label="Select Tariff"
                    options={tariffOptions}
                    value={selectedTariffId}
                    onChange={(e) => setSelectedTariffId(e.target.value)}
                    required
                />

                {selectedTariff && selectedCourse && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm">
                        <p className="font-medium text-blue-900 mb-2">📋 Permission Details</p>
                        <div className="space-y-1 text-blue-800">
                            <p><strong>Course:</strong> {selectedCourse.name?.en || selectedCourse.name?.uz || selectedCourse.name?.ru}</p>
                            <p><strong>Tariff:</strong> {selectedTariff.name}</p>
                            <p><strong>Duration:</strong> {selectedTariff.duration} days</p>
                            <p><strong>Access will expire on:</strong> {getExpirationDate()}</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
                    <strong>Note:</strong> Granting access will allow the user to access all content in the selected course for the duration specified by the tariff.
                </div>

                <div className="flex gap-2 justify-end pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Granting Access...' : 'Grant Access'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
