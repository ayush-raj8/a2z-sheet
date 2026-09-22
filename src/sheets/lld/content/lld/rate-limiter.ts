import { lesson } from '../lessonFactory';

export default lesson({
  id: 'lld-rate-limiter',
  title: 'Rate Limiter LLD',
  section: 'lld',
  chapter: 'Systems',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['lld-methodology', 'lld-concurrency-basics'],
  summary:
    'Design token bucket / sliding window limiters for APIs — per-user keys, concurrency, and distributed considerations.',
  keywords: ['rate limiter', 'token bucket', 'sliding window', 'throttle'],
  why:
    'Rate limiting appears in API gateways and SDE-2+ interviews. You must pick an algorithm, define the key (IP/user/api), and discuss single-node vs Redis.',
  theory: [
    'Goal: allow N requests per time window per key; reject or delay excess.',
    'Algorithms: fixed window (simple, bursty at edges), sliding window log/counter, token bucket, leaky bucket.',
    'Token bucket: tokens refill at rate r, burst capacity b — common for APIs.',
    'API: allowRequest(key) → boolean / Result with retry-after.',
    'Single machine: ConcurrentHashMap of buckets + careful arithmetic with nanoTime.',
    'Distributed: centralized store (Redis INCR/PTTL or Lua token bucket) for global limits.',
    'Tradeoffs: accuracy vs memory (sliding log stores timestamps) vs burstiness (fixed window).',
  ],
  mentalModel:
    'A water tank (bucket) that fills at a steady drip. Each request drinks one cup. If the tank is empty, you wait. A large tank allows short bursts even if the long-term drip rate is modest.',
  codeTitle: 'In-memory token bucket',
  code: `import java.util.concurrent.*;

class TokenBucket {
    private final long capacity;
    private final double refillPerMillis;
    private double tokens;
    private long lastRefillMillis;

    TokenBucket(long capacity, double refillPerSecond) {
        this.capacity = capacity;
        this.refillPerMillis = refillPerSecond / 1000.0;
        this.tokens = capacity;
        this.lastRefillMillis = System.currentTimeMillis();
    }

    synchronized boolean tryConsume() {
        refill();
        if (tokens < 1) return false;
        tokens -= 1;
        return true;
    }

    private void refill() {
        long now = System.currentTimeMillis();
        double added = (now - lastRefillMillis) * refillPerMillis;
        if (added > 0) {
            tokens = Math.min(capacity, tokens + added);
            lastRefillMillis = now;
        }
    }
}

class RateLimiter {
    private final ConcurrentHashMap<String, TokenBucket> buckets = new ConcurrentHashMap<>();
    private final long capacity;
    private final double perSecond;

    RateLimiter(long capacity, double perSecond) {
        this.capacity = capacity;
        this.perSecond = perSecond;
    }

    public boolean allow(String key) {
        TokenBucket b = buckets.computeIfAbsent(
            key, k -> new TokenBucket(capacity, perSecond));
        return b.tryConsume();
    }
}

public class Demo {
    public static void main(String[] args) {
        RateLimiter rl = new RateLimiter(2, 1); // burst 2, 1 rps
        System.out.println(rl.allow("u1"));
        System.out.println(rl.allow("u1"));
        System.out.println(rl.allow("u1"));
    }
}`,
  output: `true
true
false`,
  explain: [
    'Burst of 2 succeeds; third fails until refill.',
    'Per-key buckets via ConcurrentHashMap.',
    'synchronized on bucket serializes consume/refill for that key.',
  ],
  mermaid: `sequenceDiagram
    participant C as Client
    participant RL as RateLimiter
    participant B as TokenBucket
    C->>RL: allow(user)
    RL->>B: tryConsume
    alt tokens >= 1
      B-->>RL: true
      RL-->>C: 200
    else
      B-->>RL: false
      RL-->>C: 429
    end`,
  mistakes: [
    'Fixed window without mentioning boundary burst double-rate problem.',
    'Using Thread.sleep for refill in request threads.',
    'Global lock across all keys — unnecessary contention.',
    'Ignoring clock skew in distributed setups.',
  ],
  interviewAsk: 'Compare token bucket and sliding window for API rate limiting.',
  interviewAnswer:
    'Token bucket allows controlled bursts up to capacity and smooth average rate — great for APIs. Sliding window log is accurate but memory-heavy; sliding counter approximates with less memory. Fixed window is simplest but can allow 2N at window edges. For multi-node, prefer Redis-backed token bucket/sliding counter with atomic scripts.',
  interviewTraps: [
    'Only naming algorithms without tradeoffs.',
    'Forgetting per-key isolation.',
  ],
  quiz: {
    question: 'Token bucket’s capacity primarily controls:',
    options: [
      'Disk size',
      'Maximum burst size',
      'JVM heap only',
      'Number of servers',
    ],
    correctIndex: 1,
    explain: 'Capacity is the burst ceiling; refill rate is the sustained rate.',
  },
  practice:
    'Implement a fixed-window limiter (100 req / 60s) and write a short note on how it can allow ~200 requests across a boundary.',
  practiceHints: [
    'Store windowStart and count per key.',
    'Reset when now - start >= window.',
  ],
});
