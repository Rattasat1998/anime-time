'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SafeModeContextType {
    safeMode: boolean;
    setSafeMode: (value: boolean) => void;
}

const SafeModeContext = createContext<SafeModeContextType>({
    safeMode: true,
    setSafeMode: () => { },
});

export function SafeModeProvider({ children }: { children: ReactNode }) {
    const [safeMode, setSafeMode] = useState(true); // Safe mode ON by default

    return (
        <SafeModeContext.Provider value={{ safeMode, setSafeMode }}>
            {children}
        </SafeModeContext.Provider>
    );
}

export function useSafeMode() {
    return useContext(SafeModeContext);
}

const NSFW_GENRES = ['Ecchi', 'Hentai'];

/**
 * Filter anime list based on safe mode.
 * Removes anime that are marked isAdult or have NSFW genres.
 */
export function filterNSFW<T extends { isAdult?: boolean; genres: string[] }>(
    items: T[],
    safeMode: boolean
): T[] {
    if (!safeMode) return items;
    return items.filter(
        (item) => !item.isAdult && !item.genres.some((g) => NSFW_GENRES.includes(g))
    );
}
