import { Track } from '@prisma/client';

/**
 * Returns a Prisma WHERE clause fragment for applicability based on the user's active track.
 * Uses multi-track boolean fields.
 */
export function getApplicabilityFilter(track: Track) {
    if (track === 'PROCURADOR') {
        return { OR: [{ forAll: true }, { forProcurador: true }, { forJuizFederal: false, forJuizEstadual: false, forProcurador: false, forAll: false }] };
    }
    if (track === 'JUIZ_FEDERAL') {
        return { OR: [{ forAll: true }, { forJuizFederal: true }, { forJuizFederal: false, forJuizEstadual: false, forProcurador: false, forAll: false }] };
    }
    // JUIZ_ESTADUAL
    return { OR: [{ forAll: true }, { forJuizEstadual: true }, { forJuizFederal: false, forJuizEstadual: false, forProcurador: false, forAll: false }] };
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
