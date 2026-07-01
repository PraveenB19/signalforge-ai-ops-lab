# GitHub Actions CI Workflow

Workflow file:

```text
.github/workflows/java-ci.yaml
```

## What This Workflow Does

```text
Code push or pull request
  -> checkout repository
  -> install Java 21
  -> run tests
  -> build JAR
  -> scan repository with Trivy
  -> upload Trivy report
  -> upload JAR artifact
```

## Why The Artifact Is Not In VS Code

GitHub Actions runs on a temporary GitHub runner, not your laptop.

The JAR is created here on the runner:

```text
app/target/*.jar
```

Then this step stores it in the GitHub Actions run:

```yaml
- name: Upload JAR artifact
  uses: actions/upload-artifact@v4
```

Where to find it:

```text
GitHub -> repo -> Actions -> Java CI run -> Summary -> Artifacts
```

Analogy:

```text
Your laptop sends the recipe.
GitHub cooks it in its kitchen.
The artifact is the packed food container attached to the run.
```

## Trigger Section

```yaml
on:
  push:
    branches:
      - main
      - dev
      - feature/**
  pull_request:
    branches: [ "dev" ]
```

Meaning:

```text
push:
  Run when code is pushed.

branches:
  Limit which pushed branches trigger the workflow.

feature/**:
  Match any branch under feature/, such as feature/java-app.

pull_request:
  Run when a pull request targets dev.
```

Why pull request targets `dev`:

```text
For now, feature branches merge into dev first.
Later, dev promotes to main after stronger checks.
```

## Permissions Section

```yaml
permissions:
  contents: read
```

Meaning:

```text
GitHub gives the workflow a temporary GITHUB_TOKEN.
contents: read lets the workflow read repository files.
It cannot push code, edit repo settings, or create releases.
```

Analogy:

```text
The workflow gets a read-only visitor badge.
It can enter and read files, but it cannot rearrange the building.
```

Why:

```text
Least privilege. CI only needs to read code, build, test, scan, and upload artifacts.
```

Later for AWS OIDC:

```yaml
permissions:
  id-token: write
  contents: read
```

`id-token: write` lets GitHub request an OIDC identity token for AWS.

## Steps

### Checkout

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
```

Meaning:

```text
Downloads the repository code onto the GitHub runner.
Without this, the runner starts empty.
```

### Java Setup

```yaml
- name: Set up Java 21
  uses: actions/setup-java@v4
  with:
    distribution: temurin
    java-version: "21"
    cache: maven
```

Meaning:

```text
Installs Java 21 on the runner.
Temurin is a common OpenJDK distribution.
Maven cache makes later builds faster.
```

### Test

```yaml
- name: Run tests
  run: mvn -B test
```

Meaning:

```text
Compiles the app and runs unit tests.
If tests fail, the workflow fails.
```

`-B` means batch mode:

```text
Cleaner, non-interactive Maven output for CI/CD logs.
```

### Package

```yaml
- name: Build JAR
  run: mvn -B package -DskipTests
```

Meaning:

```text
Builds the deployable Java JAR under app/target/.
```

`-DskipTests` means:

```text
Do not run tests again during package because the previous step already ran them.
```

### Trivy Scan

```yaml
- name: Run Trivy filesystem scan
  uses: aquasecurity/trivy-action@v0.36.0
```

Meaning:

```text
Scans the repository filesystem for vulnerabilities, secrets, and IaC issues.
```

Important inputs:

```text
scan-type: fs
  Filesystem scan.

scan-ref: .
  Scan the current repository root.

severity: HIGH,CRITICAL
  Focus on higher-risk findings.

ignore-unfixed: true
  Do not fail on vulnerabilities with no known fix.

exit-code: "0"
  Do not fail the build yet. We are learning and collecting reports first.
```

Why Trivy runs after Maven:

```text
Maven resolves Java dependencies first.
That reduces the chance that Trivy has to repeatedly query Maven Central during its scan.
```

Later we will change `exit-code` to `"1"` for stricter enforcement.

### Upload Artifact

```yaml
- name: Upload JAR artifact
  uses: actions/upload-artifact@v4
```

Meaning:

```text
Stores the built JAR with the workflow run.
This proves we deploy the tested artifact, not a random rebuild.
```

## Real Troubleshooting Example: Local Trivy 429

During local testing, Trivy downloaded its vulnerability DB successfully but Maven Central returned:

```text
429 Too Many Requests
```

Meaning:

```text
The remote repository rate-limited requests from the current network/IP.
```

Production lesson:

```text
CI systems should use caching to reduce repeated dependency downloads.
```

For GitHub Actions, `actions/setup-java` with `cache: maven` helps cache Maven dependencies between runs.

## Real Troubleshooting Example: Mockito/ByteBuddy Agent

During local testing, full Spring Boot web tests initialized Mockito/ByteBuddy and failed on this local macOS/JDK setup because the JVM could not self-attach a Java agent.

Beginner meaning:

```text
Some Java test tools attach an agent to the running JVM so they can create mocks or inspect bytecode.
If the local JVM or OS blocks that attach mechanism, tests can fail even when app code is fine.
```

What we did:

```text
For this early phase, we changed the tests to plain JUnit controller tests.
They are faster, simpler, and avoid unnecessary framework startup.
```

Production lesson:

```text
Use the lightest test type that proves the behavior.
Add heavier Spring context/integration tests only when they provide real value.
```

## CI vs CD

CI answers:

```text
Is the code buildable, tested, and scanned?
```

CD answers:

```text
Should this tested artifact be deployed to an environment?
```

Our target flow:

```text
feature/*
  CI only

dev
  CI + deploy to dev AWS later

main
  CI + production approval + deploy to prod AWS later
```
