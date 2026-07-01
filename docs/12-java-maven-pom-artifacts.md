# Java, Maven, POM, And Artifacts

This note explains what `pom.xml` does, how Maven builds a Java app, how artifacts are generated, and how those artifacts later move into AWS, Docker, Nexus, JFrog Artifactory, or S3.

## Key Files And Paths

Project paths:

```text
app/pom.xml
  Maven project definition.

app/src/main/java/
  Java application source code.

app/src/main/resources/
  Application config files, such as application.yml.

app/src/test/java/
  Test code.

app/target/
  Maven build output. This is generated and should not be committed.
```

Local Java/Maven checks:

```bash
echo $JAVA_HOME
which java
java -version
which mvn
mvn -version
```

Why:

```text
JAVA_HOME tells Maven where the JDK lives.
PATH decides which java and mvn commands run when you type them.
```

## What Is Maven?

Maven is a Java build and dependency management tool.

Analogy:

```text
Maven is like a factory manager.
It reads the instruction sheet, collects required parts, runs tests, packages the product, and can ship it to a warehouse.
```

Technical meaning:

```text
Maven reads pom.xml.
It downloads dependencies.
It compiles Java code.
It runs tests.
It packages the app into a JAR.
It can publish the artifact to a repository.
```

## Maven vs Gradle

Both Maven and Gradle can build Java apps.

```text
Maven:
  XML-based.
  Very common in enterprise Java.
  Strong convention-over-configuration.
  Easier for beginners to read step by step.

Gradle:
  Groovy/Kotlin-based.
  Flexible and powerful.
  Common in Android, modern JVM apps, and large builds.
```

For this project:

```text
We use Maven because it is common in enterprise Java and easier to explain in interviews.
```

## What Is pom.xml?

`pom.xml` means Project Object Model.

Maven's official docs describe it as the XML representation of a Maven project. It contains the project identity, dependencies, plugins, build settings, and repository/publishing configuration.

In simple words:

```text
pom.xml tells Maven what this project is and how to build it.
```

Important sections:

```xml
<groupId>dev.signalforge</groupId>
<artifactId>signalforge-app</artifactId>
<version>0.1.0-SNAPSHOT</version>
```

Meaning:

```text
groupId:
  Organization or namespace.

artifactId:
  Application/package name.

version:
  Artifact version.
```

Together these are Maven coordinates:

```text
dev.signalforge:signalforge-app:0.1.0-SNAPSHOT
```

Analogy:

```text
Coordinates are the artifact's address in a warehouse.
```

## Dependencies

Example:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

Meaning:

```text
This app needs Spring Boot web libraries.
Maven downloads them and their transitive dependencies.
```

Transitive dependency:

```text
If A needs B and B needs C, Maven can bring C automatically.
```

## Dependency Scope

Example:

```xml
<scope>test</scope>
```

Meaning:

```text
This dependency is only needed for tests.
It should not be part of normal runtime behavior.
```

Common scopes:

```text
compile:
  Needed to compile and run. Default.

test:
  Needed only for tests.

runtime:
  Needed when running but not compiling.

provided:
  Provided by the runtime/container, not packaged by the app.
```

## Maven Build Lifecycle

Common phases:

```text
validate
compile
test
package
verify
install
deploy
```

Important idea:

```text
When you run a later phase, Maven runs earlier phases first.
```

Examples:

```bash
mvn test
```

Runs enough phases to compile and test.

```bash
mvn package
```

Compiles, tests, and creates the JAR.

```bash
mvn install
```

Builds and installs the artifact into your local Maven repository.

```bash
mvn deploy
```

Builds and publishes the artifact to a remote repository, if configured.

## Maven Commands We Use

Current CI command:

```bash
mvn -B verify
```

Meaning:

```text
Runs the lifecycle through verify.
For this app, that compiles code, runs tests, generates JaCoCo coverage, and
packages the Spring Boot JAR.
```

Why this is the main CI command:

```text
It keeps the build story simple: one Maven lifecycle run creates the test
evidence, coverage report, and artifact.
```

```bash
mvn -B test
```

Meaning:

```text
-B:
  Batch mode. Cleaner non-interactive output for CI.

test:
  Compile and run tests.
```

```bash
mvn -B package -DskipTests
```

Meaning:

```text
package:
  Build the deployable JAR.

-DskipTests:
  Skip test execution because the CI already ran tests in a previous step.
```

## How The JAR Is Generated

For this project:

```bash
cd app
mvn -B verify
```

Output:

```text
app/target/signalforge-app-0.1.0-SNAPSHOT.jar
```

This is the artifact.

Do not commit it:

```text
target/ is generated output.
Git should track source code, not build output.
```

## Artifact Strategy In This Project

Beginner stage:

```text
GitHub Actions builds JAR.
GitHub Actions uploads JAR as workflow artifact.
```

Later AWS stage:

```text
GitHub Actions uploads tested JAR to S3 artifact bucket.
EC2 downloads that exact JAR.
systemd restarts the Java app.
Health check verifies deployment.
```

Enterprise stage:

```text
Publish artifact to Nexus or JFrog Artifactory.
Promote same artifact from dev to stage to prod.
Do not rebuild separately for each environment.
```

## How Maven Publishes To Nexus Or JFrog Artifactory

Maven uses `distributionManagement` in `pom.xml` to describe the remote artifact repository.

Example shape:

```xml
<distributionManagement>
    <repository>
        <id>releases</id>
        <url>https://artifacts.example.com/releases</url>
    </repository>
    <snapshotRepository>
        <id>snapshots</id>
        <url>https://artifacts.example.com/snapshots</url>
    </snapshotRepository>
</distributionManagement>
```

Credentials do not go in `pom.xml`.

Credentials usually go in:

```text
~/.m2/settings.xml
GitHub Actions secrets
CI/CD secret manager
```

Interview answer:

```text
The POM defines where artifacts can be deployed, but credentials are stored outside source control. In CI, secrets are injected at runtime.
```

## How The JAR Runs On A Server

Manual example:

```bash
java -jar signalforge-app-0.1.0-SNAPSHOT.jar
```

Production-style EC2 example:

```text
/opt/signalforge/signalforge-app.jar
/etc/signalforge/signalforge.env
/etc/systemd/system/signalforge.service
```

systemd starts the app:

```ini
ExecStart=/usr/bin/java -jar /opt/signalforge/signalforge-app.jar
```

Deployment flow:

```text
1. GitHub Actions builds and tests JAR.
2. Artifact is uploaded to S3.
3. EC2 downloads artifact.
4. systemd restarts app.
5. ALB health check calls /health.
6. If healthy, deployment is successful.
```

## How Docker Uses The Artifact

Dockerfile style:

```dockerfile
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY target/signalforge-app-0.1.0-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Meaning:

```text
Build JAR first.
Copy JAR into container image.
Run it with java -jar.
```

Later Kubernetes/EKS flow:

```text
Maven builds JAR.
Docker builds image with JAR.
Image is pushed to ECR.
EKS deploys image.
```

## What Cloud DevOps Engineers Usually Change In pom.xml

Common changes:

```text
Java version
Application version
Dependencies
Plugin versions/config
Test plugins
Code coverage plugins
SonarQube properties
Artifact repository distributionManagement
Build profiles
Container image plugins
Security/dependency scanning plugins
```

What not to put in `pom.xml`:

```text
Passwords
AWS access keys
Sonar tokens
Nexus/JFrog passwords
Environment-specific secrets
```

## SonarQube Cloud Properties

We should not guess these values.

Sonar usually needs:

```text
sonar.projectKey
sonar.organization
SONAR_TOKEN
```

Token:

```text
Store in GitHub Secrets as SONAR_TOKEN.
Never commit it.
```

Project key and organization:

```text
Can be stored in pom.xml if stable.
Can also be passed in GitHub Actions command line.
```

Example:

```bash
mvn -B sonar:sonar \
  -Dsonar.projectKey=PROJECT_KEY \
  -Dsonar.organization=ORG_KEY
```

If you only have the token:

```text
Pause before editing pom.xml.
Open SonarQube Cloud project dashboard and find the project key and organization key.
```

## Official References

- Maven POM reference: https://maven.apache.org/pom.html
- Maven build lifecycle: https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html
- SonarScanner for Maven: https://docs.sonarsource.com/sonarqube-cloud/analyzing-source-code/scanners/sonarscanner-for-maven/
