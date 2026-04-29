## 2024-11-20 - [Promise.all Batching Supabase Queries]
**Learning:** Sequential await calls to independent Supabase queries create a significant network waterfall, especially when loading a dashboard with multiple distinct data sources (jobs, tasks, inventory, monthly stats).
**Action:** Always wrap independent data fetching operations in Promise.all when loading page-level data. This allows Next.js and Supabase to resolve requests concurrently, significantly reducing the Time to First Byte (TTFB) for complex views.
