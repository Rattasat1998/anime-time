'use client';

import { useState, useMemo } from 'react';
import { CalendarDay, Anime } from '@/types/anime';
import { useSeasonalAnime } from '@/hooks/useAnimeData';

interface CalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onAnimeClick: (anime: Anime) => void;
}

export default function Calendar({ currentDate, onDateChange, onAnimeClick }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Get anime data for the current month/year
  const { animeList, loading, error, refetch } = useSeasonalAnime({
    year: currentDate.getFullYear(),
    season: getSeasonFromDate(currentDate),
    enableCache: true
  });

  // Helper function to get season from date
  function getSeasonFromDate(date: Date): string {
    const month = date.getMonth();
    if (month >= 0 && month <= 2) return 'winter';
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    return 'fall';
  }

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const animes = animeList.filter((anime: Anime) => anime.airingDate === dateStr);
      
      days.push({
        date,
        animes,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime()
      });
    }

    return days;
  }, [currentDate, animeList]);

  // Handle loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading anime data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">Failed to load anime data</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex justify-center mb-4 space-x-2">
        <button
          onClick={handleToday}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Today
        </button>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`
              min-h-[80px] border rounded-lg p-2 cursor-pointer transition-all
              ${day.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'}
              ${day.isToday ? 'ring-2 ring-blue-500' : ''}
              ${selectedDate?.getTime() === day.date.getTime() ? 'bg-blue-50' : ''}
            `}
            onClick={() => setSelectedDate(day.date)}
          >
            <div className={`
              text-sm font-medium mb-1
              ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
              ${day.isToday ? 'text-blue-600' : ''}
            `}>
              {day.date.getDate()}
            </div>
            
            <div className="space-y-1">
              {day.animes.slice(0, 2).map(anime => (
                <div
                  key={anime.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAnimeClick(anime);
                  }}
                  className="text-xs p-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded truncate hover:opacity-80 transition-opacity cursor-pointer"
                  title={anime.title}
                >
                  {anime.title.length > 12 ? anime.title.substring(0, 12) + '...' : anime.title}
                </div>
              ))}
              {day.animes.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{day.animes.length - 2} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
