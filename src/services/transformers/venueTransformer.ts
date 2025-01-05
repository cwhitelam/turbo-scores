import { VenueInfo } from '../../types/game';

export function transformVenueData(venue: any): VenueInfo {
  return {
    name: venue?.fullName ?? 'TBD',
    city: venue?.address?.city ?? '',
    state: venue?.address?.state ?? ''
  };
}