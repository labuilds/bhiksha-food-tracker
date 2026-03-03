import { db } from './db';

export async function offlineFetch(url: string, options: RequestInit) {
    if (navigator.onLine) {
        try {
            const res = await fetch(url, options);
            if (res.ok) return res;
        } catch (e) {
            console.warn("Fetch failed, falling back to offline queue if mutation.");
        }
    }

    const method = options.method?.toUpperCase() || 'GET';
    if (method !== 'GET') {
        await db.mutations.add({
            url,
            method,
            body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body),
            timestamp: Date.now(),
        });

        // Return a mocked successful response
        return new Response(JSON.stringify({ success: true, offline: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    throw new Error("Network request failed and offline mode is unsupported for GET queries.");
}
