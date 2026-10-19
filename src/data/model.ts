export type CareKind = 'water' | 'feed';
export type CareStatus = 'ok' | 'soon' | 'due' | 'overdue';

export const CARE_STATUSES: readonly CareStatus[] = ['ok', 'soon', 'due', 'overdue'];

// One care action of a plant, as reported by the plant_care integration.
export interface Care {
  kind: CareKind;
  nextAt: Date | null;
  status: CareStatus | null; // as the status sensor reports it; see careStatus()
  intervalDays: number | null;
  nextEntityId?: string;
  statusEntityId?: string;
  buttonEntityId?: string;
}

export interface Plant {
  deviceId: string;
  name: string;
  areaId: string | null;
  species: string | null;
  image: string | null;
  photoEntityId?: string;
  water: Care;
  feed: Care;
}
