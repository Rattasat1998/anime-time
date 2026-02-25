'use client';

import { useState } from 'react';
import { Anime } from '@/types/anime';
import { useFirebaseCurrentAiring, useFirebaseUpcoming } from '@/hooks/useFirebaseData';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSafeMode, filterNSFW } from '@/contexts/SafeModeContext';
import { getThaiTitle } from '@/utils/thaiTitles';

interface SeasonalAnimeListProps {
  onAnimeClick: (anime: Anime) => void;
}

export default function SeasonalAnimeList({ onAnimeClick }: SeasonalAnimeListProps) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'seasonal' | 'current' | 'upcoming'>('seasonal');


  // Use Firebase hooks
  const { animeList: firebaseCurrentAiring, loading: firebaseCurrentLoading, error: firebaseCurrentError, refetch: firebaseCurrentRefetch } = useFirebaseCurrentAiring();
  const { animeList: firebaseUpcoming, loading: firebaseUpcomingLoading, error: firebaseUpcomingError, refetch: firebaseUpcomingRefetch } = useFirebaseUpcoming();

  const getCurrentData = () => {
    switch (activeTab) {
      case 'seasonal': // Fallback seasonal to airing since we didn't cache seasonal separately
        return { animeList: firebaseCurrentAiring, loading: firebaseCurrentLoading, error: firebaseCurrentError, refetch: firebaseCurrentRefetch };
      case 'current': // 'current' also uses firebaseCurrentAiring
        return { animeList: firebaseCurrentAiring, loading: firebaseCurrentLoading, error: firebaseCurrentError, refetch: firebaseCurrentRefetch };
      case 'upcoming':
        return { animeList: firebaseUpcoming, loading: firebaseUpcomingLoading, error: firebaseUpcomingError, refetch: firebaseUpcomingRefetch };
      default: return { animeList: [], loading: false, error: null, refetch: () => { } };
    }
  };

  const { animeList: rawAnimeList, loading, error, refetch } = getCurrentData();
  const { safeMode } = useSafeMode();
  const animeList = filterNSFW(rawAnimeList, safeMode);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-72">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        <p className="text-[13px] text-white/40">{t('loading.data')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-400 gap-4">
        <p>{error instanceof Error ? error.message : 'Error passing data'}</p>
        <button
          onClick={() => refetch()} className="text-[13px] text-white/40 underline underline-offset-2 hover:text-white/60">
          {t('error.try_again')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Internal Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-1">
        <div className="flex gap-6">
          {(['current', 'seasonal', 'upcoming'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[13px] font-semibold pb-2 transition-all relative ${activeTab === tab ? 'text-white' : 'text-white/30 hover:text-white/50'
                }`}
            >
              {t(`tab.${tab}`)}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
        <button
          onClick={refetch}
          className="text-[11px] text-white/20 hover:text-white/50 transition-colors"
        >
          {t('button.refresh')}
        </button>
      </div>

      {/* Anime Grid */}
      {animeList.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[13px] text-white/20">{t('no.anime')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
          {animeList.map((anime) => {
            const rawTitle = anime.title;
            const displayTitle = language === 'th'
              ? getThaiTitle(anime.id, rawTitle, anime.titleJapanese) || rawTitle
              : rawTitle;

            return (
              <div
                key={anime.id}
                onClick={() => onAnimeClick(anime)}
                className="group cursor-pointer flex flex-col gap-3"
              >
                {/* Poster Container */}
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-white/5 ring-1 ring-white/10 group-hover:ring-white/20 transition-all group-hover:scale-[1.02]">
                  <img
                    src={anime.image}
                    alt={rawTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />

                  {/* Indicators */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold backdrop-blur-sm rounded ${anime.status === 'airing'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                      : anime.status === 'upcoming'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                        : 'bg-white/10 text-white/60 border border-white/10'
                      }`}>
                      {anime.status === 'airing' ? 'AIRING' : anime.status.toUpperCase()}
                    </span>
                    {anime.rating > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-black/40 backdrop-blur-sm text-emerald-400 rounded border border-white/10">
                        ⭐ {(anime.rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="space-y-1">
                  <h3 className="text-[13px] font-bold text-white/80 leading-snug line-clamp-2 group-hover:text-white transition-colors">
                    {displayTitle}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-white/30 font-medium">
                      {anime.type}
                    </span>
                    <span className="text-white/15 text-[10px]">·</span>
                    <span className="text-[11px] text-white/30">
                      {anime.episodes} {t('label.episodes')}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/20 font-medium truncate">
                    {anime.studio}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
