# SignalForge Learning Map

Use this doc when you feel, "I know many tools, but how do they connect?"

The best way to remember this project is to learn it from the bottom up, like a
stack. Troubleshooting becomes easier when you can ask, "Which layer is failing?"

For visual revision, also open:

```text
docs/visuals/README.md
```

## The Stack

```mermaid
flowchart TD
    Human["User / customer experience"] --> DNS["DNS / Route 53 / domain"]
    DNS --> Edge["ALB / HTTPS / target health"]
    Edge --> Network["VPC / subnets / routes / security groups / NACLs"]
    Network --> Compute["EC2 / Linux / systemd"]
    Compute --> Runtime["JVM / heap / threads / GC"]
    Runtime --> App["Spring Boot application"]
    App --> Data["RDS / database connections"]
    App --> Logs["Logs / metrics / traces"]
    Logs --> Alerts["CloudWatch / Slack / PagerDuty"]
    Alerts --> HumanOps["Engineer investigates and fixes"]
```

Memory hook:

```text
User -> DNS -> ALB -> Network -> Linux -> JVM -> App -> DB -> Metrics -> Alert
```

If you can walk this path forward and backward, most interview scenarios become
less scary.

## The Delivery Pipeline

```mermaid
flowchart LR
    Code["Code"] --> Build["Maven build"]
    Build --> Test["JUnit tests"]
    Test --> Coverage["JaCoCo coverage"]
    Coverage --> Quality["SonarQube quality gate"]
    Quality --> Security["Trivy security scan"]
    Security --> Artifact["Versioned artifact"]
    Artifact --> OIDC["GitHub OIDC to AWS"]
    OIDC --> Terraform["Terraform infrastructure"]
    Terraform --> Deploy["Deploy to EC2"]
    Deploy --> Observe["Observe in CloudWatch"]
```

Memory hook:

```text
Code -> Build -> Test -> Scan -> Artifact -> Authenticate -> Provision -> Deploy -> Observe
```

Interview answer:

```text
I separate delivery into evidence-producing steps. Maven builds, tests, and
packages the app. SonarQube and Trivy add quality and security evidence. The
artifact is stored and deployed only after those checks. GitHub then uses OIDC to
get short-lived AWS credentials for Terraform and deployment.
```

## Read In This Order

Read these when you want the whole project story:

```text
1. docs/27-master-interview-and-simulation-guide.md
2. docs/00-start-here-interview-runbook.md
3. docs/00-learning-map.md
4. docs/visuals/README.md
5. docs/02-architecture.md
6. docs/03-github-actions-learning-path.md
7. docs/11-github-actions-ci.md
8. docs/12-java-maven-pom-artifacts.md
9. docs/13-quality-gates-and-ci-security.md
10. docs/16-oidc-explained-human-version.md
11. docs/15-aws-oidc-terraform-bootstrap.md
12. docs/04-terraform-operations.md
13. docs/17-terraform-enterprise-runbook.md
14. docs/18-aws-network-flow.md
15. docs/19-cicd-troubleshooting-runbook.md
16. docs/20-end-to-end-dev-test-runbook.md
17. docs/21-linux-aws-command-reference.md
18. docs/22-secrets-manager-practice.md
19. docs/23-cicd-interview-scripts.md
20. docs/24-chatgpt-interview-script-prompt.md
21. docs/25-aws-console-runtime-navigation.md
22. docs/26-cloudwatch-agent-runtime-observability.md
23. docs/28-architecture-patterns-monolith-microservices-serverless.md
24. docs/05-interview-troubleshooting-notes.md
25. docs/09-scenario-catalog.md
```

Use these as supporting docs:

```text
docs/00-manual-prerequisites.md:
  What needs to exist before automation can run.

docs/01-two-day-execution-plan.md:
  What we are building in phases.

docs/06-linkedin-project-story.md:
  How to explain the project publicly.

docs/07-domain-and-branding.md:
  Domain, Route 53, ACM, ALB DNS story.

docs/08-disposable-lab-operations.md:
  How to destroy/recreate the lab safely.

docs/10-local-toolchain.md:
  Java, Maven, Terraform, AWS CLI, GitHub CLI path troubleshooting.
```

## Troubleshooting Memory Pattern

When something breaks, ask these questions in this order:

```text
1. Is the customer impacted?
2. Is traffic normal or spiking?
3. Is latency high?
4. Are errors increasing?
5. Which resource is saturated?
6. Which layer owns that resource?
7. What changed recently?
8. What is the safest mitigation?
9. What evidence do we need for root cause?
10. What alert/runbook prevents repeat confusion?
```

Memory hook:

```text
Impact -> Signal -> Layer -> Change -> Mitigate -> Root cause -> Prevent
```

## System-Level Thinking

For Java on EC2, think from bottom to top:

```mermaid
flowchart TD
    Hardware["CPU / memory / disk / network"] --> Kernel["Linux kernel"]
    Kernel --> Process["Java process"]
    Process --> JVM["JVM memory: heap, stack, metaspace, native"]
    JVM --> Threads["Threads / GC / connection pools"]
    Threads --> Spring["Spring Boot app"]
    Spring --> API["API request handling"]
    API --> DB["Database calls"]
```

Example:

```text
High memory is not automatically a Java heap leak.
It could be OS cache, another process, JVM heap, thread stacks, direct buffers,
native memory, logs filling disk, or traffic causing more live objects.
```

That is why we troubleshoot in layers:

```text
free/top -> ps/pidstat -> jcmd/jstack/jmap -> app logs -> CloudWatch metrics
```

## What Comes Next

Current project checkpoint:

```text
Java CI works.
SonarQube, JaCoCo, and Trivy are wired.
Terraform state bucket exists.
GitHub OIDC provider and dev IAM role exist.
GitHub Actions OIDC smoke test succeeded against AWS account 575108962419.
Terraform dev infrastructure exists for VPC, ALB, ASG, EC2, RDS, artifact S3,
VPC Flow Logs, CloudWatch dashboards, and CloudWatch alarms.
Dev ALB serves the Orbit Ops app.
Runtime observability is being added with CloudWatch Agent for app logs, GC logs,
memory, and disk metrics.
The master interview and simulation guide now connects GitHub Actions, OIDC,
Terraform, Java artifacts, AWS request flow, CloudWatch, and incident drills.
The architecture patterns guide compares monolith on EC2, microservices on EKS,
and serverless on Lambda using the same mental model.
```

Next step:

```text
1. Read docs/27-master-interview-and-simulation-guide.md once end to end.
2. Read docs/20-end-to-end-dev-test-runbook.md.
3. Keep docs/21-linux-aws-command-reference.md open while practicing commands.
4. Read docs/22-secrets-manager-practice.md before wiring app secrets.
5. Read docs/23-cicd-interview-scripts.md out loud once.
6. Use docs/24-chatgpt-interview-script-prompt.md to generate mock interview scripts.
7. Keep docs/25-aws-console-runtime-navigation.md open while navigating AWS console.
8. Read docs/26-cloudwatch-agent-runtime-observability.md before simulations.
9. Read docs/28-architecture-patterns-monolith-microservices-serverless.md.
10. Test the public ALB URL from browser and curl.
11. Practice Session Manager troubleshooting on one EC2 instance.
12. Simulate 502, 503, latency, CPU, memory, disk, and JVM GC scenarios.
13. Add Slack notification routing.
14. Add Route 53, ACM, and later CloudFront after buying a domain.
```

## How To Memorize The Project

Use three passes:

```text
Pass 1:
  Read only diagrams and memory hooks.

Pass 2:
  Read the plain-English explanations.

Pass 3:
  Practice speaking the interview answers out loud.
```

Best daily review:

```text
Draw the architecture from memory.
Explain GitHub OIDC without looking.
Explain build once, test once, scan once, deploy same artifact.
Pick one incident scenario and walk through metrics, commands, mitigation, RCA.
```
