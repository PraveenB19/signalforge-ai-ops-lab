# Secrets Manager Practice

Use this when you want to understand how secrets are created, protected, and
used by an application without hard-coding passwords.

## Are We Using Secrets Manager?

Yes, Terraform already creates a database secret.

Current resource:

```text
infra/modules/rds/main.tf
```

What it creates:

```text
aws_secretsmanager_secret.database
aws_secretsmanager_secret_version.database
```

Secret name:

```text
signalforge-dev/database
```

Secret content shape:

```json
{
  "username": "appuser",
  "password": "generated-random-password",
  "database": "signalforge"
}
```

Terraform output:

```text
db_secret_arn
```

## Why Use Secrets Manager?

Bad pattern:

```text
Put DB username/password in code, GitHub workflow YAML, Terraform variables, or
plain text files on the server.
```

Better pattern:

```text
Store the secret in AWS Secrets Manager.
Allow only the app role to read it.
Retrieve it at runtime or deployment time.
Never print the secret value in logs.
Rotate it when needed.
```

Interview answer:

```text
I use AWS Secrets Manager for database passwords and external API keys so secrets
are not stored in source control or long-lived CI variables. The EC2 instance or
application role gets least-privilege permission to read only the required
secret. The app receives the value at runtime, and logs only masked or metadata
values, never the raw secret.
```

## Two Ways To Use Secrets

### Option 1: Fetch During Deployment

Flow:

```text
GitHub Actions -> SSM command -> EC2 aws secretsmanager get-secret-value
-> write protected env file -> systemd loads env file -> app starts
```

Example:

```bash
aws secretsmanager get-secret-value \
  --secret-id <db-secret-arn> \
  --query SecretString \
  --output text
```

Then write an environment file:

```bash
sudo mkdir -p /etc/signalforge
sudo chmod 750 /etc/signalforge
sudo tee /etc/signalforge/signalforge.env >/dev/null <<'ENV'
SPRING_DATASOURCE_URL=jdbc:postgresql://<rds-endpoint>:5432/signalforge
SPRING_DATASOURCE_USERNAME=<username>
SPRING_DATASOURCE_PASSWORD=<password>
ENV
sudo chmod 600 /etc/signalforge/signalforge.env
```

systemd service:

```ini
[Service]
EnvironmentFile=/etc/signalforge/signalforge.env
ExecStart=/usr/bin/java -jar /opt/signalforge/signalforge-app.jar
```

Pros:

```text
Simple for EC2.
App does not need AWS SDK code.
Easy to inspect whether env vars are configured.
```

Cons:

```text
Secret exists on disk in protected file.
Rotation needs service restart.
Need to avoid printing env file in logs.
```

### Option 2: App Fetches Secret At Runtime

Flow:

```text
Spring Boot app -> AWS SDK -> Secrets Manager -> parse JSON -> connect to DB
```

Pros:

```text
No secret file on disk.
Can support rotation patterns.
Application controls refresh behavior.
```

Cons:

```text
More application code.
Needs AWS SDK dependency.
Needs careful retry/failure behavior.
Do not call Secrets Manager on every request.
```

Production note:

```text
Apps should fetch secrets at startup or cache them safely. Calling Secrets
Manager on every user request increases latency, cost, and failure risk.
```

## IAM Permission Pattern

The EC2 role should get only this secret:

```json
{
  "Effect": "Allow",
  "Action": [
    "secretsmanager:GetSecretValue"
  ],
  "Resource": "<db-secret-arn>"
}
```

Do not give:

```text
secretsmanager:* on *
```

Interview answer:

```text
I scope secret access by application and environment. A dev EC2 role can read
only the dev database secret. Production roles read only production secrets.
This prevents a compromised dev workload from reading production credentials.
```

## How To Practice Safely

After infrastructure is recreated:

```bash
terraform output db_secret_arn
```

Check secret metadata:

```bash
aws secretsmanager describe-secret \
  --profile admin-user \
  --region us-east-1 \
  --secret-id <db-secret-arn>
```

Read secret value for learning:

```bash
aws secretsmanager get-secret-value \
  --profile admin-user \
  --region us-east-1 \
  --secret-id <db-secret-arn> \
  --query SecretString \
  --output text
```

Important:

```text
Do this only in your learning account. Do not paste secret values into GitHub,
Slack, screenshots, docs, or logs.
```

## What We Should Implement Next

Recommended next hands-on step:

```text
Use deployment-time secret fetch first.
```

Why:

```text
It teaches Secrets Manager, IAM, SSM, systemd EnvironmentFile, and app config
without adding too much Java complexity.
```

Planned implementation:

```text
1. Add EC2 IAM permission to read db_secret_arn.
2. Update deploy workflow to fetch secret through SSM on the instance.
3. Write /etc/signalforge/signalforge.env with chmod 600.
4. Update systemd service to use EnvironmentFile.
5. Add app endpoint that confirms DB config is present without exposing password.
6. Later connect app to RDS and run real queries.
```

What not to expose:

```text
Never return password, token, private key, or full connection string in an API.
Return only safe checks such as configured=true, username present, endpoint
present, or masked values.
```

