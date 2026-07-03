const elements = {
  launchWarning: document.querySelector("#launch-warning"),
  runtimeHealth: document.querySelector("#runtime-health"),
  runtimePort: document.querySelector("#runtime-port"),
  targetCount: document.querySelector("#target-count"),
  requestRate: document.querySelector("#request-rate"),
  successRate: document.querySelector("#success-rate"),
  fourxxRate: document.querySelector("#fourxx-rate"),
  fivexxRate: document.querySelector("#fivexx-rate"),
  p50: document.querySelector("#p50"),
  p95: document.querySelector("#p95"),
  p99: document.querySelector("#p99"),
  coachTitle: document.querySelector("#coach-title"),
  coachCopy: document.querySelector("#coach-copy"),
  coachRunbook: document.querySelector("#coach-runbook"),
  diagnosisTitle: document.querySelector("#diagnosis-title"),
  diagnosisCopy: document.querySelector("#diagnosis-copy"),
  simulationOutput: document.querySelector("#simulation-output"),
  eventStream: document.querySelector("#event-stream"),
  windowLabel: document.querySelector("#window-label"),
  metricChart: document.querySelector("#metric-chart"),
  activeLayer: document.querySelector("#active-layer"),
  journeyLayer: document.querySelector("#journey-layer"),
  journeyTitle: document.querySelector("#journey-title"),
  journeyCopy: document.querySelector("#journey-copy"),
  journeyProtocol: document.querySelector("#journey-protocol"),
  journeyPort: document.querySelector("#journey-port"),
  journeyMetric: document.querySelector("#journey-metric"),
  journeyCommands: document.querySelector("#journey-commands"),
  journeyInsight: document.querySelector("#journey-insight"),
  metricTitle: document.querySelector("#metric-title"),
  metricCopy: document.querySelector("#metric-copy"),
  metricActions: document.querySelector("#metric-actions"),
  themeToggle: document.querySelector("#theme-toggle"),
  currentDrill: document.querySelector("#current-drill"),
  currentMovement: document.querySelector("#current-movement"),
  currentLayer: document.querySelector("#current-layer"),
  currentCheck: document.querySelector("#current-check"),
  urlPartCopy: document.querySelector("#url-part-copy"),
  coachTrigger: document.querySelector("#coach-trigger"),
  coachNumbers: document.querySelector("#coach-numbers"),
  coachReason: document.querySelector("#coach-reason"),
  coachFix: document.querySelector("#coach-fix"),
};

const urlPartGuide = {
  protocol:
    "https means the browser uses TLS encryption. With ALB + ACM, the TLS handshake happens at the ALB. After termination, ALB forwards to the private EC2 target, usually HTTP on port 8080 in this lab.",
  host:
    "app.orbit.dev is the hostname. DNS/Route 53 resolves it to the ALB. ALB host-based rules can route api.orbit.dev and app.orbit.dev to different target groups.",
  path:
    "/cart is the path. In a web app, /cart may return an HTML page. In an API, /api/cart may return JSON. ALB path-based rules can forward /api/* to one service and /admin/* to another.",
  query:
    "?item=book is a query string. It gives extra parameters to the same route. For example /search?q=java keeps the path /search but changes the search input.",
  headers:
    "Headers are request metadata: Host, User-Agent, Accept, Authorization, X-Forwarded-For. ALB adds forwarding headers so the app can know original client IP and protocol.",
  cookies:
    "Cookies are small values the browser sends with future requests. Apps often use them for session ID, login state, preferences, or cart identity. Bad/missing cookies can cause 401/403 behavior.",
};

const coachRunbooks = {
  normal: [
    "Normal baseline:",
    "- Request rate steady: no unusual traffic surge.",
    "- Success rate high: most users receive 2xx/3xx.",
    "- 4xx near zero: clients are using valid paths/auth.",
    "- 5xx near zero: platform/app/dependencies healthy.",
    "- Healthy target count == desired target count.",
    "",
    "Use this baseline before incidents. Good troubleshooting starts by asking: what changed from normal?",
  ],
  "4xx": [
    "4xx runbook: request reached us, but request is wrong or not allowed.",
    "1. Reproduce exact URL and method: GET/POST/PUT/DELETE.",
    "2. Check path: /cart vs /api/cart vs /api/v1/cart.",
    "3. Check auth: missing token/cookie is 401; denied role is 403.",
    "4. Check ALB listener/path rules if only some paths fail.",
    "5. Check client retry behavior for 429.",
    "",
    "Commands:",
    "curl -i http://<alb-dns>/bad-path",
    "aws elbv2 describe-rules --listener-arn <listener-arn>",
    "journalctl -u signalforge.service -n 100 --no-pager",
  ],
  "5xx": [
    "5xx runbook: user reached the platform, but backend/platform failed.",
    "1. Check ALB target health. Zero healthy targets often causes 503.",
    "2. Check app is listening on 8080: ss -lntp | grep 8080.",
    "3. Check systemd: systemctl status signalforge.service --no-pager.",
    "4. Check app logs for stack trace, OOM, DB connection errors.",
    "5. Check recent deployment: wrong artifact, missing env var, bad config.",
    "6. Check DB/RDS if errors mention connection, timeout, or credentials.",
    "",
    "Commands:",
    "aws elbv2 describe-target-health --target-group-arn <target-group-arn>",
    "aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names <asg-name>",
    "journalctl -u signalforge.service -n 100 --no-pager",
    "aws rds describe-db-instances --db-instance-identifier signalforge-dev-postgres",
  ],
  latency: [
    "Latency runbook: request works, but too slowly.",
    "1. Compare p50, p95, p99. If p50 rises, most users are slow. If only p99 rises, a few requests are stuck.",
    "2. Check request rate. More traffic can create queueing.",
    "3. Check CPU > 70% sustained and memory > 80%.",
    "4. Check JVM: GC, heap, thread dump, blocked threads.",
    "5. Check DB: slow query, lock, connection pool exhaustion.",
    "",
    "Commands:",
    "top -H -p $(pgrep -f signalforge-app)",
    "jcmd <pid> Thread.print",
    "jcmd <pid> GC.heap_info",
    "jstat -gc <pid> 1000 5",
  ],
};

const metricsGuide = {
  "request-rate": {
    title: "Request Rate",
    copy:
      "Request rate means how many requests are hitting the app in a time window. Think of it like cars entering a toll gate. More cars are not bad by themselves, but if the road is too small, traffic slows down.",
    actions: [
      "If request rate jumps, first ask: expected traffic or sudden spike?",
      "Check ALB RequestCount in CloudWatch.",
      "If CPU also rises above 70% for several minutes, autoscaling may add instances.",
      "If request rate rises and 5xx rises, capacity or target health may be failing.",
    ],
  },
  "success-rate": {
    title: "Success Rate",
    copy:
      "Success rate means how many requests came back with a good response. 200 means OK. 201 means created. 204 means success with no body. A falling success rate means users are failing.",
    actions: [
      "Above 99% is usually healthy for this lab.",
      "If it drops suddenly, split failures into 4xx and 5xx.",
      "4xx usually means client/auth/path issue.",
      "5xx usually means platform/app/dependency issue.",
    ],
  },
  "fourxx-rate": {
    title: "4xx Error Rate",
    copy:
      "4xx errors mean the request reached the service, but the request itself had a problem. Imagine going to the right building but asking for a room that does not exist, or entering without a badge.",
    actions: [
      "401: no valid identity.",
      "403: identity known, permission denied.",
      "404: path/resource missing.",
      "429: too many requests.",
      "Check ALB listener rules, app routes, auth, and client payload.",
    ],
  },
  "fivexx-rate": {
    title: "5xx Error Rate",
    copy:
      "5xx errors mean the platform or backend failed after the request reached us. This is usually more urgent because users did the right thing but our system failed.",
    actions: [
      "500: application exception.",
      "502: ALB got bad/no valid response from target.",
      "503: no healthy capacity or service unavailable.",
      "504: target took too long.",
      "Check target health, systemd, app logs, port 8080, DB, and recent deploy.",
    ],
  },
  p50: {
    title: "P50 Latency",
    copy:
      "P50 is the middle request. If 100 users request the app, p50 is the 50th fastest/slowest request. It tells you what a normal user feels.",
    actions: [
      "Good baseline: low and stable.",
      "If p50 rises, most users are slow.",
      "Check request rate, CPU, DB, and app logs.",
    ],
  },
  p95: {
    title: "P95 Latency",
    copy:
      "P95 means 95 out of 100 requests were faster than this number, and 5 were slower. This is a common production alert signal because it catches painful user experience before average latency hides it.",
    actions: [
      "Warning example: p95 above 1000 ms.",
      "Check slow endpoints and DB queries.",
      "Check one bad target versus all targets.",
      "Look at JVM GC and thread pool pressure.",
    ],
  },
  p99: {
    title: "P99 Latency",
    copy:
      "P99 is the tail. It shows the worst 1% of users. Even if most users are fine, p99 tells you whether some users are having a terrible experience.",
    actions: [
      "Severe example: p99 above 3000 ms for a web app.",
      "Check timeouts, stuck threads, DB locks, downstream APIs.",
      "Compare p95 and p99: if p99 alone is high, only a few requests are stuck.",
    ],
  },
};

const scenarioGuide = {
  burst: {
    title: "Traffic Burst",
    simple:
      "This is like many people entering a store at the same time. The first number that should move is request rate.",
    expected:
      "Expected: request rate increases. Success rate should stay high if the app has enough capacity.",
    immediate: [
      "Watch Request Rate.",
      "Watch p95 and p99.",
      "If CPU stays above 70%, autoscaling can react.",
      "If 5xx rises, check target health and app logs.",
    ],
    correlation: {
      trigger: "20 API calls",
      numbers: "request rate rises first",
      reason: "more users are entering the service",
      fix: "scale only if latency or errors follow",
    },
  },
  storm: {
    title: "Load Storm",
    simple:
      "This mixes normal traffic, slow requests, and errors. It behaves more like a real incident than a clean single symptom.",
    expected:
      "Expected: request rate rises, success rate drops, 4xx and 5xx separate client problems from backend problems, p95/p99 rise.",
    immediate: [
      "Confirm user impact: success rate and 5xx.",
      "Check ALB TargetResponseTime.",
      "Check target health.",
      "Check app logs and recent deploy.",
    ],
    correlation: {
      trigger: "120 mixed requests",
      numbers: "request rate, 4xx, 5xx, p95/p99",
      reason: "traffic, bad paths, slow work, and backend failures overlap",
      fix: "separate client failures from backend failures first",
    },
  },
  latency: {
    title: "Latency Spike",
    simple:
      "The app still answers, but slowly. Like a restaurant where food arrives, but after a long wait.",
    expected:
      "Expected: p95 and p99 increase. Success rate can remain 100% because slow is not always failed.",
    immediate: [
      "Check p95 and p99.",
      "Check CPU and memory.",
      "Check DB query time and thread pool.",
      "Run: journalctl -u signalforge.service -n 100 --no-pager",
    ],
    correlation: {
      trigger: "slow endpoint",
      numbers: "p95 and p99 rise",
      reason: "requests complete but wait longer in app, JVM, DB, or dependency",
      fix: "find the slowest layer before adding servers",
    },
  },
  cpu: {
    title: "CPU Pressure",
    simple:
      "CPU is the server's thinking power. If it is too busy, requests wait in line.",
    expected:
      "Expected: CPU rises first. If sustained, latency rises. If target tracking sees enough sustained load, ASG may add capacity.",
    immediate: [
      "Run: top",
      "Run: top -H -p $(pgrep -f signalforge-app)",
      "Run: jcmd <pid> Thread.print",
      "Check CloudWatch ASGAverageCPUUtilization.",
    ],
    correlation: {
      trigger: "CPU work loop",
      numbers: "CPU rises, then p95 can rise",
      reason: "server spends more time computing and queues requests",
      fix: "identify hot thread or endpoint, then scale if sustained",
    },
  },
  memory: {
    title: "Memory Pressure",
    simple:
      "Memory is the server's workspace. JVM heap is the Java app's main workspace. If it fills up, garbage collection works harder, and the app can slow or crash.",
    expected:
      "Expected: process memory grows. Later you may see GC pressure, latency, or out-of-memory failures.",
    immediate: [
      "Run: free -m",
      "Run: ps aux --sort=-rss | head",
      "Run: jcmd <pid> GC.heap_info",
      "Run: jstat -gc <pid> 1000 5",
    ],
    correlation: {
      trigger: "retain memory chunks",
      numbers: "memory/GC pressure, later latency or 5xx",
      reason: "JVM heap or process memory has less room to work",
      fix: "check heap, GC, top RSS, then clear leak or restart safely",
    },
  },
  "http_error:401": {
    title: "401 Unauthorized",
    simple:
      "The user did not prove who they are. Like reaching the building door without an ID badge.",
    expected: "Expected: 4xx rate increases. This is usually not an app-server crash.",
    immediate: ["Check token/cookie.", "Check identity provider.", "Check ALB/API auth rule.", "Check app auth logs."],
    correlation: {
      trigger: "missing identity",
      numbers: "4xx rises, 5xx stays normal",
      reason: "the platform rejected the request before app failure",
      fix: "check token, cookie, issuer, audience",
    },
  },
  "http_error:403": {
    title: "403 Forbidden",
    simple:
      "The user may be known, but does not have permission. Like having a badge, but not access to that room.",
    expected: "Expected: 4xx rate increases. Success rate drops for denied requests.",
    immediate: ["Check IAM/RBAC policy.", "Check app role mapping.", "Check WAF/bucket policy if relevant.", "Check audit logs."],
    correlation: {
      trigger: "permission denied",
      numbers: "4xx rises, success drops",
      reason: "identity exists but access is blocked",
      fix: "check RBAC, IAM, WAF, route policy",
    },
  },
  "http_error:404": {
    title: "404 Not Found",
    simple:
      "The path does not exist. Like asking for room 900 in a building that only has 100 rooms.",
    expected: "Expected: 4xx rate increases. Check URL, route, and ALB path rules.",
    immediate: ["Check browser path.", "Check ALB listener rules.", "Check Spring controller route.", "Check deployed artifact version."],
    correlation: {
      trigger: "bad route/path",
      numbers: "4xx rises for one path",
      reason: "URL, ALB path rule, or app route does not match",
      fix: "compare browser path, listener rule, controller mapping",
    },
  },
  "http_error:429": {
    title: "429 Too Many Requests",
    simple:
      "The system is telling the client to slow down. Like a security guard limiting how many people enter per minute.",
    expected: "Expected: 4xx rate increases. Request rate may be high.",
    immediate: ["Check WAF/rate limit.", "Check client retries.", "Check API Gateway usage plan if used.", "Add backoff/retry jitter."],
    correlation: {
      trigger: "too many requests",
      numbers: "request rate and 4xx rise",
      reason: "rate limit protects the service from overload",
      fix: "reduce retries, add backoff, tune limit",
    },
  },
  "http_error:500": {
    title: "500 App Error",
    simple:
      "The app code failed while trying to answer. Like the kitchen dropping the order internally.",
    expected: "Expected: 5xx rate increases. Target can still be healthy if health endpoint works.",
    immediate: ["Check app logs.", "Check stack trace.", "Check recent deploy.", "Check DB/dependency errors."],
    correlation: {
      trigger: "app exception",
      numbers: "5xx rises, health may still pass",
      reason: "business endpoint fails while health endpoint remains OK",
      fix: "open app logs and compare to recent deploy",
    },
  },
  "http_error:502": {
    title: "502 Bad Gateway",
    simple:
      "ALB tried to talk to the app, but did not get a valid answer. Like calling a phone number and hearing broken noise.",
    expected: "Expected: 5xx rate increases. Target may be unhealthy or app may not listen correctly.",
    immediate: ["Check target health.", "Run: ss -lntp | grep 8080", "Check security group ALB -> app :8080.", "Check app crash/restart logs."],
    correlation: {
      trigger: "bad target response",
      numbers: "5xx rises, target health may drop",
      reason: "ALB cannot get a valid response from EC2 app",
      fix: "check listener port, app process, SG, crash logs",
    },
  },
  "http_error:503": {
    title: "503 Service Unavailable",
    simple:
      "There is no usable service capacity. Like all checkout counters are closed.",
    expected: "Expected: 5xx rate increases. If ALB has zero healthy targets, 503 is common.",
    immediate: ["Check HealthyHostCount.", "Check ASG desired/running instances.", "Check health check path.", "Check app startup time."],
    correlation: {
      trigger: "no usable capacity",
      numbers: "5xx rises, healthy targets may be 0",
      reason: "ALB has no safe backend to send traffic to",
      fix: "restore healthy targets or rollback bad deploy",
    },
  },
  "http_error:504": {
    title: "504 Gateway Timeout",
    simple:
      "ALB waited for the app, but the app took too long. Like waiting on hold until the call times out.",
    expected: "Expected: 5xx rate and p95/p99 latency increase.",
    immediate: ["Check ALB idle timeout.", "Check slow app logs.", "Check DB locks/slow queries.", "Check thread pool exhaustion."],
    correlation: {
      trigger: "timeout",
      numbers: "p95/p99 and 5xx rise",
      reason: "ALB waited longer than allowed for target response",
      fix: "check slow DB, thread pool, ALB idle timeout",
    },
  },
};

const journey = {
  browser: {
    layer: "Browser",
    title: "User starts a request",
    copy:
      "The browser creates an HTTP request with method, path, query string, headers, cookies, source IP, and destination host. This is where you start when users say the site is slow or broken: reproduce the URL, capture status code, and compare one user versus many users.",
    protocol: "HTTP/HTTPS",
    port: "80/443",
    metric: "request rate",
    insight:
      "Start here for every incident. If only your laptop fails, debug client/network. If every user fails, move toward ALB, targets, app, and database.",
    commands: [
      "curl -i http://<alb-dns>/",
      "curl -w 'status=%{http_code} time=%{time_total}\\n' -o /dev/null -s http://<alb-dns>/",
      "Browser DevTools -> Network -> Status, TTFB, response headers",
    ],
  },
  dns: {
    layer: "DNS",
    title: "DNS resolves the friendly name",
    copy:
      "When we add Route 53, app.orbit-domain.com will resolve to the ALB DNS name through an alias record. DNS does not send packets to EC2. It only answers: which endpoint should the browser connect to?",
    protocol: "DNS",
    port: "53",
    metric: "resolve time",
    insight:
      "DNS only translates name to endpoint. If DNS is wrong, the request may never reach ALB, so application logs can be empty.",
    commands: [
      "dig app.<domain>",
      "nslookup app.<domain>",
      "aws route53 list-resource-record-sets --hosted-zone-id <zone-id>",
    ],
  },
  alb: {
    layer: "ALB / TLS",
    title: "ALB accepts the client connection",
    copy:
      "With HTTPS, TLS terminates at the ALB using an ACM certificate. That means the browser's encrypted connection ends at ALB. ALB can then inspect host/path rules and open a new HTTP connection to the private EC2 target on port 8080.",
    protocol: "HTTPS -> HTTP",
    port: "443 -> 8080",
    metric: "ELB 5xx + latency",
    insight:
      "ALB is the front door. A listener accepts traffic on a port, then rules decide where to forward by host or path.",
    commands: [
      "aws elbv2 describe-listeners --load-balancer-arn <alb-arn>",
      "aws elbv2 describe-rules --listener-arn <listener-arn>",
      "aws cloudwatch get-metric-statistics --namespace AWS/ApplicationELB --metric-name HTTPCode_ELB_5XX_Count ...",
    ],
  },
  target: {
    layer: "Target Group",
    title: "ALB chooses a healthy target",
    copy:
      "The target group is ALB's backend pool. It only sends traffic to targets passing health checks. If healthy target count becomes 0, users commonly see 503. If a target accepts connection but sends a bad response, users may see 502.",
    protocol: "HTTP health check",
    port: "8080",
    metric: "healthy targets",
    insight:
      "Target health is ALB's confidence score. If targets are unhealthy, scaling more broken instances does not fix the user path.",
    commands: [
      "aws elbv2 describe-target-health --target-group-arn <target-group-arn>",
      "curl -i http://<instance-private-ip>:8080/actuator/health",
      "Check target group health check path: /actuator/health",
    ],
  },
  app: {
    layer: "Private EC2",
    title: "Spring Boot handles the request",
    copy:
      "The app runs on private EC2 instances and listens on port 8080. The app security group should allow inbound 8080 only from the ALB security group. Here you troubleshoot 500s, JVM memory, CPU, thread pool, logs, and systemd service state.",
    protocol: "HTTP",
    port: "8080",
    metric: "CPU, memory, logs",
    insight:
      "On EC2, troubleshoot in layers: process listening, service state, logs, JVM heap/thread state, then dependencies.",
    commands: [
      "systemctl status signalforge.service --no-pager",
      "journalctl -u signalforge.service -n 100 --no-pager",
      "ss -lntp | grep 8080",
      "top -H -p $(pgrep -f signalforge-app)",
      "jcmd <pid> Thread.print",
    ],
  },
  db: {
    layer: "RDS PostgreSQL",
    title: "App calls the private database",
    copy:
      "Database traffic is app-to-RDS inside private subnets. The browser never talks to the database. The DB security group should allow PostgreSQL 5432 only from the app security group. Slow DB calls usually appear as higher p95/p99 latency before they appear as 5xx.",
    protocol: "PostgreSQL",
    port: "5432",
    metric: "DB latency",
    insight:
      "The browser never talks to RDS. If DB is slow, the user sees app latency or 5xx because the app is waiting on the database.",
    commands: [
      "aws rds describe-db-instances --db-instance-identifier signalforge-dev-postgres",
      "aws secretsmanager get-secret-value --secret-id <db-secret-arn>",
      "psql -h <rds-endpoint> -U <user> -d <db>",
    ],
  },
  response: {
    layer: "Response path",
    title: "Response returns through the same front door",
    copy:
      "The app returns HTTP status, headers, and body to ALB. ALB returns that response to the browser over the existing client connection. For interview explanation: request and response are two directions of the same conversation.",
    protocol: "HTTP response",
    port: "8080 -> 443",
    metric: "status + latency",
    insight:
      "A response includes status, headers, and body. Status tells outcome; latency tells experience; headers reveal routing and cache clues.",
    commands: [
      "curl -i http://<alb-dns>/api/signals",
      "curl -w 'status=%{http_code} ttfb=%{time_starttransfer} total=%{time_total}\\n' -o /dev/null -s http://<alb-dns>/",
    ],
  },
  nat: {
    layer: "NAT Gateway",
    title: "NAT is outbound, not user inbound",
    copy:
      "NAT Gateway is not in the browser-to-ALB-to-EC2 path. It lets private EC2 instances initiate outbound internet connections for package installs, OS updates, or external APIs. Internet clients cannot use NAT to enter private subnets.",
    protocol: "Outbound TCP",
    port: "ephemeral",
    metric: "NAT bytes/errors",
    insight:
      "NAT is not for users entering the app. It is for private instances going out for updates, package downloads, or external APIs.",
    commands: [
      "ip route",
      "curl -I https://repo.maven.apache.org",
      "aws cloudwatch get-metric-statistics --namespace AWS/NATGateway --metric-name ErrorPortAllocation ...",
    ],
  },
};

const playbook = {
  latency:
    "Latency means the request is completing, but too slowly. First compare p50, p95, and p99. If only p99 is high, a small set of users are suffering. Check app thread pool, CPU, JVM GC, DB query time, downstream APIs, and whether one target is slower than the others.",
  "http_error:401":
    "401 means the request did not prove identity. In production, check missing token, expired token, wrong audience/issuer, broken identity provider, or an ALB/API Gateway authentication rule rejecting the request.",
  "http_error:403":
    "403 means identity may be known, but authorization denied. Check IAM policy, app RBAC, security middleware, WAF rules, S3 bucket policy, or route-level permission checks.",
  "http_error:404":
    "404 means the path or resource was not found. Check browser path, ALB host/path listener rule, application route mapping, API version, and whether the deployment actually contains that endpoint.",
  "http_error:429":
    "429 means the client is being throttled. Check rate-limit policy, WAF rule, API Gateway usage plan, client retry behavior, and whether retries are amplifying load.",
  "http_error:500":
    "500 means the application returned an unhandled server failure. Check application logs first, then stack trace, recent deploy, configuration, null values, DB errors, and dependency failures.",
  "http_error:502":
    "502 usually means the ALB reached toward the target but did not get a valid HTTP response. Common causes: backend not listening on the target port, app crashed mid-request, security group blocks ALB to EC2, target sends malformed response, TLS mismatch, or connection reset.",
  "http_error:503":
    "503 usually means service unavailable or no usable capacity. In ALB terms, check whether the target group has healthy targets. Then check ASG desired capacity, instance boot, health check path, app startup time, and dependency outage.",
  "http_error:504":
    "504 means the gateway waited too long for the target. Check ALB idle timeout, app response time, DB query time, thread pool exhaustion, connection pool starvation, and downstream API latency.",
  cpu:
    "CPU pressure appears as higher latency, saturation, and possible scaling. Check CloudWatch CPU, top, process CPU, Java thread dumps, hot endpoints, GC behavior, and whether ASG target tracking has enough sustained signal to scale.",
  memory:
    "Memory pressure can become GC pressure or OOM. Check process RSS, JVM heap, non-heap, thread count, GC logs, jcmd, jstat, heap dump, and CloudWatch memory once the agent is installed.",
  burst:
    "A traffic burst should raise request rate first. If p95 also rises, the app or dependency is saturating. If errors rise, capacity or target health is failing. This is the first step toward autoscaling experiments.",
  storm:
    "A load storm mixes good requests with latency and errors. Read it like an incident: request rate rises, p95/p99 can rise, 4xx/5xx may separate client problems from backend problems, then you inspect target health and app logs.",
};

const thresholds = {
  "http_error:500": "500: app threw an unhandled exception. Any sudden spike above 1% is production-relevant.",
  "http_error:502": "502: ALB/proxy did not get a valid response from target. Check app listener, SG, crash, timeout reset.",
  "http_error:503": "503: no healthy capacity or service unavailable. HealthyHostCount == 0 is the classic ALB signal.",
  "http_error:504": "504: gateway timeout. ALB waited too long; compare target response time and app/DB latency.",
  latency: "Latency: p95 above 1000 ms is a user-visible warning; p99 above 3000 ms is severe for most web apps.",
  cpu: "CPU: above 70% sustained can trigger ASG target tracking; above 85-90% risks queueing and timeouts.",
  memory: "Memory: above 80% used or rising JVM heap after GC suggests pressure; OOM kills can become 502/503.",
  storm: "Storm: watch request rate first, then p95/p99, then 4xx/5xx split, then healthy targets.",
  burst: "Burst: request rate should rise immediately; autoscaling needs sustained CPU/load, not one tiny spike.",
};

const layerByKey = {
  latency: "app",
  "http_error:401": "alb",
  "http_error:403": "alb",
  "http_error:404": "alb",
  "http_error:429": "alb",
  "http_error:500": "app",
  "http_error:502": "target",
  "http_error:503": "target",
  "http_error:504": "app",
  cpu: "app",
  memory: "app",
  burst: "alb",
  storm: "alb",
};

const metricHistory = [];
let activeScenarioKey = null;

if (location.protocol === "file:") {
  elements.launchWarning.hidden = false;
}

async function fetchJson(path) {
  try {
    const response = await fetch(path, { headers: { Accept: "application/json" } });
    const body = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, body };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      body: {
        error: "API not reachable",
        reason:
          location.protocol === "file:"
            ? "You opened index.html directly. Use http://localhost:8080/ or the ALB URL."
            : error.message,
      },
    };
  }
}

function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`;
}

function formatMs(value) {
  return `${value} ms`;
}

function statusClass(status) {
  if (status >= 500) return "bad";
  if (status >= 400) return "warn";
  return "ok";
}

async function refreshSnapshot() {
  const { ok, body } = await fetchJson("/api/ops/snapshot");

  if (!ok) {
    elements.runtimeHealth.textContent = "degraded";
    return;
  }

  elements.runtimeHealth.textContent = "healthy";
  elements.runtimePort.textContent = body.listeningPort;
  elements.targetCount.textContent = `${body.healthyTargets}/${body.expectedTargets}`;
  elements.requestRate.textContent = `${body.requestRatePerMinute}/min`;
  elements.successRate.textContent = formatPercent(body.successRatePercent);
  elements.fourxxRate.textContent = formatPercent(body.http4xxRatePercent);
  elements.fivexxRate.textContent = formatPercent(body.http5xxRatePercent);
  elements.p50.textContent = formatMs(body.p50Ms);
  elements.p95.textContent = formatMs(body.p95Ms);
  elements.p99.textContent = formatMs(body.p99Ms);
  elements.windowLabel.textContent = `${body.windowSeconds}s rolling window`;

  if (!activeScenarioKey) {
    updateCoach(body);
  }
  renderEvents(body.recentEvents ?? []);
  recordHistory(body);
  renderChart();
}

function updateCoach(snapshot) {
  if (snapshot.http5xxRatePercent > 0) {
    elements.coachTitle.textContent = "Server-side failure signal";
    elements.coachCopy.textContent =
      "5xx means the client reached the platform, but something behind the entry point failed. Start at ALB target health, then systemd service, app logs, JVM, DB connectivity, and recent deployment.";
    setCoachFlow("5xx observed", "5xx rate, p95/p99, target health", "backend/platform failed after entry", "target health -> app logs -> DB");
    elements.coachRunbook.textContent = coachRunbooks["5xx"].join("\n");
    return;
  }

  if (snapshot.http4xxRatePercent > 0) {
    elements.coachTitle.textContent = "Client or routing issue";
    elements.coachCopy.textContent =
      "4xx usually points to invalid path, payload, permissions, or listener rule mismatch. Compare browser path, ALB host/path rule, and application route.";
    setCoachFlow("4xx observed", "4xx rate, affected path", "client/auth/routing problem", "URL -> auth -> ALB rule -> app route");
    elements.coachRunbook.textContent = coachRunbooks["4xx"].join("\n");
    return;
  }

  if (snapshot.p95Ms > 1000) {
    elements.coachTitle.textContent = "Tail latency detected";
    elements.coachCopy.textContent =
      "P95/P99 rising means a minority of users are slow. Check request rate, CPU, memory, thread pool, database wait, and whether one target is unhealthy or overloaded.";
    setCoachFlow("latency observed", "p95/p99, request rate, CPU", "work is queueing or waiting", "app threads -> JVM -> DB -> dependency");
    elements.coachRunbook.textContent = coachRunbooks.latency.join("\n");
    return;
  }

  elements.coachTitle.textContent = "Normal baseline";
  elements.coachCopy.textContent =
    "Use this as your calm-state reference. In interviews, compare incident behavior against baseline before jumping to a fix.";
  setCoachFlow("baseline", "request rate, success, p95", "normal behavior is your comparison point", "observe before changing");
  elements.coachRunbook.textContent = coachRunbooks.normal.join("\n");
}

function setCoachFlow(trigger, numbers, reason, fix) {
  elements.coachTrigger.textContent = trigger;
  elements.coachNumbers.textContent = numbers;
  elements.coachReason.textContent = reason;
  elements.coachFix.textContent = fix;
}

function renderEvents(events) {
  if (!events.length) {
    elements.eventStream.innerHTML =
      '<div class="event-row"><span>-</span><span>No requests observed yet</span><span>-</span><span>-</span></div>';
    return;
  }

  elements.eventStream.innerHTML = events
    .slice()
    .reverse()
    .map(
      (event) => `
        <div class="event-row">
          <span>${new Date(event.timestamp).toLocaleTimeString()}</span>
          <span>${event.path}</span>
          <span class="${statusClass(event.status)}">HTTP ${event.status}</span>
          <span>${event.latencyMs} ms</span>
        </div>
      `,
    )
    .join("");
}

function setDiagnosis(kind, payload) {
  const key =
    payload?.simulated === "http_error"
      ? `${payload.simulated}:${payload.status}`
      : payload?.simulated || kind;
  const guide = scenarioGuide[key] ?? scenarioGuide[kind];

  elements.diagnosisTitle.textContent = guide?.title ?? key.replace("http_error", "HTTP error");
  elements.diagnosisCopy.textContent = guide?.simple ?? playbook[key] ?? playbook[kind] ?? playbook.burst;
  elements.simulationOutput.textContent = JSON.stringify({
    observed: payload,
    thresholdToRemember: thresholds[key] ?? thresholds[kind] ?? "Error budget thinking: alert on sustained impact, not one isolated request.",
    expectedMetricMovement: guide?.expected ?? "Watch which number moves first, then connect it to the affected layer.",
    explainLikeNew: guide?.simple ?? playbook[key] ?? playbook[kind] ?? playbook.burst,
    howToExplainInInterview: playbook[key] ?? playbook[kind] ?? playbook.burst,
    whatShouldICheckImmediately: guide?.immediate ?? commandsFor(key),
    firstCommandsToRun: commandsFor(key),
  }, null, 2);
  highlightLayer(layerByKey[key] ?? layerByKey[kind] ?? "app");
  showScenarioGuide(guide, key);
  updateCurrentDrill(guide, key);
  setActiveDrill(key);
}

function selectJourneyStep(stepName) {
  const step = journey[stepName];
  if (!step) {
    return;
  }

  document.querySelectorAll(".route-node").forEach((node) => {
    node.classList.toggle("active", node.dataset.step === stepName);
  });

  elements.journeyLayer.textContent = step.layer;
  elements.journeyTitle.textContent = step.title;
  elements.journeyCopy.textContent = step.copy;
  elements.journeyProtocol.textContent = step.protocol;
  elements.journeyPort.textContent = step.port;
  elements.journeyMetric.textContent = step.metric;
  elements.journeyCommands.textContent = step.commands.join("\n");
  elements.journeyInsight.textContent = step.insight;
  highlightLayer(stepName === "browser" ? "alb" : stepName);
}

async function runSimulation(path) {
  elements.simulationOutput.textContent = `Calling ${path} ...`;
  const { status, body } = await fetchJson(path);
  const fallback = scenarioFromPath(path);
  const payload = body.simulated
    ? { ...body, observedHttpStatus: status }
    : { ...fallback.payload, observedHttpStatus: status, apiReachable: false, reason: body.reason ?? body.error };
  setDiagnosis(body.simulated ?? fallback.kind, payload);
  await refreshSnapshot();
}

async function runBurst() {
  elements.simulationOutput.textContent = "Sending 20 API requests ...";

  const calls = Array.from({ length: 20 }, () => fetchJson("/api/signals"));
  const results = await Promise.all(calls);

  setDiagnosis("burst", {
    simulated: "burst",
    requestsSent: results.length,
    successfulResponses: results.filter((result) => result.ok).length,
  });
  await refreshSnapshot();
}

async function runStorm() {
  elements.simulationOutput.textContent = "Sending 120 mixed requests ...";
  const paths = [
    "/api/signals",
    "/api/incidents",
    "/simulate/latency?ms=350",
    "/simulate/error?status=404",
    "/simulate/error?status=502",
    "/simulate/error?status=504",
  ];
  const calls = Array.from({ length: 120 }, (_, index) => fetchJson(paths[index % paths.length]));
  const results = await Promise.all(calls);

  setDiagnosis("storm", {
    simulated: "storm",
    requestsSent: results.length,
    successfulResponses: results.filter((result) => result.ok).length,
    failedResponses: results.filter((result) => !result.ok).length,
  });
  await refreshSnapshot();
}

function scenarioFromPath(path) {
  if (path.includes("/latency")) {
    return { kind: "latency", payload: { simulated: "latency", requestedMs: 1800 } };
  }

  if (path.includes("/cpu")) {
    return { kind: "cpu", payload: { simulated: "cpu", seconds: 6 } };
  }

  if (path.includes("/memory/clear")) {
    return { kind: "memory", payload: { simulated: "memory", action: "clear retained chunks" } };
  }

  if (path.includes("/memory")) {
    return { kind: "memory", payload: { simulated: "memory", allocatedMb: 96 } };
  }

  const statusMatch = path.match(/status=(\d+)/);
  if (statusMatch) {
    const status = Number(statusMatch[1]);
    return { kind: `http_error:${status}`, payload: { simulated: "http_error", status } };
  }

  return { kind: "request", payload: { simulated: "request" } };
}

function showMetricGuide(metricName) {
  const guide = metricsGuide[metricName];
  if (!guide) {
    return;
  }

  document.querySelectorAll(".signal").forEach((card) => {
    card.classList.toggle("active", card.dataset.metric === metricName);
  });

  elements.metricTitle.textContent = guide.title;
  elements.metricCopy.textContent = guide.copy;
  elements.metricActions.textContent = guide.actions.join("\n");
}

function showScenarioGuide(guide, key) {
  if (!guide) {
    return;
  }

  elements.metricTitle.textContent = guide.title;
  elements.metricCopy.textContent = `${guide.simple} ${guide.expected}`;
  elements.metricActions.textContent = guide.immediate.join("\n");
  document.querySelectorAll(".signal").forEach((card) => {
    card.classList.toggle("active", key.includes(card.dataset.metric));
  });
}

function updateCurrentDrill(guide, key) {
  const firstCheck = guide?.immediate?.[0] ?? commandsFor(key)[0];
  elements.currentDrill.textContent = guide?.title ?? key;
  elements.currentMovement.textContent = guide?.expected ?? thresholds[key] ?? "Watch the first metric that moves.";
  elements.currentLayer.textContent = layerByKey[key] ?? "app";
  elements.currentCheck.textContent = firstCheck;
  document.body.dataset.severity = severityFor(key);
  updateCoachForScenario(guide, key);
}

function updateCoachForScenario(guide, key) {
  const correlation = guide?.correlation;
  if (!correlation) {
    return;
  }

  activeScenarioKey = key;
  elements.coachTitle.textContent = `Coach: ${guide.title}`;
  elements.coachCopy.textContent = `${guide.simple} ${guide.expected}`;
  setCoachFlow(correlation.trigger, correlation.numbers, correlation.reason, correlation.fix);
  elements.coachRunbook.textContent = [
    "How to read this drill:",
    `1. Trigger: ${correlation.trigger}`,
    `2. Watch: ${correlation.numbers}`,
    `3. Why: ${correlation.reason}`,
    `4. First fix path: ${correlation.fix}`,
    "",
    "Immediate checks:",
    ...(guide.immediate ?? commandsFor(key)).map((item) => `- ${item}`),
    "",
    `Interview line: ${playbook[key] ?? playbook.burst}`,
  ].join("\n");
}

function setActiveDrill(key) {
  document.querySelectorAll(".drills button").forEach((button) => {
    const actionKey = button.dataset.action;
    const simKey = button.dataset.sim ? scenarioFromPath(button.dataset.sim).kind : actionKey;
    button.classList.toggle("active", simKey === key || actionKey === key);
  });
}

function severityFor(key) {
  if (key.includes("502") || key.includes("503") || key.includes("504") || key.includes("500")) {
    return "danger";
  }

  if (key.includes("401") || key.includes("403") || key.includes("404") || key.includes("429")) {
    return "warning";
  }

  if (key === "latency" || key === "cpu" || key === "memory" || key === "storm") {
    return "pressure";
  }

  return "normal";
}

function toggleTheme() {
  const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
  document.body.dataset.theme = nextTheme;
  elements.themeToggle.textContent = nextTheme === "light" ? "Dark" : "Light";
  localStorage.setItem("orbit-theme", nextTheme);
}

function showUrlPart(partName) {
  elements.urlPartCopy.textContent = urlPartGuide[partName] ?? "Click another URL part.";

  document.querySelectorAll("[data-urlpart]").forEach((button) => {
    button.classList.toggle("active", button.dataset.urlpart === partName);
  });
}

function commandsFor(key) {
  const common = [
    "curl -i http://<alb-dns>/actuator/health",
    "aws elbv2 describe-target-health --target-group-arn <target-group-arn>",
    "aws ssm start-session --target <instance-id>",
    "systemctl status signalforge.service --no-pager",
    "journalctl -u signalforge.service -n 100 --no-pager",
  ];

  if (key === "cpu") {
    return [...common, "top -H -p $(pgrep -f signalforge-app)", "jcmd <pid> Thread.print"];
  }

  if (key === "memory") {
    return [...common, "free -m", "ps aux --sort=-rss | head", "jcmd <pid> GC.heap_info", "jstat -gc <pid> 1000 5"];
  }

  if (key === "http_error:502" || key === "http_error:503" || key === "http_error:504") {
    return [...common, "ss -lntp | grep 8080", "curl -i http://localhost:8080/actuator/health"];
  }

  return common;
}

function highlightLayer(layerName) {
  document.querySelectorAll(".layer").forEach((layer) => {
    layer.classList.toggle("active", layer.dataset.layer === layerName);
  });
  elements.activeLayer.textContent = layerName;
}

function recordHistory(snapshot) {
  metricHistory.push({
    requestRate: Number(snapshot.requestRatePerMinute) || 0,
    p95: Number(snapshot.p95Ms) || 0,
    p99: Number(snapshot.p99Ms) || 0,
  });

  while (metricHistory.length > 24) {
    metricHistory.shift();
  }
}

function renderChart() {
  if (!metricHistory.length) {
    elements.metricChart.innerHTML = '<span class="empty-chart">Waiting for requests</span>';
    return;
  }

  const maxValue = Math.max(...metricHistory.flatMap((point) => [point.requestRate * 20, point.p95, point.p99, 1]));
  elements.metricChart.innerHTML = metricHistory
    .map((point) => {
      const rateHeight = Math.max(4, (point.requestRate * 20 / maxValue) * 100);
      const p95Height = Math.max(4, (point.p95 / maxValue) * 100);
      const p99Height = Math.max(4, (point.p99 / maxValue) * 100);
      return `
        <div class="chart-sample">
          <i class="bar rate" style="height:${rateHeight}%"></i>
          <i class="bar p95" style="height:${p95Height}%"></i>
          <i class="bar p99" style="height:${p99Height}%"></i>
        </div>
      `;
    })
    .join("");
}

document.querySelectorAll("[data-sim]").forEach((button) => {
  button.addEventListener("click", () => runSimulation(button.dataset.sim));
});

document.querySelector('[data-action="burst"]').addEventListener("click", runBurst);
document.querySelector('[data-action="storm"]').addEventListener("click", runStorm);
document.querySelector("#refresh-button").addEventListener("click", refreshSnapshot);
document.querySelectorAll(".route-node").forEach((node) => {
  node.addEventListener("click", () => selectJourneyStep(node.dataset.step));
});
document.querySelectorAll(".signal").forEach((card) => {
  card.addEventListener("click", () => showMetricGuide(card.dataset.metric));
});
document.querySelectorAll("[data-urlpart]").forEach((button) => {
  button.addEventListener("click", () => showUrlPart(button.dataset.urlpart));
});
elements.themeToggle.addEventListener("click", toggleTheme);

document.body.dataset.theme = "light";
elements.themeToggle.textContent = document.body.dataset.theme === "light" ? "Dark" : "Light";
selectJourneyStep("browser");
showUrlPart("path");
showMetricGuide("request-rate");
refreshSnapshot();
setInterval(refreshSnapshot, 5000);
