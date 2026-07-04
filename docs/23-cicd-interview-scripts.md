# CI/CD Interview Scripts

Use this as a speaking guide. The goal is not to memorize every word. The goal
is to sound like you understand the flow, the tradeoffs, and the production
failure modes.

Memory hook:

```text
Code -> Test -> Scan -> Package -> Store -> Provision -> Deploy -> Verify -> Observe -> Promote
```

## Universal CI/CD Flow

For any application type, I explain CI/CD in this order:

```text
1. Developer pushes code.
2. Pull request opens.
3. CI runs build, tests, code quality, and security scans.
4. A versioned artifact is created only after checks pass.
5. Artifact is stored in a repository such as S3, Nexus, JFrog, ECR, or GHCR.
6. Deployment uses that exact artifact.
7. Infrastructure is created or updated through Terraform/IaC.
8. Deployment verifies health and smoke tests.
9. Monitoring, logs, metrics, and alerts confirm behavior.
10. Promotion to higher environments happens through PRs, approvals, or release gates.
```

Interview answer:

```text
I design CI/CD so every deployment is traceable. We do not build one thing and
deploy another. The same tested artifact moves through environments, and each
stage produces evidence: tests, quality gate, vulnerability scan, deployment
logs, health checks, and monitoring signals.
```

## Branching Strategy

Simple project strategy:

```text
feature/* -> dev -> main
```

Meaning:

```text
feature branch:
  Developer work.
  CI validates build/test/scan.

dev branch:
  Shared development integration.
  Deploys automatically or manually to dev environment.

main branch:
  Production-ready source of truth.
  Requires PR review, checks, and environment approval before production deploy.
```

Enterprise variation:

```text
feature/* -> develop -> release/* -> main
```

Use release branches when:

```text
Multiple teams release on a schedule.
Hotfixes and stabilization need isolation.
Production changes require stricter controls.
```

Interview answer:

```text
For this lab I use feature branches, dev, and main. In enterprise, the exact
branching model depends on release cadence, but the principle is the same:
feature branches validate early, dev/stage proves integration, and main is
protected for production.
```

## How Many GitHub Actions Workflows?

Typical workflows:

```text
ci.yml:
  Build, unit test, coverage, SonarQube, Trivy.

terraform-plan.yml:
  Runs terraform fmt, validate, and plan for pull requests.

terraform-apply-dev.yml:
  Applies dev infrastructure.

deploy-dev.yml:
  Builds or downloads artifact and deploys to dev.

deploy-prod.yml:
  Deploys production with approval.

destroy-dev.yml:
  Optional disposable lab cleanup.
```

Reusable workflow pattern:

```text
.github/workflows/reusable-java-ci.yml
.github/workflows/reusable-terraform-plan.yml
.github/workflows/reusable-deploy-ec2.yml
```

Why:

```text
Large organizations avoid copying the same pipeline logic into 100 repos.
Reusable workflows standardize security scans, artifact naming, deployment
steps, and required checks.
```

## Monolithic Application CI/CD

Example stack:

```text
Java Spring Boot monolith
Maven
SonarQube
Trivy
S3/Nexus/JFrog artifact store
Terraform
EC2 Auto Scaling Group
ALB
CloudWatch
```

Flow:

```text
Developer pushes feature branch.
CI checks out code.
Maven compiles and runs tests.
JaCoCo produces coverage.
SonarQube checks quality/security.
Trivy scans dependencies/secrets/filesystem/IaC.
JAR is packaged.
JAR is uploaded to artifact repository.
Terraform provisions or updates ALB, EC2 ASG, RDS, IAM, CloudWatch.
Deploy job downloads the JAR on EC2 through SSM or deployment agent.
systemd restarts the app service.
ALB health checks confirm healthy targets.
Smoke tests hit public URL.
CloudWatch alarms and dashboard observe behavior.
```

Artifact promotion:

```text
Build once.
Store versioned artifact.
Deploy the same artifact to dev, stage, prod.
Do not rebuild separately for prod.
```

How production downloads the artifact:

```text
It is automated. A deployment job or deployment tool downloads the artifact
using IAM permissions or repository credentials. In this lab, GitHub Actions
uses SSM to tell private EC2 instances to copy the JAR from S3.
```

Deployment tools:

```text
Simple EC2:
  SSM Run Command, systemd, shell scripts.

Enterprise EC2:
  AWS CodeDeploy, Ansible, Octopus, Spinnaker, Jenkins, GitHub Actions runner,
  or custom deployment platform.

Container:
  ECS/EKS deployment controllers.
```

Blue-green vs rolling/canary:

```text
Rolling:
  Replace instances gradually. Common with ASG/EKS.

Blue-green:
  Run old and new environments side by side, then switch traffic.
  Safer rollback, more expensive.

Canary:
  Send a small percentage of traffic to the new version first.
  Good for high-risk changes and user-impact validation.
```

For this lab:

```text
We currently use a simple restart-on-EC2 style deployment.
Next improvement would be rolling or blue-green using ASG instance refresh or
CodeDeploy.
```

Interview answer:

```text
For a monolith on EC2, I package the app as a versioned JAR, store it in an
artifact repository, and deploy it through an automated job. The job downloads
the tested artifact, updates the service path, restarts systemd, waits for local
health, then checks ALB target health and smoke tests. For production, I prefer
rolling or blue-green deployment rather than restarting all instances at once.
```

## Microservices CI/CD

Example stack:

```text
Multiple services
GitHub Actions or Jenkins
Maven/Gradle/npm/go test
Docker
Trivy
ECR
Terraform
EKS
Helm
Argo CD or Flux
Prometheus/Grafana
CloudWatch
```

Common repo models:

```text
Monorepo:
  Many services in one repo.
  Pipeline detects changed service folders.

Multi-repo:
  One repo per service.
  Shared reusable workflows enforce standards.

Separate infrastructure repo:
  Terraform and cluster modules live separately.
  Application repos publish images and update Helm values.
```

Flow:

```text
Developer pushes service change.
CI runs unit tests and service-level quality/security scans.
Docker image is built.
Trivy scans the image.
Image is pushed to ECR with immutable tag.
Helm chart values are updated with the image tag.
Deployment to EKS happens through Helm, Argo CD, or GitHub Actions.
Kubernetes rolling update replaces pods gradually.
Readiness/liveness probes protect traffic.
Prometheus/Grafana and CloudWatch observe service metrics.
Alerts fire on error rate, latency, saturation, pod restarts, and unhealthy pods.
```

Promotion:

```text
dev:
  Deploy every merge to dev.

stage:
  Deploy release candidate or approved image tag.

prod:
  Promote same image tag with approval.
```

Important Kubernetes checks:

```bash
kubectl get pods -n <namespace>
kubectl describe pod <pod> -n <namespace>
kubectl logs <pod> -n <namespace>
kubectl get deploy -n <namespace>
kubectl rollout status deploy/<deployment> -n <namespace>
kubectl rollout undo deploy/<deployment> -n <namespace>
helm list -n <namespace>
helm history <release> -n <namespace>
```

Interview answer:

```text
For microservices, I usually deploy containers rather than raw JARs. CI builds
and scans each service image, pushes it to ECR, and deployment updates Helm
values or a GitOps repo. EKS performs rolling updates using readiness and
liveness probes. Monitoring shifts from only host metrics to service-level,
pod-level, and cluster-level metrics such as error rate, p95 latency, pod
restarts, CPU/memory requests, and HPA behavior.
```

## Serverless CI/CD

Example stack:

```text
Lambda
API Gateway or EventBridge or SQS
DynamoDB/RDS/S3
Terraform or AWS SAM/CDK/Serverless Framework
GitHub Actions
CloudWatch Logs/Metrics
X-Ray
```

How serverless gets triggered:

```text
API Gateway:
  HTTP request triggers Lambda.

EventBridge:
  Schedule or event triggers Lambda.

S3:
  Object created event triggers Lambda.

SQS:
  Message in queue triggers Lambda.

DynamoDB Streams:
  Table change triggers Lambda.
```

Flow:

```text
Developer pushes code.
CI runs tests and static analysis.
Package Lambda zip or container image.
Trivy scans dependencies/image.
Artifact is uploaded to S3 or image pushed to ECR.
Terraform/SAM/CDK updates Lambda, IAM, API Gateway, event triggers, alarms.
Deploy uses versions and aliases.
Canary/linear traffic shifting can be done with Lambda aliases or CodeDeploy.
CloudWatch logs, metrics, and X-Ray observe behavior.
```

Serverless metrics:

```text
Invocations
Errors
Duration
Throttles
Concurrent executions
Iterator age for streams
Dead-letter queue messages
API Gateway 4xx/5xx/latency
```

Interview answer:

```text
For serverless, the deployment artifact is usually a Lambda zip or container
image. Infrastructure defines the function, IAM permissions, triggers, and
alarms. The function is triggered by API Gateway, SQS, EventBridge, S3, or other
events. For production safety, I use Lambda versions and aliases with canary or
linear traffic shifting, then monitor errors, duration, throttles, and DLQ
messages.
```

## Infrastructure Repository Strategy

Small project:

```text
Application and Terraform can live in the same repo.
This is simple and good for learning.
```

Enterprise:

```text
Infrastructure modules often live in a separate platform repo.
Application repos consume modules or request environments through pipelines.
Shared modules enforce standards for VPC, IAM, EKS, RDS, logging, tagging, and
security controls.
```

Tradeoff:

```text
Same repo:
  Easier for one team and small apps.

Separate infra repo:
  Better governance and reuse across many teams.
```

Interview answer:

```text
For small applications, keeping app and Terraform together can be practical. In
enterprise, I prefer reusable Terraform modules and often a separate
infrastructure repository or platform workflow. That helps standardize tagging,
security, logging, IAM, network patterns, and drift control across many teams.
```

## Security In CI/CD

Controls:

```text
OIDC instead of static cloud keys.
GitHub environments for approval gates.
Least-privilege IAM roles per environment.
SonarQube for source quality/security hotspots.
Trivy for dependency, secret, image, and IaC scanning.
Artifact immutability.
Secrets Manager or SSM Parameter Store for runtime secrets.
Manual approval before production.
CloudWatch/Slack/PagerDuty for detection and response.
```

Interview answer:

```text
I handle CI/CD security in layers: source scanning, dependency scanning, secret
scanning, artifact control, OIDC-based cloud access, environment approvals,
least-privilege IAM, and runtime monitoring. The goal is to prevent bad changes
from deploying and detect quickly if something still goes wrong.
```

## Final 10+ Years Style Answer

```text
For CI/CD, I think in terms of artifact integrity, environment promotion, and
operational safety. Developers work in feature branches and open PRs. CI builds,
tests, scans, and packages the code. If checks pass, we publish an immutable
artifact. Infrastructure is managed with Terraform and environment-specific
state. Deployment jobs use OIDC to get short-lived AWS credentials and deploy
the exact tested artifact.

For monoliths on EC2, the artifact may be a JAR deployed through SSM,
CodeDeploy, or another deployment tool, then managed by systemd behind an ALB.
For microservices, the artifact is usually a container image deployed to EKS
through Helm or GitOps with rolling updates and probes. For serverless, the
artifact is a Lambda zip or image, deployed with versions and aliases, triggered
by API Gateway, SQS, EventBridge, or S3.

Across all three, I watch the same production signals: request rate, error rate,
latency, saturation, logs, recent deploys, and dependency health. I also design
rollback, approval, monitoring, and alerting from the beginning instead of
treating them as afterthoughts.
```

