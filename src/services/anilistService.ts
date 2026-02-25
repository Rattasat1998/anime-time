import axios from 'axios';
import { AniListMedia, AniListResponse, AniListSeasonResponse } from '@/types/anilistTypes';

class AniListService {
  private baseURL = 'https://graphql.anilist.co';

  private async makeRequest(query: string, variables: any = {}): Promise<any> {
    try {
      const response = await axios.post(this.baseURL, {
        query,
        variables
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (response.data.errors) {
        throw new Error(response.data.errors.map((e: any) => e.message).join(', '));
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.status} - ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get seasonal anime for a specific season and year
   */
  async getSeasonalAnime(season: string, year: number, page: number = 1, perPage: number = 25): Promise<AniListSeasonResponse> {
    const query = `
      query ($season: MediaSeason!, $year: Int!, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(season: $season, seasonYear: $year, type: ANIME, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
              userPreferred
            }
            description
            season
            seasonYear
            episodes
            status
            format
            genres
            averageScore
            popularity
            favourites
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            coverImage {
              extraLarge
              large
              medium
              color
            }
            bannerImage
            isAdult
            trailer {
              id
              site
              thumbnail
            }
            studios {
              nodes {
                id
                name
                isAnimationStudio
              }
            }
            nextAiringEpisode {
              airingAt
              timeUntilAiring
              episode
            }
            airingSchedule {
              nodes {
                id
                airingAt
                episode
              }
            }
          }
        }
      }
    `;

    return this.makeRequest(query, { season, year, page, perPage });
  }

  /**
   * Get currently airing anime
   */
  async getCurrentAiringAnime(page: number = 1, perPage: number = 25): Promise<AniListSeasonResponse> {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
              userPreferred
            }
            description
            season
            seasonYear
            episodes
            status
            format
            genres
            averageScore
            popularity
            favourites
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            coverImage {
              extraLarge
              large
              medium
              color
            }
            bannerImage
            isAdult
            trailer {
              id
              site
              thumbnail
            }
            studios {
              nodes {
                id
                name
                isAnimationStudio
              }
            }
            nextAiringEpisode {
              airingAt
              timeUntilAiring
              episode
            }
            airingSchedule {
              nodes {
                id
                airingAt
                episode
              }
            }
          }
        }
      }
    `;

    return this.makeRequest(query, { page, perPage });
  }

  /**
   * Get upcoming anime
   */
  async getUpcomingAnime(page: number = 1, perPage: number = 25): Promise<AniListSeasonResponse> {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(type: ANIME, status: NOT_YET_RELEASED, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
              userPreferred
            }
            description
            season
            seasonYear
            episodes
            status
            format
            genres
            averageScore
            popularity
            favourites
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            coverImage {
              extraLarge
              large
              medium
              color
            }
            bannerImage
            isAdult
            trailer {
              id
              site
              thumbnail
            }
            studios {
              nodes {
                id
                name
                isAnimationStudio
              }
            }
            nextAiringEpisode {
              airingAt
              timeUntilAiring
              episode
            }
            airingSchedule {
              nodes {
                id
                airingAt
                episode
              }
            }
          }
        }
      }
    `;

    return this.makeRequest(query, { page, perPage });
  }

  /**
   * Search anime by title
   */
  async searchAnime(search: string, page: number = 1, perPage: number = 10): Promise<AniListResponse> {
    const query = `
      query ($search: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
            id
            title {
              romaji
              english
              native
              userPreferred
            }
            description
            season
            seasonYear
            episodes
            status
            format
            genres
            averageScore
            popularity
            favourites
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            coverImage {
              extraLarge
              large
              medium
              color
            }
            bannerImage
            isAdult
            trailer {
              id
              site
              thumbnail
            }
            studios {
              nodes {
                id
                name
                isAnimationStudio
              }
            }
          }
        }
      }
    `;

    return this.makeRequest(query, { search, page, perPage });
  }

  /**
   * Get detailed anime by ID (for detail modal)
   */
  async getAnimeById(id: number): Promise<any> {
    const query = `
      query ($id: Int!) {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          description(asHtml: false)
          season
          seasonYear
          episodes
          duration
          status
          format
          source
          genres
          tags {
            name
            rank
            category
          }
          averageScore
          meanScore
          popularity
          favourites
          trending
          rankings {
            rank
            type
            allTime
            context
          }
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          coverImage {
            extraLarge
            large
            medium
            color
          }
          bannerImage
          trailer {
            id
            site
            thumbnail
          }
          studios {
            nodes {
              id
              name
              isAnimationStudio
            }
          }
          nextAiringEpisode {
            airingAt
            timeUntilAiring
            episode
          }
          characters(sort: [ROLE, RELEVANCE], page: 1, perPage: 12) {
            edges {
              role
              node {
                id
                name {
                  full
                  native
                }
                image {
                  medium
                  large
                }
              }
              voiceActors(language: JAPANESE) {
                id
                name {
                  full
                  native
                }
                image {
                  medium
                  large
                }
              }
            }
          }
          relations {
            edges {
              relationType
              node {
                id
                title {
                  romaji
                  english
                  userPreferred
                }
                format
                status
                coverImage {
                  medium
                  large
                }
                type
              }
            }
          }
          externalLinks {
            id
            url
            site
            type
            language
            color
            icon
          }
        }
      }
    `;

    return this.makeRequest(query, { id });
  }

  /**
   * Get airing schedule for this week (Mon–Sun)
   */
  async getWeeklyAiringSchedule(page: number = 1, perPage: number = 50): Promise<any> {
    const now = new Date();
    // Get start of current week (Monday)
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    // Get end of week (Sunday 23:59:59)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const airingAtGreater = Math.floor(monday.getTime() / 1000);
    const airingAtLesser = Math.floor(sunday.getTime() / 1000);

    const query = `
      query ($page: Int, $perPage: Int, $airingAtGreater: Int, $airingAtLesser: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            hasNextPage
            currentPage
          }
          airingSchedules(
            airingAt_greater: $airingAtGreater
            airingAt_lesser: $airingAtLesser
            sort: TIME
          ) {
            id
            airingAt
            episode
            media {
              id
              title {
                romaji
                english
                native
                userPreferred
              }
              coverImage {
                medium
                large
                color
              }
              externalLinks {
                id
                url
                site
                type
                language
                color
                icon
              }
              format
              status
              genres
              averageScore
            }
          }
        }
      }
    `;

    return this.makeRequest(query, { page, perPage, airingAtGreater, airingAtLesser });
  }

  /**
   * Get top ranking anime sorted by score or popularity
   */
  async getTopRankingAnime(
    sort: 'SCORE_DESC' | 'POPULARITY_DESC' = 'SCORE_DESC',
    page: number = 1,
    perPage: number = 50
  ): Promise<AniListSeasonResponse> {
    const query = `
      query ($page: Int, $perPage: Int, $sort: [MediaSort]) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(type: ANIME, sort: $sort, format_in: [TV, TV_SHORT, MOVIE, ONA], averageScore_greater: 1) {
            id
            title {
              romaji
              english
              native
              userPreferred
            }
            description
            season
            seasonYear
            episodes
            status
            format
            genres
            averageScore
            popularity
            favourites
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            coverImage {
              extraLarge
              large
              medium
              color
            }
            bannerImage
            isAdult
            trailer {
              id
              site
              thumbnail
            }
            studios {
              nodes {
                id
                name
                isAnimationStudio
              }
            }
            nextAiringEpisode {
              airingAt
              timeUntilAiring
              episode
            }
          }
        }
      }
    `;

    return this.makeRequest(query, { page, perPage, sort: [sort] });
  }

  /**
   * Get trending anime (sorted by trending activity in the past hour)
   */
  async getTrendingAnime(page: number = 1, perPage: number = 20): Promise<AniListSeasonResponse> {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(type: ANIME, sort: TRENDING_DESC, format_in: [TV, TV_SHORT, MOVIE, ONA]) {
            id
            title {
              romaji
              english
              native
              userPreferred
            }
            description
            season
            seasonYear
            episodes
            status
            format
            genres
            averageScore
            popularity
            favourites
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            coverImage {
              extraLarge
              large
              medium
              color
            }
            bannerImage
            isAdult
            trailer {
              id
              site
              thumbnail
            }
            studios {
              nodes {
                id
                name
                isAnimationStudio
              }
            }
            nextAiringEpisode {
              airingAt
              timeUntilAiring
              episode
            }
          }
        }
      }
    `;

    return this.makeRequest(query, { page, perPage });
  }
}

export default AniListService;
