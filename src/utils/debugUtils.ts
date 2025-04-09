/**
 * Utility functions for debugging and monitoring performance
 */

// Enable/disable debug logging
const DEBUG = import.meta.env.VITE_FEATURE_DEBUG_MODE === 'true';

/**
 * Logs a message only when debug mode is enabled
 */
export function debugLog(...args: any[]): void {
    if (DEBUG) {
        console.log('[Turbo Scores]', ...args);
    }
}

/**
 * Timing utility for measuring performance of operations
 */
export function withTiming<T>(
    operation: () => T,
    label: string
): T {
    if (!DEBUG) return operation();

    const start = performance.now();
    const result = operation();
    const end = performance.now();

    debugLog(`${label}: ${Math.round(end - start)}ms`);
    return result;
}

/**
 * Deferred promise utility for artificial delays
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Class to track polling metrics
 */
export class PollingMetrics {
    private intervals: number[] = [];
    private lastPollTime: number = 0;
    private pollCount: number = 0;

    recordPoll(): void {
        const now = Date.now();

        if (this.lastPollTime > 0) {
            const interval = now - this.lastPollTime;
            this.intervals.push(interval);

            // Keep only the last 20 intervals
            if (this.intervals.length > 20) {
                this.intervals.shift();
            }
        }

        this.lastPollTime = now;
        this.pollCount++;
    }

    getAverageInterval(): number {
        if (this.intervals.length === 0) return 0;
        return this.intervals.reduce((sum, val) => sum + val, 0) / this.intervals.length;
    }

    getStats(): {
        avgInterval: number;
        minInterval: number;
        maxInterval: number;
        totalPolls: number;
    } {
        if (this.intervals.length === 0) {
            return { avgInterval: 0, minInterval: 0, maxInterval: 0, totalPolls: this.pollCount };
        }

        return {
            avgInterval: Math.round(this.getAverageInterval()),
            minInterval: Math.round(Math.min(...this.intervals)),
            maxInterval: Math.round(Math.max(...this.intervals)),
            totalPolls: this.pollCount
        };
    }

    logStats(label: string = 'Polling metrics'): void {
        if (!DEBUG) return;

        const stats = this.getStats();
        debugLog(
            `${label}:`,
            `Avg: ${Math.round(stats.avgInterval / 1000)}s,`,
            `Min: ${Math.round(stats.minInterval / 1000)}s,`,
            `Max: ${Math.round(stats.maxInterval / 1000)}s,`,
            `Total: ${stats.totalPolls} polls`
        );
    }
}

/**
 * Singleton instance for app-wide metrics
 */
export const appMetrics = {
    polling: new PollingMetrics()
}; 