'use client';

import { useState, useEffect } from 'react';
import { useWeeklySchedule, DaySchedule } from '@/hooks/useWeeklySchedule';
import { useLanguage } from '@/contexts/LanguageContext';
import { getThaiTitle } from '@/utils/thaiTitles';
import { getStreamingPlatforms } from '@/utils/streamingUtils';
import { WeeklyAiringEntry } from '@/types/anilistTypes';

function formatTime(unixTimestamp: number): string {
    const date = new Date(unixTimestamp * 1000);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

const PLATFORM_COLOR: Record<string, string> = {
    'Crunchyroll': '#F47521',
    'Netflix': '#E50914',
    'Disney+': '#113CCF',
    'Disney Plus': '#113CCF',
    'Bilibili': '#00A1D6',
    'Amazon Prime Video': '#00A8E1',
    'HIDIVE': '#7B2D8B',
    'Funimation': '#3C0474',
    'YouTube': '#FF0000',
    'Hulu': '#1CE783',
    'iQIYI': '#00BE06',
    'Muse Asia': '#FDB900',
};

function AnimeRow({ entry, language }: { entry: WeeklyAiringEntry; language: string }) {
    const { media } = entry;
    const rawTitle = media.title.english || media.title.romaji || media.title.userPreferred || 'Unknown';
    const displayTitle =
        language === 'th'
            ? getThaiTitle(String(media.id), rawTitle, media.title.native || undefined) || rawTitle
            : rawTitle;

    const platforms = getStreamingPlatforms(media.externalLinks || []);

    return (
        <div className="flex items-start gap-4 py-3 border-b border-white/5 last:border-0 group hover:bg-white/[0.03] transition-colors px-2 rounded-lg">
            {/* Thumbnail */}
            <div className="flex-shrink-0 w-14 h-20 rounded-md overflow-hidden bg-white/5 shadow-sm ring-1 ring-white/10">
                {media.coverImage?.medium ? (
                    <img
                        src={media.coverImage.medium}
                        alt={rawTitle}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">—</div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 py-0.5">
                <p className="text-[14px] font-semibold text-white/80 leading-tight line-clamp-2 group-hover:text-white transition-colors">
                    {displayTitle}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[12px] text-white/40 font-medium whitespace-nowrap">
                        {language === 'th' ? `ตอนที่ ${entry.episode}` : `Episode ${entry.episode}`}
                    </span>
                    {media.averageScore && (
                        <>
                            <span className="text-white/15 text-[10px]">·</span>
                            <span className="text-[12px] text-emerald-400/70 font-medium">⭐ {(media.averageScore / 10).toFixed(1)}</span>
                        </>
                    )}
                </div>

                {/* Platform chips */}
                {platforms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {platforms.map(({ platform, url }) => (
                            <a
                                key={platform.name}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-bold px-2 py-0.5 rounded tracking-wide transition-colors"
                                style={{
                                    color: PLATFORM_COLOR[platform.name] || platform.color,
                                    backgroundColor: `${PLATFORM_COLOR[platform.name] || platform.color}15`,
                                    border: `1px solid ${PLATFORM_COLOR[platform.name] || platform.color}30`
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {platform.name.toUpperCase()}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function TimeBlock({ time, entries, language }: { time: string; entries: WeeklyAiringEntry[]; language: string }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-1 mt-3">
                <span className="text-[11px] font-mono text-white/25 tracking-widest">{time}</span>
                <div className="flex-1 h-px bg-white/5" />
            </div>
            {entries.map((entry) => (
                <AnimeRow key={entry.id} entry={entry} language={language} />
            ))}
        </div>
    );
}

function DayColumn({ day, language }: { day: DaySchedule; language: string }) {
    const now = new Date();
    const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const groupedByTime: Record<string, WeeklyAiringEntry[]> = {};
    day.entries.forEach((entry) => {
        const t = formatTime(entry.airingAt);
        if (!groupedByTime[t]) groupedByTime[t] = [];
        groupedByTime[t].push(entry);
    });

    return (
        <div
            className={`flex flex-col rounded-xl overflow-hidden border transition-all ${day.isToday
                ? 'border-white/15 bg-white/[0.04] shadow-lg shadow-white/[0.02]'
                : 'border-white/5 bg-white/[0.02]'
                }`}
        >
            {/* Header */}
            <div className={`px-4 pt-4 pb-3 border-b ${day.isToday ? 'border-white/10' : 'border-white/5'}`}>
                <div className="flex items-baseline justify-between">
                    <p className={`text-[13px] font-semibold tracking-wide ${day.isToday ? 'text-white' : 'text-white/30'}`}>
                        {day.dayLabel}
                    </p>
                    <p className={`text-[11px] font-mono ${day.isToday ? 'text-white/50' : 'text-white/20'}`}>
                        {day.dateLabel}
                    </p>
                </div>
                {day.isToday && (
                    <div className="flex items-center gap-1 mt-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                        <span className="text-[11px] text-emerald-400 font-medium">{nowStr}</span>
                    </div>
                )}
            </div>

            {/* Entries */}
            <div className="flex-1 overflow-y-auto px-3 pb-3" style={{ maxHeight: '68vh' }}>
                {Object.keys(groupedByTime).length === 0 ? (
                    <p className="text-center text-[12px] text-white/20 py-10">
                        {language === 'th' ? 'ไม่มีรายการ' : 'Nothing today'}
                    </p>
                ) : (
                    Object.entries(groupedByTime).map(([time, entries]) => (
                        <TimeBlock key={time} time={time} entries={entries} language={language} />
                    ))
                )}
            </div>
        </div>
    );
}

export default function WeeklySchedule() {
    const { language } = useLanguage();
    const { scheduleByDay, loading, error, refetch } = useWeeklySchedule(language as 'th' | 'en');

    const todayIndex = scheduleByDay.findIndex((d) => d.isToday);
    const [centerIndex, setCenterIndex] = useState(-1);

    // Responsive: 1 column on mobile, 3 on desktop
    const [visibleCount, setVisibleCount] = useState(3);
    useEffect(() => {
        const update = () => setVisibleCount(window.innerWidth < 768 ? 1 : 3);
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    useEffect(() => {
        if (todayIndex >= 0 && centerIndex === -1) setCenterIndex(todayIndex);
    }, [todayIndex, centerIndex]);

    const safeCenter = centerIndex < 0 ? 0 : centerIndex;
    const startIdx = visibleCount === 1
        ? Math.max(0, Math.min(safeCenter, scheduleByDay.length - 1))
        : Math.max(0, Math.min(safeCenter - 1, scheduleByDay.length - 3));
    const visibleDays = scheduleByDay.slice(startIdx, startIdx + visibleCount);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 h-72">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                <p className="text-[13px] text-white/40">
                    {language === 'th' ? 'กำลังโหลด...' : 'Loading…'}
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 h-64">
                <p className="text-[13px] text-red-400">{error}</p>
                <button onClick={refetch} className="text-[13px] text-white/40 underline underline-offset-2 hover:text-white/60">
                    {language === 'th' ? 'ลองใหม่' : 'Retry'}
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Week navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setCenterIndex(Math.max(0, safeCenter - 1))}
                    disabled={startIdx === 0}
                    className="text-[13px] text-white/30 hover:text-white/70 disabled:opacity-20 transition-colors flex items-center gap-1 font-medium"
                >
                    ← {language === 'th' ? 'ก่อนหน้า' : 'Prev'}
                </button>

                {/* Day nav dots */}
                <div className="flex items-center gap-1.5">
                    {scheduleByDay.map((day, i) => (
                        <button
                            key={i}
                            onClick={() => setCenterIndex(i)}
                            className={`transition-all rounded-full ${day.isToday
                                ? 'w-2 h-2 bg-emerald-400'
                                : i >= startIdx && i < startIdx + visibleCount
                                    ? 'w-2 h-2 bg-white/40'
                                    : 'w-1.5 h-1.5 bg-white/15'
                                }`}
                            title={`${day.dayLabel} ${day.dateLabel}`}
                        />
                    ))}
                </div>

                <button
                    onClick={() => setCenterIndex(Math.min(scheduleByDay.length - 1, safeCenter + 1))}
                    disabled={startIdx + visibleCount >= scheduleByDay.length}
                    className="text-[13px] text-white/30 hover:text-white/70 disabled:opacity-20 transition-colors flex items-center gap-1 font-medium"
                >
                    {language === 'th' ? 'ถัดไป' : 'Next'} →
                </button>
            </div>

            {/* Responsive grid: 1 col on mobile, 3 on desktop */}
            <div className={`grid gap-4 ${visibleCount === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
                {visibleDays.map((day) => (
                    <DayColumn key={day.date.toISOString()} day={day} language={language} />
                ))}
                {visibleDays.length < visibleCount &&
                    Array.from({ length: visibleCount - visibleDays.length }).map((_, i) => (
                        <div key={`pad-${i}`} className="rounded-xl border border-white/5 bg-white/[0.02]" />
                    ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4">
                <p className="text-[11px] text-white/20">
                    {language === 'th' ? 'ข้อมูลจาก AniList' : 'Data from AniList'}
                </p>
                <button
                    onClick={refetch}
                    className="text-[11px] text-white/20 hover:text-white/50 transition-colors"
                >
                    {language === 'th' ? 'รีเฟรช' : 'Refresh'}
                </button>
            </div>
        </div>
    );
}
