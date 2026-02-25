'use client';

import { useState } from 'react';
import { useFirebaseTopRanking, useFirebaseTrending } from '@/hooks/useFirebaseData';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSafeMode, filterNSFW } from '@/contexts/SafeModeContext';
import { getThaiTitle } from '@/utils/thaiTitles';
import { Anime } from '@/types/anime';

interface TopRankingProps {
    onAnimeClick: (anime: Anime) => void;
}

export default function TopRanking({ onAnimeClick }: TopRankingProps) {
    const { t, language } = useLanguage();
    const [sortBy, setSortBy] = useState<'score' | 'popularity'>('score');

    // Use cached Top Rated for score, cached Trending for popularity
    const { animeList: rawAnimeList, loading, error, refetch } = sortBy === 'score'
        ? useFirebaseTopRanking()
        : useFirebaseTrending();
    const { safeMode } = useSafeMode();
    const animeList = filterNSFW(rawAnimeList, safeMode);

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
            <div className="flex flex-col items-center justify-center h-64 text-red-400 gap-4">
                <p>{error instanceof Error ? error.message : 'Failed to load rankings'}</p>
                <button
                    onClick={() => refetch()} className="text-[13px] text-white/40 underline underline-offset-2 hover:text-white/60">
                    {language === 'th' ? 'ลองใหม่' : 'Retry'}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Sub-tabs */}
            <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <div className="flex gap-6">
                    {(['score', 'popularity'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSortBy(tab)}
                            className={`text-[13px] font-semibold pb-2 transition-all relative ${sortBy === tab ? 'text-white' : 'text-white/30 hover:text-white/50'
                                }`}
                        >
                            {tab === 'score'
                                ? (language === 'th' ? 'คะแนนสูงสุด' : 'Top Rated')
                                : (language === 'th' ? 'ยอดนิยม' : 'Most Popular')
                            }
                            {sortBy === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
                <button
                    onClick={refetch}
                    className="text-[11px] text-white/20 hover:text-white/50 transition-colors"
                >
                    {language === 'th' ? 'รีเฟรช' : 'Refresh'}
                </button>
            </div>

            {/* Ranking List */}
            {animeList.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-[13px] text-white/20">
                        {language === 'th' ? 'ไม่มีข้อมูล' : 'No data available'}
                    </p>
                </div>
            ) : (
                <div className="space-y-1.5">
                    {animeList.map((anime, index) => {
                        const rawTitle = anime.title;
                        const displayTitle = language === 'th'
                            ? getThaiTitle(anime.id, rawTitle, anime.titleJapanese) || rawTitle
                            : rawTitle;

                        const rank = index + 1;
                        const isTop3 = rank <= 3;

                        return (
                            <div
                                key={anime.id}
                                onClick={() => onAnimeClick(anime)}
                                className={`flex items-center gap-4 py-3 px-4 rounded-xl cursor-pointer group transition-all ${isTop3
                                    ? 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.07]'
                                    : 'hover:bg-white/[0.03] border border-transparent hover:border-white/5'
                                    }`}
                            >
                                {/* Rank Number */}
                                <div className="flex-shrink-0 w-8 text-center">
                                    <span className={`text-[18px] font-bold tabular-nums ${rank === 1 ? 'text-amber-400'
                                        : rank === 2 ? 'text-gray-400'
                                            : rank === 3 ? 'text-amber-600'
                                                : 'text-white/15'
                                        }`}>
                                        {rank}
                                    </span>
                                </div>

                                {/* Cover Image */}
                                <div className="flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden bg-white/5 ring-1 ring-white/10">
                                    {anime.image ? (
                                        <img
                                            src={anime.image}
                                            alt={rawTitle}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px]">—</div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 space-y-1">
                                    <p className="text-[13px] font-bold text-white/80 leading-snug line-clamp-1 group-hover:text-white transition-colors">
                                        {displayTitle}
                                    </p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[11px] text-white/30 font-medium">
                                            {anime.type}
                                        </span>
                                        {anime.studio && (
                                            <>
                                                <span className="text-white/10 text-[10px]">·</span>
                                                <span className="text-[11px] text-white/25 truncate max-w-[120px]">
                                                    {anime.studio}
                                                </span>
                                            </>
                                        )}
                                        {anime.genres.length > 0 && (
                                            <>
                                                <span className="text-white/10 text-[10px]">·</span>
                                                <span className="text-[11px] text-white/20 truncate max-w-[150px]">
                                                    {anime.genres.slice(0, 2).join(', ')}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Score / Popularity Badge */}
                                <div className="flex-shrink-0 text-right">
                                    {sortBy === 'score' && anime.rating > 0 ? (
                                        <div className="flex flex-col items-end gap-0.5">
                                            <span className="text-[15px] font-bold text-emerald-400 tabular-nums">
                                                {anime.rating.toFixed(1)}
                                            </span>
                                            <span className="text-[10px] text-white/20 font-medium">
                                                {language === 'th' ? 'คะแนน' : 'score'}
                                            </span>
                                        </div>
                                    ) : sortBy === 'popularity' ? (
                                        <div className="flex flex-col items-end gap-0.5">
                                            <span className="text-[13px] font-bold text-white/40 tabular-nums">
                                                {anime.rating > 0 ? `⭐ ${anime.rating.toFixed(1)}` : '—'}
                                            </span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer */}
            <div className="pt-2">
                <p className="text-[11px] text-white/20 text-center">
                    {language === 'th' ? 'ข้อมูลจาก AniList' : 'Data from AniList'}
                </p>
            </div>
        </div>
    );
}
