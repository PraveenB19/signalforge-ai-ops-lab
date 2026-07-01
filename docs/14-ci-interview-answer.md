# CI Interview Answer

This note is a spoken explanation you can use when someone asks:

```text
What does your CI process look like?
```

## Short Answer

```text
We use GitHub Actions for CI. For the Java application, Maven runs the build lifecycle using Java 21. The pipeline runs tests, generates a JAR artifact, produces JaCoCo code coverage, sends analysis to SonarQube Cloud for code quality and quality gate checks, runs Trivy for dependency/secret/filesystem security scanning, and uploads the tested artifact. Only a tested and scanned artifact should move toward deployment.
```

## Current Tool Ownership

```text
GitHub Actions:
  Orchestrates the CI pipeline.

Maven:
  Builds the Java app, runs tests, packages the JAR, and triggers plugins.

JUnit:
  Java test framework.

JaCoCo:
  Measures code coverage.

SonarQube Cloud:
  Checks code quality, bugs, vulnerabilities, security hotspots, code smells, duplication, maintainability, and coverage.

Trivy:
  Scans for known vulnerabilities, secrets, filesystem risks, dependency risk, and later container/IaC misconfigurations.

GitHub Actions artifact storage:
  Stores the generated JAR and reports for this beginner phase.

Future S3/Nexus/JFrog:
  Stores promoted deployable artifacts in a more production-like artifact repository.
```

## Current CI Flow

```text
Developer pushes code to feature branch
  -> GitHub Actions starts automatically
  -> Checkout repository
  -> Set up Java 21
  -> Run mvn -B verify
  -> JUnit tests run
  -> JaCoCo coverage report is generated
  -> Spring Boot JAR is packaged
  -> SonarQube Cloud analyzes code quality and coverage
  -> Trivy scans for security/supply-chain risks
  -> JAR and reports are uploaded as artifacts
```

Connected explanation:

```text
The pipeline is not just a list of tools. Each step creates confidence for the
next step. Maven proves the app can build. JUnit proves expected behavior.
JaCoCo shows how much code the tests exercised. SonarQube turns quality and
coverage into a gate. Trivy checks supply-chain and secret risk. The artifact is
only useful because it came from that controlled path.
```

## What Happens If Tests Fail?

```text
The pipeline fails immediately.
The developer fixes the failing test or code issue.
The artifact should not be promoted to deployment.
```

Interview answer:

```text
If unit tests fail, we stop the pipeline before quality scan or deployment. In a team setup, GitHub checks would block the pull request, and notifications can go to the developer through GitHub, Slack, or email depending on team setup.
```

## What Does SonarQube Do?

SonarQube Cloud analyzes:

```text
Bugs
Vulnerabilities
Security hotspots
Code smells
Duplications
Maintainability
Reliability
Security rating
Coverage from JaCoCo
```

Interview answer:

```text
SonarQube is our code quality and static analysis gate. It consumes the JaCoCo XML coverage report and applies quality gate rules so we can prevent risky or poorly tested code from moving forward.
```

How we set it up:

```text
The Maven `pom.xml` contains the SonarQube Cloud host URL, project key,
organization key, and JaCoCo XML report path. GitHub Actions passes the
SONAR_TOKEN secret at runtime. The token is secret; the project metadata is not.
```

## What Does JaCoCo Do?

```text
JaCoCo measures which Java code paths were executed by tests.
```

Important nuance:

```text
Coverage does not prove correctness. It proves tests executed code.
```

Interview answer:

```text
We use JaCoCo because it is a common enterprise Java coverage tool. Maven generates the JaCoCo XML report during verify, and SonarQube reads that report for coverage metrics and quality gate evaluation.
```

## What Does Trivy Do?

Trivy covers risk areas that Sonar does not fully own:

```text
Known dependency vulnerabilities
Secrets accidentally committed
Filesystem risks
Container image vulnerabilities later
Terraform/IaC misconfigurations later
```

Interview answer:

```text
SonarQube and Trivy are complementary. SonarQube focuses on source quality and security hotspots. Trivy focuses on supply-chain, dependency, secret, container, and IaC risk.
```

## Beginner Gate vs Production Gate

Current beginner gate:

```text
Maven verify passes
Unit tests pass
JAR builds
JaCoCo coverage report is generated
Sonar scan completes
Trivy report is generated
Artifacts upload
```

Production-style gate:

```text
Unit tests pass
Integration tests pass
SonarQube Quality Gate passes
No blocker issues
No critical bugs
No critical vulnerabilities
Security hotspots reviewed
New code coverage >= 80%
Overall coverage >= 70%
Duplicated code <= 3%
Trivy has no unfixed HIGH/CRITICAL findings
No secrets detected
Terraform scan has no critical IaC misconfigurations
```

## Artifact Promotion

Current project:

```text
GitHub Actions uploads the JAR as a workflow artifact.
```

Production pattern:

```text
Build once
Test once
Scan once
Publish the same artifact
Promote that artifact across dev, stage, and prod
Do not rebuild separately for each environment
```

Future options:

```text
S3 artifact bucket
Nexus
JFrog Artifactory
GitHub Packages
ECR for container images
```

Interview answer:

```text
The artifact generated by CI is the only artifact eligible for deployment. We avoid rebuilding in each environment because that can create mismatch between what was tested and what was deployed.
```

How deployment will use it later:

```text
The JAR created by CI can be copied to an S3 artifact bucket or another artifact
repository. EC2 user data, CodeDeploy, or an SSM command can download that exact
JAR, place it under an application path such as /opt/signalforge, and run it as a
systemd service. The key idea is that deployment consumes the CI artifact; it
does not rebuild the app on the server.
```

## Follow-Up Questions And Answers

Question:

```text
Why run quality scans before deployment?
```

Answer:

```text
Because finding issues before deployment is cheaper and safer than finding them in production.
```

Question:

```text
How do you make sure the right artifact is deployed?
```

Answer:

```text
I build once in CI, attach a version or commit SHA to the artifact, scan it, and
promote that same artifact through environments. I avoid rebuilding separately
on the EC2 server because that would break traceability.
```

Question:

```text
Where do quality gates live?
```

Answer:

```text
Some gates live in tools, such as the SonarQube Cloud Quality Gate. Some gates
live in GitHub Actions, such as failing on Trivy HIGH or CRITICAL findings. Some
gates live in GitHub branch protection, where required checks must pass before a
pull request can merge.
```

Question:

```text
Why both SonarQube and Trivy?
```

Answer:

```text
They catch different classes of issues. SonarQube checks source quality and code-level risk. Trivy checks supply-chain, secret, container, dependency, and IaC risk.
```

Question:

```text
What happens when a quality gate fails?
```

Answer:

```text
The pipeline should fail, the pull request should be blocked, and the developer must fix the issue or get an approved exception.
```

Question:

```text
Do you always fail on every vulnerability?
```

Answer:

```text
No. In production, we tune gates based on severity, exploitability, whether a fix exists, and business risk. But critical and high-risk issues should block promotion unless there is a documented exception.
```
