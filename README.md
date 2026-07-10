# SignalForge AI Ops Lab

SignalForge AI Ops Lab is a hands-on DevOps and reliability engineering project for deploying a Java application on AWS with GitHub Actions, Terraform, security scanning, observability, incident simulation, and AI-assisted troubleshooting.

Start here before interviews:

[SignalForge Interview Runbook](docs/00-start-here-interview-runbook.md)

Documentation standard:

[How SignalForge Docs Are Written](docs/00-documentation-standard.md)

Learning map:

[How To Memorize The Project Flow](docs/00-learning-map.md)

Visual learning pack:

[SignalForge Visual Learning Pack](docs/visuals/README.md)

This is not only a "three-tier app on AWS" project. The goal is to learn how modern teams build, deploy, secure, monitor, break, diagnose, and recover production-style systems.

The lab is also designed to be disposable:

```text
Create infrastructure in the morning
Practice deployments and incidents
Destroy resources at the end of the day
Recreate the same environment from GitHub Actions the next day
Continue from Git history, Terraform code, artifacts, and documentation
```

## What This Project Builds

The first version deploys a Java Spring Boot application into a secure AWS architecture:

```text
User
  -> Route 53 / optional custom domain
  -> Application Load Balancer in public subnets
  -> Java application on EC2 in private subnets
  -> RDS database in private DB subnets
```

Supporting platform:

```text
GitHub Actions
  -> OIDC authentication to AWS
  -> Terraform plan/apply
  -> Java build and test
  -> SonarQube quality gate
  -> Trivy security scanning
  -> artifact promotion
  -> EC2 deployment
  -> CloudWatch metrics/logs/alarms
  -> Slack or PagerDuty alerts
  -> AI-assisted incident summaries
```

## Why This Project Is Useful

This repo is designed for DevOps, SRE, cloud, and platform engineering interview preparation. It teaches both implementation and operations:

- GitHub Actions from scratch
- Secure AWS access using OIDC instead of long-lived access keys
- Terraform remote state, state locking, drift detection, and environment promotion
- Java artifact build, scan, storage, promotion, and deployment
- EC2 runtime troubleshooting with Linux and JVM commands
- CloudWatch dashboards, alarms, logs, and production-style metrics
- 502, 503, latency, CPU, memory, disk, and database failure simulations
- Security controls across IAM, network, secrets, artifacts, and supply chain
- AI-assisted root-cause analysis and incident runbook generation
- Beginner-friendly explanations of command flags, Terraform syntax, AWS terms, and production incident language

## Application Idea

The application is called **SignalForge**.

SignalForge is a small reliability simulation platform. It exposes normal business APIs plus controlled failure endpoints that help engineers practice real production troubleshooting.

Example endpoints:

```text
/health
/api/signals
/api/incidents
/simulate/cpu
/simulate/memory
/simulate/latency
/simulate/502
/simulate/503
```

This makes the app useful for learning because we can intentionally create issues, observe metrics, receive alerts, and practice recovery.

## Artifact Strategy

To keep this project mostly free outside AWS:

- First stage: use **GitHub Actions artifacts** for build outputs.
- AWS deployment stage: optionally copy the tested JAR to **S3 artifact storage**.
- We are not starting with paid JFrog Artifactory or Nexus.
- Later advanced stage: compare GitHub Packages, Amazon S3, Amazon ECR, Nexus, and JFrog Artifactory.

Important deployment rule:

> Build once, test once, scan once, then deploy the exact same artifact across environments.

## Repository Structure

```text
signalforge-ai-ops-lab/
  app/
    README.md
  infra/
    README.md
    envs/
      dev/
      stage/
      prod/
    modules/
  .github/
    workflows/
  docs/
    00-documentation-standard.md
    00-learning-map.md
    00-start-here-interview-runbook.md
    00-manual-prerequisites.md
    01-two-day-execution-plan.md
    02-architecture.md
    03-github-actions-learning-path.md
    04-terraform-operations.md
    05-interview-troubleshooting-notes.md
    06-linkedin-project-story.md
    07-domain-and-branding.md
    08-disposable-lab-operations.md
    09-scenario-catalog.md
    10-local-toolchain.md
    11-github-actions-ci.md
    12-java-maven-pom-artifacts.md
    13-quality-gates-and-ci-security.md
    14-ci-interview-answer.md
    15-aws-oidc-terraform-bootstrap.md
    16-oidc-explained-human-version.md
    17-terraform-enterprise-runbook.md
    18-aws-network-flow.md
    19-cicd-troubleshooting-runbook.md
    visuals/
      README.md
      signalforge-system-stack.svg
      java-linux-memory-map.svg
      network-connectivity-map.svg
      ci-quality-security-gates.svg
      local-toolchain-path-map.svg
      github-oidc-aws-flow.svg
      terraform-state-drift-map.svg
```

## Manual Work Required From You

You will need to create or confirm:

1. GitHub account and repository
2. AWS account with billing alert enabled
3. AWS IAM admin access for initial setup
4. SonarCloud account or SonarQube setup
5. Slack workspace or PagerDuty account for alerts
6. Optional domain name
7. Optional OpenAI or Anthropic API key for AI incident summaries

Details are in [manual prerequisites](docs/00-manual-prerequisites.md).

## Two-Day Goal

Day 1:

- Create repo and documentation
- Build Java app skeleton
- Add GitHub Actions CI
- Add test, artifact, SonarQube, and Trivy stages
- Create Terraform backend
- Create AWS VPC, ALB, EC2, security groups, and initial deployment

Day 2:

- Add CloudWatch Agent and dashboards
- Add Slack/PagerDuty alerts
- Add Terraform drift detection
- Simulate 502, 503, latency, CPU, memory, and disk issues
- Add AI-assisted incident summary
- Finalize README, architecture diagram, and LinkedIn post

## Current Status

Current checkpoint:

```text
Implemented:
  Java 21 Spring Boot Orbit scenario trainer.
  GitHub Actions CI with Maven, JUnit, JaCoCo, SonarCloud, and Trivy.
  GitHub OIDC authentication to AWS without long-lived AWS access keys.
  Terraform modules for VPC, ALB, private EC2 Auto Scaling, RDS,
  security groups, artifacts, IAM, and observability.
  S3 artifact deployment through SSM and systemd.
  CloudWatch dashboard, ALB/target/CPU/memory/disk alarms, VPC Flow Logs,
  application logs, and JVM GC logs.

Next learning milestone:
  Deploy the dev environment, establish a healthy baseline, and run one
  controlled incident at a time: application 5xx, latency, CPU, memory,
  unhealthy targets, and Terraform/network drift.

Next platform milestones:
  1. Deliver CloudWatch alarms to Slack.
  2. Connect the Java application to RDS using Secrets Manager.
  3. Add an advisory-only AI incident analyst.
  4. Add a domain, Route 53 alias record, ACM certificate, and HTTPS listener.
```

## Resume Here

Use these documents in this order:

```text
1. docs/27-master-interview-and-simulation-guide.md
   The single learning sequence: deploy, observe, simulate, recover, explain.

2. docs/20-end-to-end-dev-test-runbook.md
   The hands-on AWS console, ALB, Session Manager, systemd, and deployment steps.

3. docs/09-scenario-catalog.md
   The incident menu: symptoms, metrics, commands, mitigation, and permanent fixes.
```

Do not add Route 53, CloudFront, or AI automation before completing at least a
few baseline-and-recovery drills. Observability evidence makes later portfolio
claims real and gives the AI analyst useful inputs.

## Remaining Costs And Scope

```text
Slack:
  Free workspace is enough for the lab. We will connect CloudWatch alarms using
  SNS and Amazon Q in chat applications.

RDS-backed application:
  The current RDS instance already costs while it is running. Adding JDBC/JPA,
  a small schema, and Secrets Manager retrieval does not create a second RDS
  charge, but it may add modest Secrets Manager and API-call costs. The database
  remains the main cost driver. Destroy the dev environment when not practicing.

AI incident analyst:
  Optional and intentionally advisory-only at first. It will use a small Lambda
  function, CloudWatch/ALB evidence, a secret-held API key, and an OpenAI or
  Anthropic API. Both Lambda and model calls can incur usage-based costs.

Domain / Route 53:
  Optional for testing. A domain has annual registrar cost; a Route 53 hosted
  zone has a monthly cost. Add it after the incident drills when you are ready
  to learn DNS, alias records, ACM, and HTTPS.
```

## Beginner Learning Style

Every major topic should be explained using this pattern:

```text
1. Real-world analogy
2. Technical meaning
3. AWS/GitHub/Terraform example
4. Command or config
5. What each important flag or argument means
6. What can go wrong in production
7. How to detect it
8. How to fix it
9. How to explain it in an interview
```
