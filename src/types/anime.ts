export interface Anime {
  id: string;
  title: string;
  titleJapanese?: string;
  image: string;
  synopsis: string;
  episodes: number;
  status: 'airing' | 'completed' | 'upcoming';
  airingDate: string;
  genres: string[];
  rating: number;
  studio: string;
  type: 'TV' | 'Movie' | 'OVA' | 'Special';
  season?: string;
  year?: number;
  bannerImage?: string;
  description?: string;
  popularity?: number;
  trailer?: { id: string; site: string } | null;
  isAdult?: boolean;
}

export interface CalendarDay {
  date: Date;
  animes: Anime[];
  isCurrentMonth: boolean;
  isToday: boolean;
}
