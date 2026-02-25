'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useAniListTrending, useAniListTopRanking, useAniListCurrentAiringAnime, useAniListUpcomingAnime } from '@/hooks/useAniListData';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSafeMode, filterNSFW } from '@/contexts/SafeModeContext';
import { getThaiTitle } from '@/utils/thaiTitles';
import { Anime } from '@/types/anime';

interface HomePageProps {
    onAnimeClick: (anime: Anime) => void;
}

/* ─── Horizontal Scroll Row ──────────────────────────── */

function AnimeRow({
    title,
    animeList,
    loading,
    language,
    onAnimeClick,
}: {
    title: string;
    animeList: Anime[];
    loading: boolean;
    language: string;
    onAnimeClick: (anime: Anime) => void;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateScrollState = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };

    useEffect(() => {
        updateScrollState();
    }, [animeList]);

    const scroll = (dir: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const amount = el.clientWidth * 0.75;
        el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="mb-10">
                <h2 className="text-[15px] font-bold text-white/90 mb-4 px-1">{title}</h2>
                <div className="flex gap-3 overflow-hidden">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-[160px] aspect-[3/4] rounded-lg bg-white/5 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (animeList.length === 0) return null;

    return (
        <div className="mb-10 group/row relative">
            <h2 className="text-[15px] font-bold text-white/90 mb-4 px-1 tracking-wide">{title}</h2>

            <div className="relative">
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-r from-[#0a0a0f] to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
                    >
                        <span className="text-white/80 text-xl">‹</span>
                    </button>
                )}

                <div
                    ref={scrollRef}
                    onScroll={updateScrollState}
                    className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {animeList.map((anime) => {
                        const rawTitle = anime.title;
                        const displayTitle = language === 'th'
                            ? getThaiTitle(anime.id, rawTitle, anime.titleJapanese) || rawTitle
                            : rawTitle;

                        return (
                            <div
                                key={anime.id}
                                onClick={() => onAnimeClick(anime)}
                                className="flex-shrink-0 w-[140px] sm:w-[160px] cursor-pointer group/card"
                            >
                                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-white/5 mb-2 ring-1 ring-white/5 group-hover/card:ring-white/20 transition-all group-hover/card:scale-[1.03] group-hover/card:shadow-2xl">
                                    <img
                                        src={anime.image}
                                        alt={rawTitle}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                </div>
                                <p className="text-[12px] text-white/70 font-medium leading-tight line-clamp-2 group-hover/card:text-white transition-colors">
                                    {displayTitle}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    {anime.rating > 0 && (
                                        <span className="text-[10px] text-emerald-400 font-bold">⭐ {anime.rating.toFixed(1)}</span>
                                    )}
                                    <span className="text-[10px] text-white/30">{anime.type}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-l from-[#0a0a0f] to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
                    >
                        <span className="text-white/80 text-xl">›</span>
                    </button>
                )}
            </div>
        </div>
    );
}

/* ─── Hero Banner Carousel with Video ────────────────── */

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: (() => void) | undefined;
    }
}

function HeroCarousel({
    animeList,
    language,
    onAnimeClick,
}: {
    animeList: Anime[];
    language: string;
    onAnimeClick: (anime: Anime) => void;
}) {
    const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * Math.min(animeList.length, 5)));
    const [isMuted, setIsMuted] = useState(true);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [ytApiLoaded, setYtApiLoaded] = useState(false);
    const [videoActive, setVideoActive] = useState(false); // true while a video is loaded and hasn't ended
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const heroItems = animeList.slice(0, 5);
    const currentAnime = heroItems[currentIndex];

    // Load YouTube IFrame API
    useEffect(() => {
        if (window.YT && window.YT.Player) {
            setYtApiLoaded(true);
            return;
        }
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
        window.onYouTubeIframeAPIReady = () => setYtApiLoaded(true);
        return () => { window.onYouTubeIframeAPIReady = undefined; };
    }, []);

    // Create / update player when slide changes
    useEffect(() => {
        if (!ytApiLoaded) return;
        const trailerId = currentAnime?.trailer?.id;
        const trailerSite = currentAnime?.trailer?.site;

        // Destroy old player
        if (playerRef.current) {
            try { playerRef.current.destroy(); } catch { }
            playerRef.current = null;
        }
        setIsVideoReady(false);
        setIsVideoPlaying(false);

        if (!trailerId || trailerSite !== 'youtube') return;

        // Small delay for DOM to settle
        const timeout = setTimeout(() => {
            const el = document.getElementById('hero-yt-player');
            if (!el) return;

            playerRef.current = new window.YT.Player('hero-yt-player', {
                videoId: trailerId,
                playerVars: {
                    autoplay: 1,
                    mute: 1,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    playsinline: 1,
                    origin: window.location.origin,
                    cc_load_policy: 1,
                    cc_lang_pref: 'th',
                },
                events: {
                    onReady: (event: any) => {
                        setIsVideoReady(true);
                        setVideoActive(true);
                        event.target.playVideo();
                        try { event.target.setPlaybackQuality('hd720'); } catch { }
                        if (isMuted) event.target.mute(); else event.target.unMute();
                    },
                    onStateChange: (event: any) => {
                        const state = event.data;
                        setIsVideoPlaying(state === window.YT.PlayerState.PLAYING);
                        // When video ends, advance to next slide
                        if (state === window.YT.PlayerState.ENDED) {
                            setVideoActive(false);
                            setCurrentIndex((prev) => (prev + 1) % heroItems.length);
                        }
                    },
                },
            });
        }, 300);

        return () => clearTimeout(timeout);
    }, [ytApiLoaded, currentIndex, currentAnime]);

    // Sync mute state
    useEffect(() => {
        if (!playerRef.current) return;
        try {
            if (isMuted) playerRef.current.mute();
            else playerRef.current.unMute();
        } catch { }
    }, [isMuted]);

    // Auto-rotate slides — 3s for image-only, wait for video end on video slides
    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        // If a video is active (loaded and playing/buffering), don't auto-rotate — let video end trigger the change
        if (videoActive) return;
        // Check if current slide has a youtube trailer — if so, give it time to load
        const hasYoutubeTrailer = currentAnime?.trailer?.id && currentAnime?.trailer?.site === 'youtube';
        const delay = hasYoutubeTrailer ? 8000 : 3000; // 8s to let video load, 3s for image-only
        timerRef.current = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % heroItems.length);
        }, delay);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [heroItems.length, videoActive, currentIndex]);

    // Intersection Observer — pause video when scrolled out of view
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!playerRef.current) return;
                try {
                    if (entry.isIntersecting) {
                        playerRef.current.playVideo();
                    } else {
                        playerRef.current.pauseVideo();
                    }
                } catch { }
            },
            { threshold: 0.3 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [currentIndex]);

    if (!currentAnime) return null;

    const rawTitle = currentAnime.title;
    const displayTitle = language === 'th'
        ? getThaiTitle(currentAnime.id, rawTitle, currentAnime.titleJapanese) || rawTitle
        : rawTitle;
    const bgImage = currentAnime.bannerImage || currentAnime.image;
    const hasTrailer = currentAnime.trailer?.id && currentAnime.trailer?.site === 'youtube';

    const goToSlide = (idx: number) => {
        setVideoActive(false);
        setCurrentIndex(idx);
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    return (
        <div ref={containerRef} className="relative w-full rounded-2xl overflow-hidden mb-10" style={{ minHeight: '480px' }}>
            {/* Background image (always shown, video overlays it) */}
            <div className="absolute inset-0 transition-opacity duration-700">
                <img
                    key={currentAnime.id}
                    src={bgImage}
                    alt={rawTitle}
                    className="w-full h-full object-cover animate-fade-in"
                />
            </div>

            {/* YouTube video overlay — sized to cover like object-fit:cover */}
            {hasTrailer && (
                <div
                    className={`absolute inset-0 overflow-hidden transition-opacity duration-1000 ${isVideoPlaying ? 'opacity-100' : 'opacity-0'}`}
                    style={{ pointerEvents: isVideoPlaying ? 'auto' : 'none' }}
                >
                    <div
                        className="absolute"
                        style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 'max(100%, 177.78vh)', /* 16:9 aspect ratio coverage */
                            height: 'max(100%, 56.25vw)',
                        }}
                    >
                        <div id="hero-yt-player" style={{ width: '100%', height: '100%' }} />
                    </div>
                </div>
            )}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent z-[1]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/80 via-transparent to-transparent z-[1]" />

            {/* Content */}
            <div
                className="relative z-10 flex flex-col justify-end h-full p-8 sm:p-10 cursor-pointer"
                style={{ minHeight: '480px' }}
                onClick={() => onAnimeClick(currentAnime)}
            >
                <div className="max-w-xl">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20 tracking-wider uppercase">
                            🔥 {language === 'th' ? 'กำลังมาแรง' : 'Trending'} #{currentIndex + 1}
                        </span>
                        {currentAnime.rating > 0 && (
                            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                                ⭐ {currentAnime.rating.toFixed(1)}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-3 drop-shadow-lg">
                        {displayTitle}
                    </h1>

                    {/* Meta */}
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <span className="text-[12px] text-white/50 font-medium">{currentAnime.type}</span>
                        {currentAnime.episodes > 0 && (
                            <>
                                <span className="text-white/20 text-[10px]">·</span>
                                <span className="text-[12px] text-white/50">{currentAnime.episodes} {language === 'th' ? 'ตอน' : 'Episodes'}</span>
                            </>
                        )}
                        <span className="text-white/20 text-[10px]">·</span>
                        <span className="text-[12px] text-white/50">{currentAnime.studio}</span>
                    </div>

                    {/* Synopsis */}
                    {currentAnime.description && (
                        <p className="text-[13px] text-white/60 leading-relaxed line-clamp-2 mb-5 max-w-lg">
                            {currentAnime.description}
                        </p>
                    )}

                    {/* Genre chips */}
                    <div className="flex flex-wrap gap-1.5">
                        {currentAnime.genres.slice(0, 5).map((genre) => (
                            <span key={genre} className="text-[10px] font-semibold text-white/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                                {genre}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom controls bar */}
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3">
                {/* Mute / Unmute button */}
                {hasTrailer && isVideoReady && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 border border-white/20 backdrop-blur-sm hover:bg-black/60 transition-colors text-white/70 hover:text-white"
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                        )}
                    </button>
                )}
            </div>

            {/* Slide indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {heroItems.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
                        className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                    />
                ))}
            </div>

            {/* Prev / Next arrows */}
            <button
                onClick={(e) => { e.stopPropagation(); goToSlide((currentIndex - 1 + heroItems.length) % heroItems.length); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 border border-white/10 text-white/50 hover:text-white hover:bg-black/50 transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
                style={{ opacity: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
            >
                ‹
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); goToSlide((currentIndex + 1) % heroItems.length); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 border border-white/10 text-white/50 hover:text-white hover:bg-black/50 transition-all"
                style={{ opacity: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
            >
                ›
            </button>
        </div>
    );
}

/* ─── Main HomePage Component ────────────────────────── */

export default function HomePage({ onAnimeClick }: HomePageProps) {
    const { language } = useLanguage();
    const { safeMode } = useSafeMode();

    const { animeList: trending, loading: trendingLoading } = useAniListTrending({ enableCache: true, limit: 20 });
    const { animeList: topRated, loading: topRatedLoading } = useAniListTopRanking('score', { enableCache: true, limit: 20 });
    const { animeList: airing, loading: airingLoading } = useAniListCurrentAiringAnime({ enableCache: true, limit: 20 });
    const { animeList: upcoming, loading: upcomingLoading } = useAniListUpcomingAnime({ enableCache: true, limit: 20 });

    // Combine all anime from all pools, deduplicate by ID, and randomly pick 5
    const heroAnimeList = useMemo(() => {
        const allAnime = [...trending, ...topRated, ...airing, ...upcoming];
        // Deduplicate by ID
        const unique = Array.from(new Map(allAnime.map(a => [a.id, a])).values());
        // Apply NSFW filter
        const safe = filterNSFW(unique, safeMode);
        // Prefer ones with banner images
        const withBanner = safe.filter(a => a.bannerImage);
        const withoutBanner = safe.filter(a => !a.bannerImage);
        // Shuffle
        const shuffle = <T,>(arr: T[]): T[] => {
            const copy = [...arr];
            for (let i = copy.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [copy[i], copy[j]] = [copy[j], copy[i]];
            }
            return copy;
        };
        const pool = [...shuffle(withBanner), ...shuffle(withoutBanner)];
        return pool.slice(0, 5);
    }, [trending, topRated, airing, upcoming, safeMode]);

    const allLoading = trendingLoading && topRatedLoading && airingLoading && upcomingLoading;

    if (allLoading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                    <p className="text-[13px] text-white/40">
                        {language === 'th' ? 'กำลังโหลด...' : 'Loading…'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Hero Carousel */}
            {heroAnimeList.length > 0 && (
                <HeroCarousel animeList={heroAnimeList} language={language} onAnimeClick={onAnimeClick} />
            )}

            {/* Rows */}
            <AnimeRow
                title={language === 'th' ? '🔥 กำลังมาแรง' : '🔥 Trending Now'}
                animeList={filterNSFW(trending, safeMode)}
                loading={trendingLoading}
                language={language}
                onAnimeClick={onAnimeClick}
            />

            <AnimeRow
                title={language === 'th' ? '⭐ คะแนนสูงสุด' : '⭐ Top Rated'}
                animeList={filterNSFW(topRated, safeMode)}
                loading={topRatedLoading}
                language={language}
                onAnimeClick={onAnimeClick}
            />

            <AnimeRow
                title={language === 'th' ? '📺 กำลังออกอากาศ' : '📺 Currently Airing'}
                animeList={filterNSFW(airing, safeMode)}
                loading={airingLoading}
                language={language}
                onAnimeClick={onAnimeClick}
            />

            <AnimeRow
                title={language === 'th' ? '🗓 เร็วๆ นี้' : '🗓 Upcoming'}
                animeList={filterNSFW(upcoming, safeMode)}
                loading={upcomingLoading}
                language={language}
                onAnimeClick={onAnimeClick}
            />
        </div>
    );
}
