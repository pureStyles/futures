const DEFAULT_TASK_OPTIONS = Object.freeze({
    concurrency: 3,
    delayMs: 250,
    progressEvery: 10,
});

function normalizeInput(value) {
    return typeof value === "string" ? value.trim() : "";
}

function toPositiveInt(value, fallback) {
    const parsed = Number.parseInt(normalizeInput(value), 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getRunMode() {
    return normalizeInput(process.env.UPDATE_MODE) === "backfill" ? "backfill" : "daily";
}

function getTaskOptions() {
    return {
        concurrency: toPositiveInt(process.env.TASK_CONCURRENCY, DEFAULT_TASK_OPTIONS.concurrency),
        delayMs: toPositiveInt(process.env.TASK_DELAY_MS, DEFAULT_TASK_OPTIONS.delayMs),
        progressEvery: toPositiveInt(process.env.TASK_PROGRESS_EVERY, DEFAULT_TASK_OPTIONS.progressEvery),
    };
}

module.exports = {
    DEFAULT_TASK_OPTIONS,
    getRunMode,
    getTaskOptions,
    normalizeInput,
    toPositiveInt,
};
