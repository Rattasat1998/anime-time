import ApiClient from './apiClient';
import { JikanAnime, JikanSeasonalResponse, JikanScheduleResponse } from '@/types/jikanTypes';

class JikanService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('https://api.jikan.moe/v4');
  }

  /**
   * Get seasonal anime for a specific year and season
   */
  async getSeasonalAnime(year?: number, season?: string): Promise<JikanSeasonalResponse> {
    const currentYear = year || new Date().getFullYear();
    const seasons = ['winter', 'spring', 'summer', 'fall'];
    const currentSeason = season || seasons[Math.floor((new Date().getMonth() + 1) / 3) % 4];
    
    return this.client.get<JikanSeasonalResponse>('/seasons', {
      year: currentYear,
      season: currentSeason,
      limit: 25
    });
  }

  /**
   * Get anime by ID
   */
  async getAnimeById(id: number): Promise<JikanAnime> {
    return this.client.get<JikanAnime>(`/anime/${id}`);
  }

  /**
   * Get anime schedule by day
   */
  async getAnimeSchedule(day?: string): Promise<JikanScheduleResponse> {
    const params = day ? { filter: day.toLowerCase() } : {};
    return this.client.get<JikanScheduleResponse>('/schedules', params);
  }

  /**
   * Search anime by title
   */
  async searchAnime(query: string, limit: number = 10): Promise<{ data: JikanAnime[] }> {
    return this.client.get<{ data: JikanAnime[] }>('/anime', {
      q: query,
      limit
    });
  }

  /**
   * Get currently airing anime
   */
  async getCurrentAiringAnime(): Promise<JikanSeasonalResponse> {
    return this.client.get<JikanSeasonalResponse>('/seasons/now', {
      limit: 25
    });
  }

  /**
   * Get upcoming anime
   */
  async getUpcomingAnime(): Promise<JikanSeasonalResponse> {
    return this.client.get<JikanSeasonalResponse>('/seasons/upcoming', {
      limit: 25
    });
  }
}

export default JikanService;
