/**
 * Token-bucket rate limiter enforcing <= 8 requests/sec for SEC EDGAR.
 */
class TokenBucketLimiter {
  private tokens: number;
  private lastRefillMs: number;
  private readonly maxTokens: number;
  private readonly refillRatePerSec: number;
  private queue: Array<() => void> = [];
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(maxPerSec = 8) {
    this.maxTokens = maxPerSec;
    this.tokens = maxPerSec;
    this.refillRatePerSec = maxPerSec;
    this.lastRefillMs = Date.now();
  }

  private refill() {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefillMs) / 1000;
    if (elapsedSec > 0) {
      this.tokens = Math.min(
        this.maxTokens,
        this.tokens + elapsedSec * this.refillRatePerSec
      );
      this.lastRefillMs = now;
    }
  }

  async acquire(): Promise<void> {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
      this.scheduleDrain();
    });
  }

  private scheduleDrain() {
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.refill();
      while (this.tokens >= 1 && this.queue.length > 0) {
        this.tokens -= 1;
        const next = this.queue.shift();
        next?.();
      }
      if (this.queue.length > 0) {
        this.scheduleDrain();
      }
    }, 140);
  }
}

const globalForLimiter = globalThis as unknown as {
  __secRateLimiter?: TokenBucketLimiter;
};

export const secRateLimiter =
  globalForLimiter.__secRateLimiter ??
  (globalForLimiter.__secRateLimiter = new TokenBucketLimiter(8));
