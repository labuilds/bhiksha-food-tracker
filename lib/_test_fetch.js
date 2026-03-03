async function run() { // dummy to see undici issues
    try {
        const res = await fetch("https://zyoexovygrgurgobvgsa.supabase.co/rest/v1/", {
             headers: { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test' }
        });
        console.log("Status:", res.status);
    } catch (e) {
        console.error("Fetch err:", e.message);
    }
}
run();
