import { useState, useEffect, useCallback } from 'react';
import JikanService from '@/services/jikanService';
import { Anime } from '@/types/anime';
import { transformJikanAnimeList } from '@/utils/dataTransform';
import cacheManager, { withCache, generateCacheKey } from '@/utils/cacheUtils';

interface UseAnimeDataOptions {
  season?: string;
  year?: number;
  limit?: number;
  enableCache?: boolean;
}

interface UseAnimeDataReturn {
  animeList: Anime[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSeasonalAnime(options: UseAnimeDataOptions = {}): UseAnimeDataReturn {
  const { season, year, limit = 25, enableCache = true } = options;
  
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnime = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const jikanService = new JikanService();
      
      const fetchFn = async () => {
        const response = await jikanService.getSeasonalAnime(year, season);
        return transformJikanAnimeList(response.data);
      };

      let data: Anime[];
      
      if (enableCache) {
        const cacheKey = generateCacheKey('seasonal', { year, season, limit });
        data = await withCache(cacheKey, fetchFn, 10 * 60 * 1000); // 10 minutes cache
      } else {
        data = await fetchFn();
      }

      setAnimeList(data);
    } catch (err) {
      console.error('Error fetching seasonal anime:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch anime data');
    } finally {
      setLoading(false);
    }
  }, [season, year, limit, enableCache]);

  useEffect(() => {
    fetchAnime();
  }, [fetchAnime]);

  return {
    animeList,
    loading,
    error,
    refetch: fetchAnime
  };
}

export function useCurrentAiringAnime(options: UseAnimeDataOptions = {}): UseAnimeDataReturn {
  const { limit = 25, enableCache = true } = options;
  
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnime = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const jikanService = new JikanService();
      
      const fetchFn = async () => {
        const response = await jikanService.getCurrentAiringAnime();
        return transformJikanAnimeList(response.data);
      };

      let data: Anime[];
      
      if (enableCache) {
        const cacheKey = generateCacheKey('current', { limit });
        data = await withCache(cacheKey, fetchFn, 5 * 60 * 1000); // 5 minutes cache
      } else {
        data = await fetchFn();
      }

      setAnimeList(data);
    } catch (err) {
      console.error('Error fetching current airing anime:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch anime data');
    } finally {
      setLoading(false);
    }
  }, [limit, enableCache]);

  useEffect(() => {
    fetchAnime();
  }, [fetchAnime]);

  return {
    animeList,
    loading,
    error,
    refetch: fetchAnime
  };
}

export function useUpcomingAnime(options: UseAnimeDataOptions = {}): UseAnimeDataReturn {
  const { limit = 25, enableCache = true } = options;
  
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnime = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const jikanService = new JikanService();
      
      const fetchFn = async () => {
        const response = await jikanService.getUpcomingAnime();
        return transformJikanAnimeList(response.data);
      };

      let data: Anime[];
      
      if (enableCache) {
        const cacheKey = generateCacheKey('upcoming', { limit });
        data = await withCache(cacheKey, fetchFn, 30 * 60 * 1000); // 30 minutes cache
      } else {
        data = await fetchFn();
      }

      setAnimeList(data);
    } catch (err) {
      console.error('Error fetching upcoming anime:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch anime data');
    } finally {
      setLoading(false);
    }
  }, [limit, enableCache]);

  useEffect(() => {
    fetchAnime();
  }, [fetchAnime]);

  return {
    animeList,
    loading,
    error,
    refetch: fetchAnime
  };
}

export function useAnimeSearch(query: string, limit: number = 10): UseAnimeDataReturn {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchAnime = useCallback(async () => {
    if (!query.trim()) {
      setAnimeList([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const jikanService = new JikanService();
      const response = await jikanService.searchAnime(query, limit);
      const data = transformJikanAnimeList(response.data);
      
      setAnimeList(data);
    } catch (err) {
      console.error('Error searching anime:', err);
      setError(err instanceof Error ? err.message : 'Failed to search anime');
    } finally {
      setLoading(false);
    }
  }, [query, limit]);

  useEffect(() => {
    searchAnime();
  }, [searchAnime]);

  return {
    animeList,
    loading,
    error,
    refetch: searchAnime
  };
}
