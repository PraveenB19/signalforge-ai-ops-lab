# SignalForge Java Application

This is the Spring Boot application for the SignalForge AI Ops Lab.

## Runtime Choice

This app targets **Java 21 LTS**.

Why Java 21:

- Java 21 is a modern LTS release.
- It is widely adopted in enterprise Java platforms.
- It is safer for a beginner production-style lab than using the newest LTS immediately.
- Java 25 LTS is a good future upgrade path once the basic CI/CD and AWS deployment flow is working.

Interview explanation:

```text
We selected Java 21 LTS because it balances modern runtime support, enterprise adoption, and ecosystem compatibility. Java 25 LTS is newer, but Java 21 is still a strong production baseline for this lab.
```

## What It Does

The app has normal endpoints and simulation endpoints.

Normal endpoints:

```text
GET /health
GET /api/signals
GET /api/incidents
```

Simulation endpoints:

```text
GET /simulate/cpu?seconds=10
GET /simulate/memory?mb=128
GET /simulate/latency?ms=2000
GET /simulate/error?status=502
GET /simulate/error?status=503
```

## Why These Endpoints Exist

They let us create production-style issues on purpose:

- CPU pressure
- Memory pressure
- High latency
- 502/503 style failures
- Error-rate spikes

Then we can observe CloudWatch metrics, ALB health, logs, alerts, and AI incident summaries.

## Run Locally

```bash
mvn spring-boot:run
```

## Build

```bash
mvn clean package
```

Command explanation:

```text
mvn:
  Runs Maven.

clean:
  Deletes previous build output under target/.

package:
  Compiles, tests, and packages the app into a JAR.
```
