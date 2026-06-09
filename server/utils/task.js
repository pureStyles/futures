function sleep(ms = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizePositiveInt(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

async function mapWithConcurrency(items, worker, options = {}) {
    const {
        concurrency = 1,
        delayMs = 0,
        onProgress,
    } = options;

    if (!Array.isArray(items) || items.length === 0) {
        return [];
    }

    const results = new Array(items.length);
    let nextIndex = 0;
    let completed = 0;
    const workerCount = Math.min(normalizePositiveInt(concurrency, 1), items.length);
    const normalizedDelayMs = Math.max(0, normalizePositiveInt(delayMs, 0));

    async function runWorker() {
        let hasRun = false;

        while (nextIndex < items.length) {
            const currentIndex = nextIndex;
            nextIndex += 1;

            if (hasRun && normalizedDelayMs > 0) {
                await sleep(normalizedDelayMs);
            }

            hasRun = true;
            results[currentIndex] = await worker(items[currentIndex], currentIndex);
            completed += 1;
            if (typeof onProgress === "function") {
                onProgress({
                    completed,
                    total: items.length,
                    index: currentIndex,
                    item: items[currentIndex],
                });
            }
        }
    }

    await Promise.all(Array.from({ length: workerCount }, () => runWorker()));
    return results;
}

function createProgressLogger(label, options = {}) {
    const every = normalizePositiveInt(options.every, 10);
    let lastLogged = 0;

    return ({ completed, total }) => {
        if (completed === total || completed - lastLogged >= every) {
            lastLogged = completed;
            const progress = ((completed / total) * 100).toFixed(1);
            console.log(`↳ ${label} 进度 ${completed}/${total} (${progress}%)`);
        }
    };
}

module.exports = {
    sleep,
    mapWithConcurrency,
    createProgressLogger,
};
