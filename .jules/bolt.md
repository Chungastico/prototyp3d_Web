## 2026-04-25 - Prevent Network Waterfalls in Supabase Queries
**Learning:** Sequential `await` calls for independent Supabase queries create network waterfalls, delaying page rendering.
**Action:** Always batch independent database queries concurrently using `Promise.all` to improve load times.
