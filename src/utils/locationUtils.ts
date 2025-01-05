import { VenueInfo } from '../types/game';

export function formatLocation(venue: VenueInfo): string {
  if (!venue?.name) return 'TBD';
  if (!venue.city) return venue.name;
  if (!venue.state) return `${venue.name} • ${venue.city}`;
  return `${venue.name} • ${venue.city}, ${venue.state}`;
}