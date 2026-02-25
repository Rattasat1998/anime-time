'use client';

import { useState, useMemo } from 'react';
import { Anime } from '@/types/anime';
import { useAniListCurrentAiringAnime } from '@/hooks/useAniListData';
import { useLanguage } from '@/contexts/LanguageContext';
import { getThaiTitle } from '@/utils/thaiTitles';
import AnimeModal from './AnimeModal';

interface WeeklyAnimeListProps {
  onAnimeClick: (anime: Anime) => void;
}

export default function WeeklyAnimeList({ onAnimeClick }: WeeklyAnimeListProps) {
  const { t, language } = useLanguage();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  const { animeList: currentAnime, loading, error, refetch } = useAniListCurrentAiringAnime({
    enableCache: true
  });

  // Group anime by day of week
  const animeByDay = useMemo(() => {
    const days: { [key: number]: Anime[] } = {
      0: [], // Sunday
      1: [], // Monday
      2: [], // Tuesday
      3: [], // Wednesday
      4: [], // Thursday
      5: [], // Friday
      6: [], // Saturday
    };

    currentAnime.forEach((anime) => {
      if (anime.airingDate) {
        const date = new Date(anime.airingDate);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        days[dayOfWeek].push(anime);
      }
    });

    return days;
  }, [currentAnime]);

  const dayNames = [
    t('day.sunday'),
    t('day.monday'),
    t('day.tuesday'),
    t('day.wednesday'),
    t('day.thursday'),
    t('day.friday'),
    t('day.saturday')
  ];

  const handleRefresh = () => {
    refetch();
  };

  // Helper function to get display title
  const getDisplayTitle = (anime: Anime) => {
    if (language === 'th') {
      const thaiTitle = getThaiTitle(anime.id, anime.title, anime.titleJapanese);
      if (thaiTitle) {
        return thaiTitle;
      }
    }
    return anime.title;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading.data')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{t('error.failed')}</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            {t('error.try_again')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {t('weekly_schedule')}
        </h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('button.refreshing') : t('button.refresh')}
        </button>
      </div>

      {/* Day Selection */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedDay(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedDay === null
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t('all_days')}
        </button>
        {dayNames.map((dayName, index) => (
          <button
            key={index}
            onClick={() => setSelectedDay(index)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedDay === index
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {dayName}
            {animeByDay[index].length > 0 && (
              <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                {animeByDay[index].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Anime List */}
      <div className="space-y-6">
        {Object.entries(animeByDay).map(([dayIndex, animeList]) => {
          const day = parseInt(dayIndex);
          if (selectedDay !== null && selectedDay !== day) return null;
          if (animeList.length === 0) return null;

          return (
            <div key={dayIndex} className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm mr-2">
                  {dayNames[day]}
                </span>
                <span className="text-sm text-gray-500">
                  ({animeList.length} {t('anime_count')})
                </span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {animeList.map((anime) => (
                  <div
                    key={anime.id}
                    onClick={() => onAnimeClick(anime)}
                    className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer group"
                  >
                    {/* Image Container */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={anime.image}
                        alt={anime.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          anime.status === 'airing' ? 'bg-green-500 text-white' :
                          anime.status === 'completed' ? 'bg-gray-500 text-white' :
                          'bg-blue-500 text-white'
                        }`}>
                          {t(`status.${anime.status}`)}
                        </span>
                      </div>

                      {/* Rating Badge */}
                      {anime.rating > 0 && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500 text-white">
                            ⭐ {anime.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h4 className="font-bold text-gray-800 mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {getDisplayTitle(anime)}
                      </h4>
                      
                      {/* Show original title if Thai is being displayed */}
                      {language === 'th' && getThaiTitle(anime.id, anime.title, anime.titleJapanese) && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                          {anime.title}
                        </p>
                      )}
                      
                      {anime.titleJapanese && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                          {anime.titleJapanese}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {anime.genres.slice(0, 3).map((genre) => (
                          <span
                            key={genre}
                            className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
                          >
                            {genre}
                          </span>
                        ))}
                        {anime.genres.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{t('label.more_genres')}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>{t(`type.${anime.type.toLowerCase()}`)}</span>
                        <span>{anime.episodes} {t('label.episodes')}</span>
                      </div>

                      {anime.airingDate && (
                        <div className="mt-2 text-xs text-gray-500">
                          📅 {new Date(anime.airingDate).toLocaleDateString()}
                        </div>
                      )}

                      <div className="mt-2 text-xs text-gray-500">
                        🏢 {anime.studio}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* No anime message */}
      {selectedDay !== null && animeByDay[selectedDay].length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4" />
            </svg>
          </div>
          <p className="text-gray-500">
            {t('no_anime_on_day', { day: dayNames[selectedDay] })}
          </p>
        </div>
      )}

      {/* No anime at all */}
      {selectedDay === null && Object.values(animeByDay).every(animeList => animeList.length === 0) && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4" />
            </svg>
          </div>
          <p className="text-gray-500">{t('no.anime')}</p>
        </div>
      )}
    </div>
  );
}
