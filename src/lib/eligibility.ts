import { Track } from '@prisma/client';

/**
 * Returns a Prisma WHERE clause fragment for applicability based on the user's active track.
 * Uses multi-track boolean fields.
 */
export function getApplicabilityFilter() {
    return {};
}

/**
 * Returns a Prisma WHERE clause fragment for the Subject model based on the user's active track.
 */
export function getSubjectFilter() {
    return {};
}

/**
 * Returns the list of TrackScope values visible for a given track.
 */
export function getEligibleTrackScopes(): string[] {
    return ['COMMON', 'PROCURADOR', 'JUIZ_FEDERAL', 'JUIZ_ESTADUAL'];
}

/**
 * Human-readable label for a track.
 */
export function trackLabel(track: string): string {
    return '📚 Todas as Matérias';
}

export const ALL_TRACKS: Track[] = ['PROCURADOR', 'JUIZ_FEDERAL', 'JUIZ_ESTADUAL', 'TODAS'];
