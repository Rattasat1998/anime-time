// Streaming platform display utilities

export interface StreamingPlatform {
    name: string;
    emoji: string;
    color: string;
    bgColor: string;
}

// Map AniList external link site names to display info
const PLATFORM_MAP: Record<string, StreamingPlatform> = {
    'Crunchyroll': { name: 'Crunchyroll', emoji: '🟠', color: '#F47521', bgColor: '#FFF3EC' },
    'Netflix': { name: 'Netflix', emoji: '🔴', color: '#E50914', bgColor: '#FFF0F0' },
    'Disney Plus': { name: 'Disney+', emoji: '🔵', color: '#113CCF', bgColor: '#EEF2FF' },
    'Disney+': { name: 'Disney+', emoji: '🔵', color: '#113CCF', bgColor: '#EEF2FF' },
    'Bilibili': { name: 'Bilibili', emoji: '💙', color: '#00A1D6', bgColor: '#E8F8FE' },
    'Amazon Prime Video': { name: 'Prime Video', emoji: '🔷', color: '#00A8E1', bgColor: '#E8F7FF' },
    'HIDIVE': { name: 'HIDIVE', emoji: '🟣', color: '#7B2D8B', bgColor: '#F5EBF7' },
    'Funimation': { name: 'Funimation', emoji: '🟣', color: '#3C0474', bgColor: '#F0E8FA' },
    'YouTube': { name: 'YouTube', emoji: '▶️', color: '#FF0000', bgColor: '#FFF0F0' },
    'Hulu': { name: 'Hulu', emoji: '🟢', color: '#1CE783', bgColor: '#E8FDF4' },
    'Apple TV': { name: 'Apple TV', emoji: '⬛', color: '#000000', bgColor: '#F5F5F5' },
    'iQIYI': { name: 'iQIYI', emoji: '🟩', color: '#00BE06', bgColor: '#EAFAEA' },
    'Muse Asia': { name: 'Muse Asia', emoji: '🟡', color: '#FDB900', bgColor: '#FFFBE8' },
};

// Streaming sites to highlight (filter out schedule/tracking sites)
const STREAMING_TYPES = ['STREAMING', null];

export function getStreamingPlatforms(
    externalLinks: { site: string; url: string; type?: string | null; color?: string | null }[]
): { platform: StreamingPlatform; url: string }[] {
    if (!externalLinks) return [];

    return externalLinks
        .filter(link => STREAMING_TYPES.includes(link.type as any) || PLATFORM_MAP[link.site])
        .filter(link => PLATFORM_MAP[link.site]) // Only show known platforms
        .map(link => ({
            platform: PLATFORM_MAP[link.site],
            url: link.url,
        }))
        .filter((item, index, self) =>
            // Deduplicate by platform name
            index === self.findIndex(t => t.platform.name === item.platform.name)
        )
        .slice(0, 4); // Max 4 platforms shown
}
