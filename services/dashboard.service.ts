import { GetDashboardReq, DashboardRes } from '@/types';

const MOCK_DATA: DashboardRes = {
    tariffs: 12,
    subjects: 8,
    courses: 24,
    modules: 120,
    lessons: 450,
    tests: 85,
    documents: 130,
    videos: 320,
    users: 1250,
    teachers: 15,
};

const ZERO_MOCK_DATA: DashboardRes = {
    tariffs: 0,
    subjects: 0,
    courses: 0,
    modules: 0,
    lessons: 0,
    tests: 0,
    documents: 0,
    videos: 0,
    users: 0,
    teachers: 0,
};

export const dashboardService = {
    getStats: async (params: GetDashboardReq): Promise<DashboardRes> => {
        console.log('Fetching dashboard stats with params:', params);

        // Simulate API delay
        const delay = Math.floor(Math.random() * (800 - 400 + 1)) + 400;
        await new Promise((resolve) => setTimeout(resolve, delay));

        // For demo purposes: if 'to' is set to a specific "zero" date (e.g. 2000-01-01), return zeros
        if (params.to === '2000-01-01') {
            return ZERO_MOCK_DATA;
        }

        // Add some "randomness" based on date range to simulate real data
        const factor = params.type === 'day' ? 0.05 : params.type === 'week' ? 0.25 : params.type === 'month' ? 1 : 2;

        const randomizedData = { ...MOCK_DATA };
        Object.keys(randomizedData).forEach((key) => {
            const k = key as keyof DashboardRes;
            randomizedData[k] = Math.max(0, Math.floor(MOCK_DATA[k] * factor + (Math.random() - 0.5) * MOCK_DATA[k] * 0.1));
        });

        return randomizedData;
    },
};
