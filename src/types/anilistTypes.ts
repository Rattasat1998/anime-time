// AniList API Types

export interface AniListExternalLink {
  id: number;
  url: string;
  site: string;
  type: string | null;
  language: string | null;
  color: string | null;
  icon: string | null;
}

export interface WeeklyAiringEntry {
  id: number;
  airingAt: number;
  episode: number;
  media: {
    id: number;
    title: {
      romaji: string;
      english: string | null;
      native: string | null;
      userPreferred: string | null;
    };
    coverImage: {
      medium: string | null;
      large: string | null;
      color: string | null;
    };
    externalLinks: AniListExternalLink[];
    format: string;
    status: string;
    genres: string[];
    averageScore: number | null;
  };
}

export interface WeeklyScheduleResponse {
  data: {
    Page: {
      pageInfo: {
        hasNextPage: boolean;
        currentPage: number;
      };
      airingSchedules: WeeklyAiringEntry[];
    };
  } | null;
  errors: any[] | null;
}

export interface AniListMedia {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
    userPreferred: string | null;
  };
  description: string | null;
  season: string | null;
  seasonYear: number | null;
  episodes: number | null;
  status: string;
  format: string;
  genres: string[];
  averageScore: number | null;
  popularity: number;
  favourites: number;
  startDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  endDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  coverImage: {
    extraLarge: string | null;
    large: string | null;
    medium: string | null;
    color: string | null;
  };
  bannerImage: string | null;
  isAdult: boolean;
  trailer: {
    id: string;
    site: string;
    thumbnail: string | null;
  } | null;
  studios: {
    nodes: {
      id: number;
      name: string;
      isAnimationStudio: boolean;
    }[];
  };
  nextAiringEpisode: {
    airingAt: number;
    timeUntilAiring: number;
    episode: number;
  } | null;
  airingSchedule: {
    nodes: {
      id: number;
      airingAt: number;
      episode: number;
    }[];
  } | null;
}

export interface AniListResponse {
  data: {
    Page: {
      pageInfo: {
        total: number;
        perPage: number;
        currentPage: number;
        lastPage: number;
        hasNextPage: boolean;
      };
      media: AniListMedia[];
    };
  } | null;
  errors: any[] | null;
}

export interface AniListSeasonResponse {
  data: {
    Page: {
      pageInfo: {
        total: number;
        perPage: number;
        currentPage: number;
        lastPage: number;
        hasNextPage: boolean;
      };
      media: AniListMedia[];
    };
  } | null;
  errors: any[] | null;
}
