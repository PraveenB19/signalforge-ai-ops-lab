# AWS OIDC And Terraform Bootstrap

This note explains how GitHub Actions will securely authenticate to AWS and run Terraform.

## Goal

We want GitHub Actions to create AWS infrastructure without storing long-lived AWS access keys in GitHub.

Correct production pattern:

```text
GitHub Actions
  -> requests short-lived OIDC token
  -> AWS validates token claims
  -> AWS allows assuming a limited IAM role
  -> workflow receives temporary AWS credentials
  -> Terraform runs with those temporary credentials
```

## Why OIDC Instead Of AWS Access Keys

Access key approach:

```text
Create IAM user
Store AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in GitHub
Keys can be leaked or forgotten
Keys are long-lived unless rotated
```

OIDC approach:

```text
No long-lived AWS keys in GitHub
Short-lived credentials only
Trust can be restricted to repo, branch, or environment
Better auditability
Better least-privilege posture
```

Interview answer:

```text
We use GitHub OIDC with AWS IAM because it avoids long-lived cloud credentials in GitHub secrets. The workflow gets a short-lived token, AWS validates the token claims, and only then allows a tightly scoped role to be assumed.
```

## AWS Objects We Need

```text
IAM OIDC provider:
  Teaches AWS to trust tokens from GitHub.

IAM role:
  The role GitHub Actions can assume.

Trust policy:
  Controls which GitHub repo/branch/environment can assume the role.

Permissions policy:
  Controls what the role can do in AWS.

S3 bucket:
  Stores Terraform state.

S3 lockfile:
  Handles Terraform state locking.
```

## GitHub OIDC Provider Values

Provider URL:

```text
https://token.actions.githubusercontent.com
```

Audience:

```text
sts.amazonaws.com
```

GitHub's official AWS OIDC guidance uses these values for AWS.

## Trust Policy Concept

Trust policy answers:

```text
Who is allowed to assume this role?
```

Permissions policy answers:

```text
What can this role do after it is assumed?
```

Analogy:

```text
Trust policy = who can enter the building.
Permissions policy = what rooms they can access after entering.
```

## Secure Trust Policy Shape

For the dev environment, prefer GitHub Environment-based trust:

```text
repo:PraveenB19/signalforge-ai-ops-lab:environment:dev
```

This means:

```text
Only workflows from this repo using the dev GitHub Environment can assume this AWS role.
```

GitHub official docs recommend restricting the `sub` claim so untrusted repositories cannot request cloud access.

## GitHub Workflow Permissions

For AWS OIDC, the workflow needs:

```yaml
permissions:
  id-token: write
  contents: read
```

Meaning:

```text
id-token: write:
  Allows GitHub Actions to request an OIDC token.
  It does not directly grant AWS permissions.

contents: read:
  Allows checkout to read repo code.
```

## GitHub Repository Variables And Secrets

With OIDC, we should not store AWS access keys.

Use GitHub Variables for non-secret values:

```text
AWS_REGION=us-east-1
AWS_ROLE_TO_ASSUME_DEV=arn:aws:iam::<account-id>:role/signalforge-github-actions-dev
TF_STATE_BUCKET=<unique-bucket-name>
```

Use GitHub Secrets only for actual secrets:

```text
SONAR_TOKEN
SLACK_WEBHOOK_URL later
OPENAI_API_KEY or ANTHROPIC_API_KEY later
```

Do not store:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

## First AWS Bootstrap Order

Recommended beginner-safe order:

```text
1. Confirm AWS account, region, billing alert, and MFA.
2. Create S3 bucket for Terraform state.
3. Enable S3 bucket versioning and encryption.
4. Create GitHub OIDC provider in IAM.
5. Create dev IAM role for GitHub Actions.
6. Restrict trust policy to this repo and dev environment.
7. Attach limited permissions for first Terraform phase.
8. Create GitHub Environment named dev.
9. Add GitHub repository variables.
10. Create terraform plan workflow.
11. Run plan.
12. Add apply workflow with environment protection.
```

## First IAM Permission Strategy

For the very first Terraform bootstrap, keep it limited to what we are building next.

Phase 1 permissions:

```text
S3 state bucket access
EC2/VPC read/write for VPC resources
IAM read only where possible
CloudWatch logs later
```

Beginner reality:

```text
Terraform often needs broad permissions during early learning.
```

Enterprise approach:

```text
Start with a scoped dev role.
Use separate roles for dev/stage/prod.
Require approval for prod.
Gradually tighten permissions based on actual Terraform resources.
Use CloudTrail to audit actions.
```

## Environment Separation

GitHub:

```text
dev environment:
  Terraform apply allowed for dev.

prod environment:
  Requires approval before deployment.
```

Terraform:

```text
infra/envs/dev
infra/envs/prod
```

AWS naming:

```text
signalforge-dev-vpc
signalforge-prod-vpc
```

## What To Do Manually Next

In AWS Console:

```text
1. Confirm region: us-east-1.
2. Confirm root MFA and IAM admin MFA.
3. Confirm billing budget/alert exists.
4. Create a globally unique S3 bucket name for Terraform state.
```

Example bucket name:

```text
signalforge-tfstate-praveenb19-us-east-1
```

Do not make it public.

## Official References

- GitHub OIDC with AWS: https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws
- AWS configure credentials action: https://github.com/aws-actions/configure-aws-credentials

