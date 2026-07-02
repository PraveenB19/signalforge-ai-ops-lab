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
Java app and CI are working.
SonarQube Cloud, JaCoCo, and Trivy are integrated.
Terraform state bucket is created.
GitHub OIDC provider and dev IAM role are configured.
Next step is testing GitHub Actions -> AWS OIDC role assumption, then building Terraform dev infrastructure.
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
