## 2026-05-02 - Batching Database Queries
**Learning:** Found a sequence of independent database queries fetching dashboard data. These sequential operations block each other unnecessarily, causing a network waterfall. This is a common performance bottleneck in pages with complex initial state or dashboards gathering data from multiple sources.
**Action:** When querying multiple uncoupled endpoints or tables at component initialization, always wrap them in a `Promise.all()` to fetch the data concurrently.
