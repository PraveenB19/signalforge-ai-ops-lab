# Two-Day Execution Plan

The goal is to finish a presentable, hands-on version in two days without turning it into a never-ending platform project.

## Day 1: Build and Deploy

### Phase 1: Repository and Learning Foundation

Deliverables:

- Repo structure
- README
- Architecture notes
- Interview notes
- Branching strategy

Learning outcome:

```text
You can explain what the project does, why it is modern, and how it differs from a basic three-tier tutorial.
```

### Phase 2: Java Application

Deliverables:

- Spring Boot app
- Health endpoint
- Simple API endpoint
- Failure simulation endpoints
- Unit tests

Learning outcome:

```text
You can explain how a Java app is built, tested, packaged as a JAR, and run on a Linux server.
```

### Phase 3: GitHub Actions CI

Deliverables:

- Build workflow
- Unit test step
- Artifact upload
- SonarCloud scan
- Trivy scan

Learning outcome:

```text
You understand name, on, jobs, steps, uses, run, needs, env, secrets, permissions, artifacts, and environments.
```

### Phase 4: Terraform Foundation

Deliverables:

- Terraform backend
- S3 state bucket
- S3 lockfile
- VPC
- Public/private subnets
- ALB
- EC2
- Security groups

Learning outcome:

```text
You can explain provider, resource, data, variable, output, locals, modules, backend, state, locking, and drift.
```

### Phase 5: First Deployment

Deliverables:

- App deployed on EC2
- systemd service
- ALB health check
- Browser access through ALB DNS

Learning outcome:

```text
You can explain how traffic flows from browser to ALB to EC2 to database and back.
```

## Day 2: Operate, Break, Diagnose, Recover

### Phase 6: Observability

Deliverables:

- CloudWatch Agent
- App logs
- ALB metrics
- EC2 CPU/memory/disk metrics
- Dashboard

Learning outcome:

```text
You understand latency, traffic, errors, saturation, P95, P99, 5xx, unhealthy hosts, CPU, memory, and disk pressure.
```

### Phase 7: Alerting

Deliverables:

- CloudWatch alarms
- SNS topic
- Slack alert integration
- Optional PagerDuty integration

Learning outcome:

```text
You can explain how production alerts should be actionable, not noisy.
```

### Phase 8: Incident Simulation

Deliverables:

- Simulate 502
- Simulate 503
- Simulate high latency
- Simulate CPU pressure
- Simulate memory pressure
- Simulate disk full
- Simulate security group misconfiguration
- Simulate no NAT Gateway behavior

Learning outcome:

```text
You can troubleshoot scenario-based interview questions using commands and metrics.
```

### Phase 9: AI-Assisted Operations

Deliverables:

- Script or workflow that summarizes incident data
- AI-generated probable root cause
- AI-generated next-step runbook
- Slack-ready incident summary

Learning outcome:

```text
You can explain where AI reduces manual toil without replacing engineering judgment.
```

### Phase 10: Portfolio Finish

Deliverables:

- Architecture diagram
- LinkedIn post
- Final README
- Interview cheat sheet

Learning outcome:

```text
You can confidently explain the project as a production operations lab.
```

