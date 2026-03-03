import Dexie, { type Table } from 'dexie';

export interface OfflineMutation {
    id?: number;
    url: string;
    method: string;
    body?: string;
    timestamp: number;
    tempId?: string; // used to identify local optimistic creations
}

export class BhikshaDB extends Dexie {
    mutations!: Table<OfflineMutation>;

    constructor() {
        super('BhikshaOfflineDB');
        this.version(1).stores({
            mutations: '++id, timestamp'
        });
    }
}

export const db = new BhikshaDB();
