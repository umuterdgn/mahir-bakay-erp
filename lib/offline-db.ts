import Dexie, { Table } from 'dexie';

export interface OfflineReport {
  id?: number; // Tarayıcı içi geçici ID
  projectId: string;
  description: string;
  markedBlueprintBase64?: string; // İnternet yokken resimler base64 olarak tutulmalı
  markedPhotoBase64?: string;
  dxfBase64?: string; 
  createdAt: string;
  syncStatus: 'pending' | 'synced' | 'failed';
}

export class NexaOfflineDB extends Dexie {
  offlineReports!: Table<OfflineReport>;

  constructor() {
    super('NexaOfflineDB');
    this.version(1).stores({
      offlineReports: '++id, projectId, syncStatus'
    });
  }
}

export const db = new NexaOfflineDB();