export type CareKind = 'water' | 'feed';
export type CareStatus = 'ok' | 'soon' | 'due' | 'overdue';

export const CARE_STATUSES: readonly CareStatus[] = ['ok', 'soon', 'due', 'overdue'];

// One care action of a plant, as reported by the plant_care integration.
export interface Care {
  kind: CareKind;
  nextAt: Date | null;
  status: CareStatus | null; // from the status sensor; never recomputed
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
  water: Care;
  feed: Care;
}
