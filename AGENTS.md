# SignalForge AI Ops Lab Instructions

## Project Goal

Build a beginner-friendly but production-style DevOps/SRE lab for Java workloads on AWS.

The project must teach:

- GitHub Actions from scratch
- Terraform from scratch
- AWS networking and compute
- Secure CI/CD with OIDC
- Artifact build, scan, promotion, and deployment
- CloudWatch monitoring and alerting
- Scenario-based troubleshooting
- AI-assisted incident summaries and runbooks

## Teaching Style

For every workflow, Terraform file, script, command, or AWS resource, explain:

1. What it is
2. Why we need it
3. What each important block/flag/argument means
4. What can go wrong in production
5. How to troubleshoot it
6. How to explain it in an interview

Prefer short examples and analogies.

## Operating Model

The lab should be disposable:

- Create AWS resources from GitHub Actions and Terraform
- Practice deployments and incidents
- Destroy resources at the end of the day
- Recreate later from Git, Terraform state, and artifacts

## Security Rules

Never commit:

- AWS access keys
- OpenAI or Anthropic API keys
- Slack webhook URLs
- Sonar tokens
- Terraform state files
- `.env` files

Use GitHub Secrets, AWS Secrets Manager, SSM Parameter Store, and GitHub OIDC.

## AWS Account Rule

Use only this AWS identity for this project unless the user explicitly changes it:

```text
Account: 575108962419
User ARN: arn:aws:iam::575108962419:user/admin-user
```

Before creating, updating, or deleting AWS resources, verify the active identity:

```bash
aws sts get-caller-identity
```

Expected account:

```text
575108962419
```

Do not use other local AWS profiles or accounts for this project.

## Scenario Focus

Every implementation should support real production scenarios:

- High memory
- High CPU
- Disk full
- 502
- 503
- High P95/P99 latency
- Security group mistakes
- Terraform drift
- Staging works but production fails
- Missing NAT Gateway
- Failed deployment or rollback
