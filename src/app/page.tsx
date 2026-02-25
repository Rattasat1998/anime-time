'use client';

import { useState } from 'react';
import SeasonalAnimeList from '@/components/SeasonalAnimeList';
import WeeklySchedule from '@/components/WeeklySchedule';
import TopRanking from '@/components/TopRanking';
import HomePage from '@/components/HomePage';
import AnimeModal from '@/components/AnimeModal';
import { Anime } from '@/types/anime';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { SafeModeProvider, useSafeMode } from '@/contexts/SafeModeContext';

type MainTab = 'home' | 'weekly' | 'seasonal' | 'ranking';

const TABS: { key: MainTab; th: string; en: string; icon: string }[] = [
  { key: 'home', th: 'หน้าแรก', en: 'Home', icon: '🏠' },
  { key: 'weekly', th: 'สัปดาห์นี้', en: 'This Week', icon: '📅' },
  { key: 'seasonal', th: 'ฤดูกาล', en: 'Season', icon: '🌸' },
  { key: 'ranking', th: 'อันดับ', en: 'Ranking', icon: '🏆' },
];

function HomeContent() {
  const { t, language, setLanguage } = useLanguage();
  const { safeMode, setSafeMode } = useSafeMode();
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>('home');

  const handleAnimeClick = (anime: Anime) => {
    setSelectedAnime(anime);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Top nav bar */}
      <header className="sticky top-0 z-20 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-white">
              Anime Calendar
            </span>
          </div>

          {/* Center tabs — HIDDEN on mobile, shown on md+ */}
          <div className="hidden md:flex items-center gap-1 rounded-lg p-1 bg-white/5">
            {TABS.map(({ key, th, en }) => (
              <button
                key={key}
                onClick={() => setMainTab(key)}
                className={`px-3 sm:px-4 py-1.5 text-sm font-medium rounded-md transition-all ${mainTab === key
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/40 hover:text-white/70'
                  }`}
              >
                {language === 'th' ? th : en}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Safe mode toggle */}
            <button
              onClick={() => setSafeMode(!safeMode)}
              className={`flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-[12px] font-bold px-2 sm:px-2.5 py-1 rounded-full transition-all ${safeMode
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25'
                : 'bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25'
                }`}
              title={safeMode
                ? (language === 'th' ? 'กรอง NSFW อยู่ — กดเพื่อปิด' : 'NSFW filtered — click to disable')
                : (language === 'th' ? 'ไม่กรอง NSFW — กดเพื่อเปิด' : 'NSFW shown — click to filter')
              }
            >
              {safeMode ? (
                <>🛡️ <span className="hidden sm:inline">Safe</span></>
              ) : (
                <>🔞 <span className="hidden sm:inline">18+</span></>
              )}
            </button>

            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
              className="text-sm font-medium text-white/40 hover:text-white/80 transition-colors"
            >
              {language === 'th' ? 'EN' : 'TH'}
            </button>
          </div>
        </div>
      </header>

      {/* Content — add bottom padding on mobile for the bottom nav */}
      <main className="px-4 sm:px-6 py-4 sm:py-6 pb-24 md:pb-6">
        {mainTab === 'home' ? (
          <HomePage onAnimeClick={handleAnimeClick} />
        ) : mainTab === 'weekly' ? (
          <WeeklySchedule />
        ) : mainTab === 'seasonal' ? (
          <SeasonalAnimeList onAnimeClick={handleAnimeClick} />
        ) : (
          <TopRanking onAnimeClick={handleAnimeClick} />
        )}
      </main>

      {/* Bottom Navigation Bar — VISIBLE only on mobile (below md) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-center justify-around h-16 px-2">
          {TABS.map(({ key, th, en, icon }) => (
            <button
              key={key}
              onClick={() => setMainTab(key)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all min-w-[60px] ${mainTab === key
                ? 'text-white'
                : 'text-white/30'
                }`}
            >
              <span className={`text-[18px] transition-transform ${mainTab === key ? 'scale-110' : ''}`}>
                {icon}
              </span>
              <span className={`text-[10px] font-semibold leading-tight ${mainTab === key ? 'text-white' : 'text-white/30'}`}>
                {language === 'th' ? th : en}
              </span>
              {mainTab === key && (
                <div className="w-4 h-0.5 bg-white rounded-full mt-0.5" />
              )}
            </button>
          ))}
        </div>
        {/* Safe area for phones with home indicator */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      <AnimeModal
        anime={selectedAnime}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedAnime(null); }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <SafeModeProvider>
        <HomeContent />
      </SafeModeProvider>
    </LanguageProvider>
  );
}
