import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, getDocFromCache } from 'firebase/firestore';
import { Anime } from '@/types/anime';

// Type definition for what is stored in Firestore
interface FirestoreAnimeCache {
    items: Anime[];
    updatedAt: string;
}

/**
 * Generic hook to fetch a specific cached collection from Firestore
 */
function useFirebaseCache(collectionId: 'trending' | 'topRated' | 'airing' | 'upcoming') {
    const [animeList, setAnimeList] = useState<Anime[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                const docRef = doc(db, 'cache_anime', collectionId);

                // Try server first, fallback to local cache if offline
                let docSnap;
                try {
                    docSnap = await getDoc(docRef);
                } catch (fetchErr: any) {
                    if (fetchErr?.message?.includes('offline') || fetchErr?.code === 'unavailable') {
                        console.warn(`Client offline, trying cache for ${collectionId}...`);
                        docSnap = await getDocFromCache(docRef);
                    } else {
                        throw fetchErr;
                    }
                }

                if (docSnap.exists()) {
                    const data = docSnap.data() as FirestoreAnimeCache;
                    if (isMounted) {
                        setAnimeList(data.items || []);
                        setError(null);
                    }
                } else {
                    console.warn(`No cached data found for ${collectionId} in Firestore.`);
                    if (isMounted) {
                        setAnimeList([]);
                    }
                }
            } catch (err) {
                console.error(`Firebase fetch error for ${collectionId}:`, err);
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error('Unknown error fetching from Firebase'));
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [collectionId]);

    // Added refetch as a no-op to match the old AniList hook signature, 
    // making migration in UI components easier.
    return { animeList, loading, error, refetch: () => { } };
}

// Specific hooks replicating the original AniListData hooks signature
export function useFirebaseTrending() {
    return useFirebaseCache('trending');
}

export function useFirebaseTopRanking() {
    return useFirebaseCache('topRated');
}

export function useFirebaseCurrentAiring() {
    return useFirebaseCache('airing');
}

export function useFirebaseUpcoming() {
    return useFirebaseCache('upcoming');
}
