# Futures Data Schedule

This folder contains the GitHub Actions entrypoint used to refresh futures data.

## Modes

`daily` is the normal scheduled mode. It only updates when the last saved trading day is exactly the previous trading day.

`backfill` is for repairing missing history. It starts from `BACKFILL_START_DATE` when provided, otherwise from the first missing trading day. `BACKFILL_END_DATE` defaults to today.

## Pipeline

1. Refresh main and secondary contracts.
2. Refresh profit data and derive typical brokers.
3. Refresh position detail data.
4. Refresh broker structure data.
5. Commit generated data files back to the repository.

The scheduler passes fresh in-memory `varietiesList` and `typicalBrokerMap` between tasks so later steps do not accidentally read stale generated config from disk.

## Tuning

`TASK_CONCURRENCY` controls how many request workers run at the same time. The default is `3`.

`TASK_DELAY_MS` controls the delay each worker waits before starting the next request. The default is `250`.

`TASK_PROGRESS_EVERY` controls how often progress is printed. The default is `10`.

Suggested values:

- Stable API: `TASK_CONCURRENCY=4`, `TASK_DELAY_MS=200`
- Default: `TASK_CONCURRENCY=3`, `TASK_DELAY_MS=250`
- Unstable API: `TASK_CONCURRENCY=2`, `TASK_DELAY_MS=500`

## Local Commands

Run the daily task:

```bash
npm run schedule:daily
```

Run backfill:

```bash
npm run schedule:backfill
```

These commands call real remote APIs and write generated data files.

## Troubleshooting

GitHub Actions logs include phase timings. Start with the slowest phase:

- `刷新主力合约`
- `更新盈亏与典型席位`
- `更新持仓详情`
- `更新席位持仓结构`

Each concurrent task also prints periodic progress, for example `进度 10/90 (11.1%)`.

If request failures increase after raising concurrency, lower `TASK_CONCURRENCY` first, then increase `TASK_DELAY_MS`.
