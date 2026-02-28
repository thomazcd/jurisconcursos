import { Track } from '@prisma/client';

/**
 * Returns a Prisma WHERE clause fragment for applicability based on the user's active track.
 * Uses multi-track boolean fields.
 */
export function getApplicabilityFilter(track: Track) {
    // TEMPORARILY DISABLED: Show everything to restore user state
    return {};
}

/**
 * Returns the list of TrackScope values visible for a given track.
 */
export function getEligibleTrackScopes(track: Track): string[] {
    if (track === 'PROCURADOR') return ['COMMON', 'PROCURADOR'];
    if (track === 'JUIZ_FEDERAL') return ['COMMON', 'JUIZ_FEDERAL'];
    return ['COMMON', 'JUIZ_ESTADUAL'];
}

/**
 * Human-readable label for a track.
 */
export function trackLabel(track: string): string {
    if (track === 'PROCURADOR') return '📋 Procurador do Estado';
    if (track === 'JUIZ_FEDERAL') return '⚖️ Juiz Federal';
    return '⚖️ Juiz Estadual';
}

export const ALL_TRACKS: Track[] = ['PROCURADOR', 'JUIZ_FEDERAL', 'JUIZ_ESTADUAL'];
