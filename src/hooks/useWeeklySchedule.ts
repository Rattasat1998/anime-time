import { useState, useEffect, useCallback } from 'react';
import AniListService from '@/services/anilistService';
import { WeeklyAiringEntry } from '@/types/anilistTypes';

export interface DaySchedule {
    date: Date;
    dayLabel: string; // e.g. "MON", "TUE"
    dateLabel: string; // e.g. "25/02"
    entries: WeeklyAiringEntry[];
    isToday: boolean;
}

const DAY_NAMES_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAY_NAMES_TH = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

function getWeekDays(): Date[] {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

export function useWeeklySchedule(language: 'th' | 'en' = 'en') {
    const [scheduleByDay, setScheduleByDay] = useState<DaySchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSchedule = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const service = new AniListService();
            const weekDays = getWeekDays();
            const today = new Date();

            // Fetch page 1 + page 2 to get more entries (50 per page)
            const [res1, res2] = await Promise.all([
                service.getWeeklyAiringSchedule(1, 50),
                service.getWeeklyAiringSchedule(2, 50),
            ]);

            const entries: WeeklyAiringEntry[] = [
                ...(res1?.data?.Page?.airingSchedules || []),
                ...(res2?.data?.Page?.airingSchedules || []),
            ];

            const dayNames = language === 'th' ? DAY_NAMES_TH : DAY_NAMES_EN;

            const grouped: DaySchedule[] = weekDays.map((day) => {
                const dayEntries = entries.filter((e) => {
                    const airingDate = new Date(e.airingAt * 1000);
                    return isSameDay(airingDate, day);
                });

                const pad = (n: number) => String(n).padStart(2, '0');
                const dateLabel = `${pad(day.getDate())}/${pad(day.getMonth() + 1)}`;

                return {
                    date: day,
                    dayLabel: dayNames[day.getDay()],
                    dateLabel,
                    entries: dayEntries,
                    isToday: isSameDay(day, today),
                };
            });

            setScheduleByDay(grouped);
        } catch (err) {
            console.error('Error fetching weekly schedule:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch schedule');
        } finally {
            setLoading(false);
        }
    }, [language]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    return { scheduleByDay, loading, error, refetch: fetchSchedule };
}
