import { useState, useEffect, useCallback } from 'react';
import AniListService from '@/services/anilistService';
import { Anime } from '@/types/anime';
import { transformAniListAnimeList } from '@/utils/dataTransform';
import cacheManager, { withCache, generateCacheKey } from '@/utils/cacheUtils';

interface UseAniListDataOptions {
  season?: string;
  year?: number;
  page?: number;
  limit?: number;
  enableCache?: boolean;
}

interface UseAniListDataReturn {
  animeList: Anime[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  pageInfo?: {
    total: number;
    currentPage: number;
    hasNextPage: boolean;
  };
}

export function useAniListSeasonalAnime(options: UseAniListDataOptions = {}): UseAniListDataReturn {
  const { season, year, page = 1, limit = 25, enableCache = true } = options;

  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<any>(null);

  const fetchAnime = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const anilistService = new AniListService();

      const fetchFn = async () => {
        const currentYear = year || new Date().getFullYear();
        const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
        const currentSeason = season || seasons[Math.floor((new Date().getMonth() + 1) / 3) % 4];

        const response = await anilistService.getSeasonalAnime(currentSeason, currentYear, page, limit);

        if (response.data?.Page) {
          setPageInfo(response.data.Page.pageInfo);
          return transformAniListAnimeList(response.data.Page.media);
        }
        return [];
      };

      let data: Anime[];

      if (enableCache) {
        const cacheKey = generateCacheKey('anilist-seasonal', { season, year, page, limit });
        data = await withCache(cacheKey, fetchFn, 10 * 60 * 1000); // 10 minutes cache
      } else {
        data = await fetchFn();
      }

      setAnimeList(data);
    } catch (err) {
      console.error('Error fetching AniList seasonal anime:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch anime data');
    } finally {
      setLoading(false);
    }
  }, [season, year, page, limit, enableCache]);

  useEffect(() => {
    fetchAnime();
  }, [fetchAnime]);

  return {
    animeList,
    loading,
    error,
    refetch: fetchAnime,
    pageInfo: pageInfo ? {
      total: pageInfo.total,
      currentPage: pageInfo.currentPage,
      hasNextPage: pageInfo.hasNextPage
    } : undefined
  };
}

export function useAniListCurrentAiringAnime(options: UseAniListDataOptions = {}): UseAniListDataReturn {
  const { page = 1, limit = 25, enableCache = true } = options;

  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<any>(null);

  const fetchAnime = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const anilistService = new AniListService();

      const fetchFn = async () => {
        const response = await anilistService.getCurrentAiringAnime(page, limit);

        if (response.data?.Page) {
          setPageInfo(response.data.Page.pageInfo);
          return transformAniListAnimeList(response.data.Page.media);
        }
        return [];
      };

      let data: Anime[];

      if (enableCache) {
        const cacheKey = generateCacheKey('anilist-current', { page, limit });
        data = await withCache(cacheKey, fetchFn, 5 * 60 * 1000); // 5 minutes cache
      } else {
        data = await fetchFn();
      }

      setAnimeList(data);
    } catch (err) {
      console.error('Error fetching AniList current airing anime:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch anime data');
    } finally {
      setLoading(false);
    }
  }, [page, limit, enableCache]);

  useEffect(() => {
    fetchAnime();
  }, [fetchAnime]);

  return {
    animeList,
    loading,
    error,
    refetch: fetchAnime,
    pageInfo: pageInfo ? {
      total: pageInfo.total,
      currentPage: pageInfo.currentPage,
      hasNextPage: pageInfo.hasNextPage
    } : undefined
  };
}

export function useAniListUpcomingAnime(options: UseAniListDataOptions = {}): UseAniListDataReturn {
  const { page = 1, limit = 25, enableCache = true } = options;

  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<any>(null);

  const fetchAnime = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const anilistService = new AniListService();

      const fetchFn = async () => {
        const response = await anilistService.getUpcomingAnime(page, limit);

        if (response.data?.Page) {
          setPageInfo(response.data.Page.pageInfo);
          return transformAniListAnimeList(response.data.Page.media);
        }
        return [];
      };

      let data: Anime[];

      if (enableCache) {
        const cacheKey = generateCacheKey('anilist-upcoming', { page, limit });
        data = await withCache(cacheKey, fetchFn, 30 * 60 * 1000); // 30 minutes cache
      } else {
        data = await fetchFn();
      }

      setAnimeList(data);
    } catch (err) {
      console.error('Error fetching AniList upcoming anime:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch anime data');
    } finally {
      setLoading(false);
    }
  }, [page, limit, enableCache]);

  useEffect(() => {
    fetchAnime();
  }, [fetchAnime]);

  return {
    animeList,
    loading,
    error,
    refetch: fetchAnime,
    pageInfo: pageInfo ? {
      total: pageInfo.total,
      currentPage: pageInfo.currentPage,
      hasNextPage: pageInfo.hasNextPage
    } : undefined
  };
}

export function useAniListSearch(query: string, page: number = 1, limit: number = 10): UseAniListDataReturn {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<any>(null);

  const searchAnime = useCallback(async () => {
    if (!query.trim()) {
      setAnimeList([]);
      setPageInfo(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const anilistService = new AniListService();
      const response = await anilistService.searchAnime(query, page, limit);

      if (response.data?.Page) {
        setPageInfo(response.data.Page.pageInfo);
        const data = transformAniListAnimeList(response.data.Page.media);
        setAnimeList(data);
      }
    } catch (err) {
      console.error('Error searching AniList anime:', err);
      setError(err instanceof Error ? err.message : 'Failed to search anime');
    } finally {
      setLoading(false);
    }
  }, [query, page, limit]);

  useEffect(() => {
    searchAnime();
  }, [searchAnime]);

  return {
    animeList,
    loading,
    error,
    refetch: searchAnime,
    pageInfo: pageInfo ? {
      total: pageInfo.total,
      currentPage: pageInfo.currentPage,
      hasNextPage: pageInfo.hasNextPage
    } : undefined
  };
}

export function useAniListTopRanking(
  sort: 'score' | 'popularity' = 'score',
  options: UseAniListDataOptions = {}
): UseAniListDataReturn {
  const { page = 1, limit = 50, enableCache = true } = options;

  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<any>(null);

  const fetchAnime = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const anilistService = new AniListService();
      const apiSort = sort === 'score' ? 'SCORE_DESC' : 'POPULARITY_DESC';

      const fetchFn = async () => {
        const response = await anilistService.getTopRankingAnime(apiSort, page, limit);

        if (response.data?.Page) {
          setPageInfo(response.data.Page.pageInfo);
          return transformAniListAnimeList(response.data.Page.media);
        }
        return [];
      };

      let data: Anime[];

      if (enableCache) {
        const cacheKey = generateCacheKey('anilist-top-ranking', { sort, page, limit });
        data = await withCache(cacheKey, fetchFn, 30 * 60 * 1000); // 30 minutes cache
      } else {
        data = await fetchFn();
      }

      setAnimeList(data);
    } catch (err) {
      console.error('Error fetching AniList top ranking anime:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch anime data');
    } finally {
      setLoading(false);
    }
  }, [sort, page, limit, enableCache]);

  useEffect(() => {
    fetchAnime();
  }, [fetchAnime]);

  return {
    animeList,
    loading,
    error,
    refetch: fetchAnime,
    pageInfo: pageInfo ? {
      total: pageInfo.total,
      currentPage: pageInfo.currentPage,
      hasNextPage: pageInfo.hasNextPage
    } : undefined
  };
}

export function useAniListTrending(options: UseAniListDataOptions = {}): UseAniListDataReturn {
  const { page = 1, limit = 20, enableCache = true } = options;

  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<any>(null);

  const fetchAnime = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const anilistService = new AniListService();

      const fetchFn = async () => {
        const response = await anilistService.getTrendingAnime(page, limit);

        if (response.data?.Page) {
          setPageInfo(response.data.Page.pageInfo);
          return transformAniListAnimeList(response.data.Page.media);
        }
        return [];
      };

      let data: Anime[];

      if (enableCache) {
        const cacheKey = generateCacheKey('anilist-trending', { page, limit });
        data = await withCache(cacheKey, fetchFn, 5 * 60 * 1000); // 5 minutes cache
      } else {
        data = await fetchFn();
      }

      setAnimeList(data);
    } catch (err) {
      console.error('Error fetching AniList trending anime:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch anime data');
    } finally {
      setLoading(false);
    }
  }, [page, limit, enableCache]);

  useEffect(() => {
    fetchAnime();
  }, [fetchAnime]);

  return {
    animeList,
    loading,
    error,
    refetch: fetchAnime,
    pageInfo: pageInfo ? {
      total: pageInfo.total,
      currentPage: pageInfo.currentPage,
      hasNextPage: pageInfo.hasNextPage
    } : undefined
  };
}
