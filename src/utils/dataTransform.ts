import { JikanAnime, JikanSeasonalAnime } from '@/types/jikanTypes';
import { AniListMedia } from '@/types/anilistTypes';
import { Anime } from '@/types/anime';

/**
 * Transform Jikan anime data to our app's Anime format
 */
export function transformJikanAnime(jikanAnime: JikanAnime | JikanSeasonalAnime): Anime {
  // Get the first available image URL with proper null checks
  const imageUrl = jikanAnime.images?.jpg?.image_url ||
    (jikanAnime.images && 'webp' in jikanAnime.images && jikanAnime.images.webp?.image_url ? jikanAnime.images.webp.image_url : null) ||
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

  // Extract genres as strings
  const genres = jikanAnime.genres?.map(genre => genre.name) || [];

  // Get studio name (first studio if available)
  const studio = jikanAnime.studios?.length > 0 ? jikanAnime.studios[0].name : 'Unknown';

  // Extract airing date
  let airingDate = '';
  if ('aired' in jikanAnime && jikanAnime.aired?.from) {
    airingDate = jikanAnime.aired.from.split('T')[0];
  } else if ('aired' in jikanAnime && jikanAnime.aired?.string) {
    // Try to extract date from string format
    const dateMatch = jikanAnime.aired.string.match(/\d{4}-\d{2}-\d{2}/);
    if (dateMatch) {
      airingDate = dateMatch[0];
    }
  }

  // Determine status
  let status: 'airing' | 'completed' | 'upcoming' = 'airing';
  if ('status' in jikanAnime && jikanAnime.status) {
    if (jikanAnime.status.toLowerCase().includes('completed')) {
      status = 'completed';
    } else if (jikanAnime.status.toLowerCase().includes('upcoming')) {
      status = 'upcoming';
    }
  }

  // Normalize type to match our Anime interface
  let animeType: 'TV' | 'Movie' | 'OVA' | 'Special' = 'TV';
  if (jikanAnime.type) {
    const normalizedType = jikanAnime.type.toLowerCase();
    if (normalizedType === 'movie') animeType = 'Movie';
    else if (normalizedType === 'ova') animeType = 'OVA';
    else if (normalizedType === 'special') animeType = 'Special';
    else animeType = 'TV';
  }

  // Get season and year
  let season = '';
  let year = new Date().getFullYear();
  if ('season' in jikanAnime && jikanAnime.season) {
    season = jikanAnime.season.charAt(0).toUpperCase() + jikanAnime.season.slice(1);
  }
  if ('year' in jikanAnime && jikanAnime.year) {
    year = jikanAnime.year;
  }

  // Generate a safe ID - use mal_id if available, otherwise create a fallback
  const id = jikanAnime.mal_id ? jikanAnime.mal_id.toString() :
    (jikanAnime.title ? `fallback-${jikanAnime.title.replace(/[^a-zA-Z0-9]/g, '-')}` :
      `unknown-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  return {
    id,
    title: jikanAnime.title || 'Unknown Title',
    titleJapanese: jikanAnime.title_japanese || '',
    image: imageUrl,
    synopsis: jikanAnime.synopsis || 'No synopsis available.',
    episodes: jikanAnime.episodes || 0,
    status,
    airingDate,
    genres,
    rating: jikanAnime.score || 0,
    studio,
    type: animeType,
    season,
    year
  };
}

/**
 * Transform AniList anime data to our app's Anime format
 */
export function transformAniListAnime(anilistAnime: AniListMedia): Anime {
  // Get the best available image URL
  const imageUrl = anilistAnime.coverImage?.extraLarge ||
    anilistAnime.coverImage?.large ||
    anilistAnime.coverImage?.medium ||
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

  // Get the best title
  const title = anilistAnime.title.userPreferred ||
    anilistAnime.title.english ||
    anilistAnime.title.romaji ||
    'Unknown Title';

  const titleJapanese = anilistAnime.title.native || '';

  // Clean description (remove HTML tags)
  const synopsis = anilistAnime.description
    ? anilistAnime.description.replace(/<[^>]*>/g, '').substring(0, 500) + (anilistAnime.description.length > 500 ? '...' : '')
    : 'No synopsis available.';

  // Extract genres
  const genres = anilistAnime.genres || [];

  // Get studio name (first animation studio if available)
  const studio = anilistAnime.studios?.nodes?.find(s => s.isAnimationStudio)?.name ||
    anilistAnime.studios?.nodes?.[0]?.name ||
    'Unknown';

  // Create airing date from start date
  let airingDate = '';
  if (anilistAnime.startDate?.year && anilistAnime.startDate?.month && anilistAnime.startDate?.day) {
    const month = anilistAnime.startDate.month.toString().padStart(2, '0');
    const day = anilistAnime.startDate.day.toString().padStart(2, '0');
    airingDate = `${anilistAnime.startDate.year}-${month}-${day}`;
  }

  // Determine status
  let status: 'airing' | 'completed' | 'upcoming' = 'airing';
  if (anilistAnime.status) {
    if (anilistAnime.status === 'FINISHED') status = 'completed';
    else if (anilistAnime.status === 'NOT_YET_RELEASED') status = 'upcoming';
    else if (anilistAnime.status === 'RELEASING') status = 'airing';
  }

  // Normalize type
  let animeType: 'TV' | 'Movie' | 'OVA' | 'Special' = 'TV';
  if (anilistAnime.format) {
    switch (anilistAnime.format) {
      case 'TV': animeType = 'TV'; break;
      case 'MOVIE': animeType = 'Movie'; break;
      case 'OVA': animeType = 'OVA'; break;
      case 'SPECIAL': animeType = 'Special'; break;
      default: animeType = 'TV'; break;
    }
  }

  // Get season and year
  const season = anilistAnime.season ? anilistAnime.season.charAt(0).toUpperCase() + anilistAnime.season.slice(1) : '';
  const year = anilistAnime.seasonYear || new Date().getFullYear();

  return {
    id: anilistAnime.id.toString(),
    title,
    titleJapanese,
    image: imageUrl,
    synopsis,
    episodes: anilistAnime.episodes || 0,
    status,
    airingDate,
    genres,
    rating: (anilistAnime.averageScore || 0) / 10, // Convert from 100-point to 10-point scale
    studio,
    type: animeType,
    season,
    year,
    bannerImage: anilistAnime.bannerImage || undefined,
    description: synopsis,
    popularity: anilistAnime.popularity || 0,
    trailer: anilistAnime.trailer ? { id: anilistAnime.trailer.id, site: anilistAnime.trailer.site } : null,
    isAdult: anilistAnime.isAdult || false,
  };
}

/**
 * Transform an array of Jikan anime data
 */
export function transformJikanAnimeList(jikanAnimeList: (JikanAnime | JikanSeasonalAnime)[]): Anime[] {
  return jikanAnimeList.map(transformJikanAnime);
}

/**
 * Transform an array of AniList anime data
 */
export function transformAniListAnimeList(anilistAnimeList: AniListMedia[]): Anime[] {
  return anilistAnimeList.map(transformAniListAnime);
}

/**
 * Filter anime by date range
 */
export function filterAnimeByDate(animeList: Anime[], startDate: Date, endDate: Date): Anime[] {
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];

  return animeList.filter(anime => {
    if (!anime.airingDate) return false;
    return anime.airingDate >= start && anime.airingDate <= end;
  });
}

/**
 * Sort anime by airing date
 */
export function sortAnimeByDate(animeList: Anime[], ascending: boolean = true): Anime[] {
  return [...animeList].sort((a, b) => {
    if (!a.airingDate) return ascending ? 1 : -1;
    if (!b.airingDate) return ascending ? -1 : 1;

    const dateA = new Date(a.airingDate);
    const dateB = new Date(b.airingDate);

    return ascending ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
  });
}

/**
 * Group anime by month
 */
export function groupAnimeByMonth(animeList: Anime[]): Record<string, Anime[]> {
  return animeList.reduce((groups, anime) => {
    if (!anime.airingDate) return groups;

    const month = anime.airingDate.substring(0, 7); // YYYY-MM format
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(anime);
    return groups;
  }, {} as Record<string, Anime[]>);
}
