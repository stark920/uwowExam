export interface DataRecord {
  id: string;                    // e.g. "REC-00001"
  userName: string;              // e.g. "Elena Rostova"
  position: string;              // e.g. "Senior Frontend Architect"
  location: string;              // e.g. "Singapore, SG"
  age: number;                   // e.g. 29
  dateStart: string;             // YYYY-MM-DD e.g. "2022-03-15"
  pinnedPosition: number | null; // 1-based relative display index or null
  createdAt: number;
  updatedAt: number;
}

export type SortField = 'id' | 'userName' | 'position' | 'location' | 'age' | 'dateStart';

export interface SortCriteria {
  field: SortField;
  direction: 'asc' | 'desc';
  priority: number; // 1 = Primary, 2 = Secondary, etc.
}

export interface SearchMetricsState {
  totalKeystrokes: number;
  debouncedExecutions: number;
  abortedRequests: number;
  trafficReductionPercent: number;
  lastSearchLatencyMs: number;
  activeSignal: boolean;
}

export interface NotificationToast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
}
