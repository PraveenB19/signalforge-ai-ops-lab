# ChatGPT Prompt For Interview Scripts

Copy this prompt into ChatGPT when you want a polished interview explanation.

```text
Act as a senior Cloud DevOps / Platform Engineer with 10+ years of production
experience. Help me create interview-ready scripts that sound natural, practical,
and deeply technical without sounding memorized.

Context:
I built a project called Orbit Ops / SignalForge AI Ops Lab. It uses:
- GitHub Actions for CI/CD
- Java 21 Spring Boot monolithic application
- Maven
- JUnit
- JaCoCo
- SonarQube Cloud quality gates
- Trivy security scanning
- Terraform
- AWS
- GitHub OIDC to AWS IAM Role
- S3 artifact storage
- EC2 Auto Scaling Group
- Application Load Balancer
- RDS PostgreSQL
- AWS Secrets Manager
- CloudWatch alarms, dashboard, VPC Flow Logs
- SSM Session Manager
- Slack/PagerDuty planned for alerts
- Future phases: EKS microservices, serverless, AI incident assistant/agent

I want you to write interview scripts for the following topics:

1. Monolithic application CI/CD
   Explain feature branch -> PR -> CI -> tests -> quality gates -> security scan
   -> artifact storage -> deployment to EC2 -> systemd restart -> ALB health
   checks -> CloudWatch monitoring -> rollback.

2. Microservices CI/CD
   Explain how the same concept changes when using Docker, ECR, EKS, Helm,
   GitOps/Argo CD, Kubernetes probes, service-level observability, Prometheus,
   Grafana, CloudWatch, canary/rolling deployment, and rollback.

3. Serverless CI/CD
   Explain Lambda/API Gateway/EventBridge/SQS/S3 triggers, Terraform/SAM/CDK,
   Lambda versions and aliases, canary deployment, CloudWatch logs, X-Ray,
   DLQ, errors, duration, throttles, and rollback.

4. GitHub OIDC to AWS
   Explain how GitHub Actions authenticates to AWS without long-lived access
   keys. Include identity provider, trust policy, repo/branch/environment
   conditions, id-token permission, sts:AssumeRoleWithWebIdentity, temporary
   credentials, and least privilege. Also include follow-up interview questions
   and answers.

5. AWS Secrets Manager
   Explain why Secrets Manager is used, how Terraform creates a DB secret, how
   EC2 or the app securely reads it, why not to store secrets in GitHub or code,
   IAM least privilege, rotation, and safe logging. Include follow-up questions.

6. SonarQube quality gates and Trivy
   Explain code quality, code coverage, reliability, maintainability, security
   hotspots, vulnerabilities, secret scanning, dependency scanning, and why a
   failed gate blocks merge/deploy. Include realistic quality gate examples.

7. Terraform modules vs workspaces
   Explain reusable modules, environment folders, remote S3 state, S3 native
   state locking, drift, plan/apply workflow, why staging may pass and prod may
   fail, and how to handle manual console changes during SEV1 incidents.

8. GitHub Actions reusable workflows
   Explain workflow files, jobs, steps, actions, permissions, environments,
   variables, secrets, reusable workflows, branch protection, manual approvals,
   and how enterprises standardize CI/CD across many repos.

9. Production troubleshooting scenarios
   Explain with commands, CloudWatch metrics, immediate mitigation, RCA, and
   communication:
   - ALB 502
   - ALB 503
   - ALB 504
   - target unhealthy
   - high CPU
   - high JVM heap / memory leak
   - high p95/p99 latency
   - DB connection issue
   - bad deployment/stale JAR
   - network/security group/NACL issue
   - Terraform drift

10. CloudWatch usage
   Explain how I navigate CloudWatch dashboards, alarms, metrics, logs, VPC Flow
   Logs, and how I correlate RequestCount, HTTPCode_ELB_5XX_Count,
   HTTPCode_Target_5XX_Count, TargetResponseTime, HealthyHostCount,
   UnHealthyHostCount, CPUUtilization, memory/disk custom metrics, RDS metrics,
   logs, and recent deployment time.

11. Incident communication
   Explain how I communicate customer impact to teams: symptom, affected users,
   timeline, severity, current mitigation, owner, next update time, and postmortem.

12. AI incident assistant / agent
   Explain how AI can help summarize CloudWatch alarms, logs, recent deployments,
   Terraform changes, GitHub Actions runs, and suggest runbook steps. Make it
   clear AI assists engineers but does not blindly make production changes unless
   guarded by approvals.

Output format:
- Start with a crisp 60-second answer for each topic.
- Then give a deeper 3-5 minute answer for each topic.
- Then give likely interviewer follow-up questions and strong answers.
- Include commands where relevant.
- Include production examples and analogies.
- Avoid generic textbook language.
- Make it sound like I actually built and troubleshot this project.
- Use clear wording that I can speak out loud.
- If something is risky or not yet implemented, say how I would do it next.
- Make the answer strong enough that an interviewer has fewer obvious gaps to
  challenge.

Important tone:
I want to sound practical, calm, and senior. I should not sound like I memorized
tool names. I should sound like I understand the flow, tradeoffs, failure modes,
and how to recover production safely.
```

## Shorter Follow-Up Prompt

Use this after ChatGPT gives you the first answer:

```text
Now challenge me like an interviewer. Ask 25 scenario-based follow-up questions
from this project. For each question, provide:
1. What the interviewer is really testing.
2. A strong answer.
3. A weak answer to avoid.
4. Commands or metrics I should mention.
```

## Mock Interview Prompt

```text
Act as a strict interviewer for a Senior Cloud DevOps Engineer role. Interview me
on this project for 45 minutes. Ask one question at a time. After I answer, grade
my answer, point out missing details, and give me a stronger version.
Focus on CI/CD, Terraform, AWS, OIDC, Secrets Manager, CloudWatch, ALB, EC2,
RDS, JVM troubleshooting, production incidents, and microservices/serverless
extensions.
```

