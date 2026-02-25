'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'th' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: { [key: string]: string }) => string;
}

const translations = {
  th: {
    // Header
    'app.title': '🎌 แนะนำอนิเมะฤดูกาล',
    'app.subtitle': 'ค้นพบและติดตามอนิเมะโปรดของคุณตามฤดูกาล',

    // Tabs
    'tab.current': 'กำลังฉาย',
    'tab.seasonal': 'ฤดูกาลนี้',
    'tab.upcoming': 'รอฉาย',
    'tab.weekly': 'สัปดาห์นี้',

    // Status
    'status.airing': 'กำลังฉาย',
    'status.completed': 'จบแล้ว',
    'status.upcoming': 'รอฉาย',

    // Types
    'type.tv': 'ทีวี',
    'type.movie': 'หนัง',
    'type.ova': 'OVA',
    'type.special': 'พิเศษ',

    // Loading & Errors
    'loading.data': 'กำลังโหลดข้อมูลอนิเมะ...',
    'error.failed': 'โหลดข้อมูลไม่สำเร็จ',
    'error.try_again': 'ลองใหม่',
    'no.anime': 'ไม่พบอนิเมะในหมวดนี้',

    // Buttons
    'button.refresh': 'รีเฟรช',
    'button.refreshing': 'กำลังรีเฟรช...',
    'button.today': 'วันนี้',

    // Labels
    'label.episodes': 'ตอน',
    'label.rating': 'คะแนน',
    'label.studio': 'สตูดิโอ',
    'label.airing_date': 'วันที่ฉาย',
    'label.more_genres': 'เพิ่มเติม',

    // Days
    'day.sunday': 'อาทิตย์',
    'day.monday': 'จันทร์',
    'day.tuesday': 'อังคาร',
    'day.wednesday': 'พุธ',
    'day.thursday': 'พฤหัสบดี',
    'day.friday': 'ศุกร์',
    'day.saturday': 'เสาร์',
    'all_days': 'ทุกวัน',
    'weekly_schedule': 'ตารางอาทิตย์',
    'anime_count': 'เรื่อง',
    'no_anime_on_day': 'ไม่มีอนิเมะฉายในวัน{{day}}',

    // Language
    'language.switch': 'เปลี่ยนภาษา',
    'language.th': 'ไทย',
    'language.en': 'English',
  },
  en: {
    // Header
    'app.title': '🎌 Anime Season Guide',
    'app.subtitle': 'Discover and track your favorite anime by season',

    // Tabs
    'tab.current': 'Currently Airing',
    'tab.seasonal': 'This Season',
    'tab.upcoming': 'Upcoming',
    'tab.weekly': 'This Week',

    // Status
    'status.airing': 'Airing',
    'status.completed': 'Completed',
    'status.upcoming': 'Upcoming',

    // Types
    'type.tv': 'TV',
    'type.movie': 'Movie',
    'type.ova': 'OVA',
    'type.special': 'Special',

    // Loading & Errors
    'loading.data': 'Loading anime data...',
    'error.failed': 'Failed to load anime data',
    'error.try_again': 'Try Again',
    'no.anime': 'No anime found for this category',

    // Buttons
    'button.refresh': 'Refresh',
    'button.refreshing': 'Refreshing...',
    'button.today': 'Today',

    // Labels
    'label.episodes': 'Episodes',
    'label.rating': 'Rating',
    'label.studio': 'Studio',
    'label.airing_date': 'Airing Date',
    'label.more_genres': 'More',

    // Days
    'day.sunday': 'Sunday',
    'day.monday': 'Monday',
    'day.tuesday': 'Tuesday',
    'day.wednesday': 'Wednesday',
    'day.thursday': 'Thursday',
    'day.friday': 'Friday',
    'day.saturday': 'Saturday',
    'all_days': 'All Days',
    'weekly_schedule': 'Weekly Schedule',
    'anime_count': 'anime',
    'no_anime_on_day': 'No anime airing on {{day}}',

    // Language
    'language.switch': 'Switch Language',
    'language.th': 'ไทย',
    'language.en': 'English',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string, params?: { [key: string]: string }): string => {
    let text = translations[language][key as keyof typeof translations.en] || key;

    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{{${param}}}`, value);
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
