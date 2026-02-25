'use client';

import { useState, useEffect } from 'react';
import { Anime } from '@/types/anime';
import { useLanguage } from '@/contexts/LanguageContext';
import { getThaiTitle } from '@/utils/thaiTitles';
import AniListService from '@/services/anilistService';

interface AnimeModalProps {
  anime: Anime | null;
  isOpen: boolean;
  onClose: () => void;
}

interface DetailedAnime {
  id: number;
  title: { romaji: string; english: string | null; native: string | null; userPreferred: string | null };
  description: string | null;
  season: string | null;
  seasonYear: number | null;
  episodes: number | null;
  duration: number | null;
  status: string;
  format: string;
  source: string | null;
  genres: string[];
  tags: { name: string; rank: number; category: string }[];
  averageScore: number | null;
  meanScore: number | null;
  popularity: number;
  favourites: number;
  rankings: { rank: number; type: string; allTime: boolean; context: string }[];
  startDate: { year: number | null; month: number | null; day: number | null };
  endDate: { year: number | null; month: number | null; day: number | null };
  coverImage: { extraLarge: string | null; large: string | null; medium: string | null; color: string | null };
  bannerImage: string | null;
  trailer: { id: string; site: string; thumbnail: string } | null;
  studios: { nodes: { id: number; name: string; isAnimationStudio: boolean }[] };
  nextAiringEpisode: { airingAt: number; timeUntilAiring: number; episode: number } | null;
  characters: {
    edges: {
      role: string;
      node: { id: number; name: { full: string; native: string | null }; image: { medium: string | null; large: string | null } };
      voiceActors: { id: number; name: { full: string; native: string | null }; image: { medium: string | null; large: string | null } }[];
    }[];
  };
  relations: {
    edges: {
      relationType: string;
      node: {
        id: number;
        title: { romaji: string; english: string | null; userPreferred: string | null };
        format: string;
        status: string;
        coverImage: { medium: string | null; large: string | null };
        type: string;
      };
    }[];
  };
  externalLinks: { id: number; url: string; site: string; type: string | null; language: string | null; color: string | null; icon: string | null }[];
}

function formatDate(d: { year: number | null; month: number | null; day: number | null }): string {
  if (!d.year) return '—';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parts = [];
  if (d.month) parts.push(months[d.month - 1]);
  if (d.day) parts.push(d.day);
  parts.push(d.year);
  return parts.join(' ');
}

function formatSource(source: string | null): string {
  if (!source) return '—';
  return source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatStatus(status: string): string {
  switch (status) {
    case 'FINISHED': return 'Finished';
    case 'RELEASING': return 'Airing';
    case 'NOT_YET_RELEASED': return 'Upcoming';
    case 'CANCELLED': return 'Cancelled';
    case 'HIATUS': return 'Hiatus';
    default: return status;
  }
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white/5 rounded-xl px-4 py-3 text-center border border-white/5">
      <div className="text-[18px] mb-0.5">{icon}</div>
      <p className="text-[15px] font-bold text-white">{value}</p>
      <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}

export default function AnimeModal({ anime, isOpen, onClose }: AnimeModalProps) {
  const { language } = useLanguage();
  const [detailed, setDetailed] = useState<DetailedAnime | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !anime) {
      setDetailed(null);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const service = new AniListService();
        const res = await service.getAnimeById(parseInt(anime.id));
        if (res?.data?.Media) {
          setDetailed(res.data.Media);
        }
      } catch (err) {
        console.error('Error fetching anime detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, anime]);

  if (!isOpen || !anime) return null;

  const data = detailed;
  const rawTitle = data?.title?.english || data?.title?.romaji || anime.title;
  const displayTitle = language === 'th'
    ? getThaiTitle(anime.id, rawTitle, data?.title?.native || anime.titleJapanese) || rawTitle
    : rawTitle;
  const bannerImg = data?.bannerImage || anime.bannerImage || anime.image;
  const posterImg = data?.coverImage?.extraLarge || data?.coverImage?.large || anime.image;
  const score = data?.averageScore ? (data.averageScore / 10).toFixed(1) : (anime.rating > 0 ? anime.rating.toFixed(1) : null);
  const studios = data?.studios?.nodes?.filter(s => s.isAnimationStudio) || [];
  const producers = data?.studios?.nodes?.filter(s => !s.isAnimationStudio) || [];
  const streamingLinks = data?.externalLinks?.filter(l => l.type === 'STREAMING') || [];

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#0f0f14] w-full max-w-4xl my-4 sm:my-8 rounded-2xl overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 flex items-center justify-center bg-black/50 backdrop-blur hover:bg-black/70 rounded-full transition-colors text-white/70 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Banner */}
        <div className="relative h-56 sm:h-72 overflow-hidden">
          <img src={bannerImg} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f14] via-[#0f0f14]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f14]/80 via-transparent to-transparent" />
        </div>

        {/* Hero section: poster + info */}
        <div className="relative -mt-32 sm:-mt-36 px-6 sm:px-8 z-10">
          <div className="flex gap-6 items-end">
            {/* Poster */}
            <div className="flex-shrink-0 w-32 sm:w-40 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ring-2 ring-white/10 bg-white/5">
              <img src={posterImg} alt={rawTitle} className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>

            {/* Title area */}
            <div className="flex-1 min-w-0 pb-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-1">{displayTitle}</h1>
              {data?.title?.native && (
                <p className="text-[13px] text-white/40 font-medium mb-1">{data.title.native}</p>
              )}
              {data?.title?.romaji && data.title.romaji !== rawTitle && (
                <p className="text-[12px] text-white/30">{data.title.romaji}</p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {data?.format && (
                  <span className="text-[10px] font-bold text-white/60 bg-white/10 px-2 py-0.5 rounded">{data.format}</span>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${data?.status === 'RELEASING' ? 'text-emerald-400 bg-emerald-400/10' : data?.status === 'FINISHED' ? 'text-blue-400 bg-blue-400/10' : 'text-amber-400 bg-amber-400/10'}`}>
                  {formatStatus(data?.status || anime.status)}
                </span>
                {score && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">⭐ {score}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        {data && (
          <div className="grid grid-cols-4 gap-3 px-6 sm:px-8 mt-6">
            <StatCard icon="⭐" label="Score" value={score || '—'} />
            <StatCard icon="📊" label="Popularity" value={`#${data.popularity.toLocaleString()}`} />
            <StatCard icon="❤️" label="Favorites" value={data.favourites.toLocaleString()} />
            <StatCard icon="📺" label="Episodes" value={data.episodes || '—'} />
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        )}

        {/* Main content */}
        {data && !loading && (
          <div className="px-6 sm:px-8 py-6 space-y-8">

            {/* Info grid + Synopsis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sidebar info */}
              <div className="space-y-4">
                {[
                  { label: 'Status', value: formatStatus(data.status) },
                  { label: 'Format', value: data.format || '—' },
                  { label: 'Episodes', value: data.episodes || '—' },
                  { label: 'Duration', value: data.duration ? `${data.duration} min` : '—' },
                  { label: 'Season', value: data.season && data.seasonYear ? `${data.season} ${data.seasonYear}` : '—' },
                  { label: 'Aired', value: `${formatDate(data.startDate)} — ${formatDate(data.endDate)}` },
                  { label: 'Source', value: formatSource(data.source) },
                  { label: 'Studio', value: studios.map(s => s.name).join(', ') || '—' },
                  { label: 'Producers', value: producers.map(s => s.name).join(', ') || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <p className="text-[11px] text-white/30 font-bold uppercase tracking-wider w-20 flex-shrink-0 pt-0.5">{label}</p>
                    <p className="text-[13px] text-white/70 font-medium">{value}</p>
                  </div>
                ))}

                {/* Genres */}
                <div>
                  <p className="text-[11px] text-white/30 font-bold uppercase tracking-wider mb-2">Genres</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.genres.map(genre => (
                      <span key={genre} className="text-[10px] font-semibold text-white/50 bg-white/5 px-2 py-1 rounded border border-white/10">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Synopsis */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <p className="text-[11px] text-white/30 font-bold uppercase tracking-wider mb-3">Synopsis</p>
                  <p className="text-[14px] text-white/60 leading-relaxed">
                    {data.description?.replace(/<[^>]*>/g, '') || 'No synopsis available.'}
                  </p>
                </div>

                {/* Trailer */}
                {data.trailer?.id && data.trailer.site === 'youtube' && (
                  <div>
                    <p className="text-[11px] text-white/30 font-bold uppercase tracking-wider mb-3">Trailer</p>
                    <div className="aspect-video rounded-xl overflow-hidden bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${data.trailer.id}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Trailer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Streaming */}
            {streamingLinks.length > 0 && (
              <div>
                <p className="text-[11px] text-white/30 font-bold uppercase tracking-wider mb-3">Streaming</p>
                <div className="flex flex-wrap gap-2">
                  {streamingLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                      style={{
                        color: link.color || '#fff',
                        backgroundColor: `${link.color || '#fff'}15`,
                        border: `1px solid ${link.color || '#fff'}30`,
                      }}
                    >
                      {link.site}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Characters */}
            {data.characters?.edges?.length > 0 && (
              <div>
                <p className="text-[11px] text-white/30 font-bold uppercase tracking-wider mb-3">Characters</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {data.characters.edges.slice(0, 8).map((edge) => (
                    <div key={edge.node.id} className="flex items-center gap-3 bg-white/[0.03] rounded-lg p-2 border border-white/5">
                      {/* Character */}
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 flex-shrink-0">
                        {edge.node.image?.medium && (
                          <img src={edge.node.image.medium} alt={edge.node.name.full} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-white/70 font-semibold truncate">{edge.node.name.full}</p>
                        <p className="text-[10px] text-white/30">{edge.role}</p>
                      </div>

                      {/* Voice Actor */}
                      {edge.voiceActors?.[0] && (
                        <>
                          <div className="flex-1 min-w-0 text-right">
                            <p className="text-[12px] text-white/50 font-medium truncate">{edge.voiceActors[0].name.full}</p>
                            <p className="text-[10px] text-white/20">VA</p>
                          </div>
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 flex-shrink-0">
                            {edge.voiceActors[0].image?.medium && (
                              <img src={edge.voiceActors[0].image.medium} alt={edge.voiceActors[0].name.full} className="w-full h-full object-cover" />
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Relations */}
            {data.relations?.edges?.length > 0 && (
              <div>
                <p className="text-[11px] text-white/30 font-bold uppercase tracking-wider mb-3">Related</p>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {data.relations.edges
                    .filter(e => e.node.type === 'ANIME' || e.node.type === 'MANGA')
                    .map((edge) => (
                      <div key={edge.node.id} className="flex-shrink-0 w-28 group/rel cursor-pointer">
                        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-white/5 ring-1 ring-white/5 mb-1.5">
                          {edge.node.coverImage?.medium && (
                            <img src={edge.node.coverImage.medium} alt="" className="w-full h-full object-cover group-hover/rel:scale-105 transition-transform" />
                          )}
                        </div>
                        <p className="text-[10px] text-white/50 font-medium line-clamp-2 leading-tight">
                          {edge.node.title.english || edge.node.title.romaji || edge.node.title.userPreferred}
                        </p>
                        <p className="text-[9px] text-white/25 font-semibold uppercase mt-0.5">
                          {edge.relationType?.replace(/_/g, ' ')}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
