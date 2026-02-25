import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import AniListService from '@/services/anilistService';
import { transformAniListAnimeList } from '@/utils/dataTransform';

export async function GET(request: Request) {
    // 1. Verify Authorization (so no one else can trigger this randomly)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Return 401 Unauthorized if the secret doesn't match
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('🔄 Starting Anime sync from AniList to Firestore...');

        // 2. Fetch data from AniList
        const aniListService = new AniListService();
        const [trendingData, topRatedData, airingData, upcomingData] = await Promise.all([
            aniListService.getTrendingAnime(1, 50),
            aniListService.getTopRankingAnime('SCORE_DESC', 1, 50),
            aniListService.getCurrentAiringAnime(1, 50),
            aniListService.getUpcomingAnime(1, 50),
        ]);

        // Transform data
        const trending = transformAniListAnimeList(trendingData?.data?.Page?.media || []);
        const topRated = transformAniListAnimeList(topRatedData?.data?.Page?.media || []);
        const airing = transformAniListAnimeList(airingData?.data?.Page?.media || []);
        const upcoming = transformAniListAnimeList(upcomingData?.data?.Page?.media || []);

        // 3. Batch write to Firestore
        const batch = adminDb.batch();

        // Helper function to set collection data in a single document for easy retrieval
        // Since a document is limited to 1MB, 50 items (around 50-100KB) fits easily in a single document
        const setCache = (id: string, data: any[]) => {
            const docRef = adminDb.collection('cache_anime').doc(id);
            batch.set(docRef, {
                items: data,
                updatedAt: new Date().toISOString()
            });
        };

        setCache('trending', trending);
        setCache('topRated', topRated);
        setCache('airing', airing);
        setCache('upcoming', upcoming);

        await batch.commit();
        console.log('✅ Successfully synced Anime to Firestore!');

        return NextResponse.json({
            success: true,
            message: `Synced ${trending.length} trending, ${topRated.length} top rated, ${airing.length} airing, ${upcoming.length} upcoming anime.`,
            updatedAt: new Date().toISOString(),
        });

    } catch (error) {
        console.error('❌ Failed to sync anime data:', error);
        return NextResponse.json({ error: 'Failed to sync data', details: error }, { status: 500 });
    }
}
