import { db } from './db';

export async function processOfflineQueue() {
    const mutations = await db.mutations.orderBy('timestamp').toArray();

    if (mutations.length === 0) return true;

    let allSuccess = true;
    for (const mutation of mutations) {
        try {
            const res = await fetch(mutation.url, {
                method: mutation.method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: mutation.body,
            });

            if (res.ok) {
                if (mutation.id) await db.mutations.delete(mutation.id);
            } else {
                console.error('Failed to sync mutation:', mutation);
                allSuccess = false;
                // if user error, drop it to avoid infinite failure loop
                if (res.status >= 400 && res.status < 500) {
                    if (mutation.id) await db.mutations.delete(mutation.id);
                }
            }
        } catch (e) {
            console.error('Network error syncing mutation:', e);
            allSuccess = false;
            break;
        }
    }
    return allSuccess;
}
