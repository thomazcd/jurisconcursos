import { Applicability, Track } from '@prisma/client';

/**
 * Returns the list of Applicability values visible for a given track.
 */
export function getEligibleApplicabilities(track: Track): Applicability[] {
    if (track === 'JUIZ') {
        return ['GERAL', 'JUIZ', 'AMBOS'];
    }
    // PROCURADOR
    return ['GERAL', 'PROCURADOR', 'AMBOS'];
}

/**
 * Returns the list of TrackScope values visible for a given track.
 */
export function getEligibleTrackScopes(track: Track) {
    if (track === 'JUIZ') return ['COMMON', 'JUIZ'] as const;
    return ['COMMON', 'PROCURADOR'] as const;
}
