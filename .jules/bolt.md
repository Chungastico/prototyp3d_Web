## 2025-05-18 - [Supabase Query Waterfall Optimization]
**Learning:** Sequential Supabase queries created a noticeable network waterfall on the DashboardOverview page.
**Action:** When fetching independent datasets from Supabase on a single page, always batch them concurrently using `Promise.all` to reduce load time and eliminate network waterfalls.
