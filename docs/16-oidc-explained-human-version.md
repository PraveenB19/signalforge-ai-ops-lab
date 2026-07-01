# GitHub OIDC To AWS: Human Explanation

This note explains the GitHub Actions to AWS OIDC setup in a natural way.

## What We Are Trying To Solve

We want GitHub Actions to create AWS infrastructure using Terraform.

Bad approach:

```text
Create AWS access keys.
Store AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in GitHub.
Let GitHub Actions use those long-lived keys.
```

Why that is risky:

```text
Keys can leak.
Keys can be forgotten.
Keys need rotation.
If someone steals them, they can use them outside GitHub.
```

Better approach:

```text
Use GitHub OIDC and AWS STS.
No long-lived AWS keys in GitHub.
GitHub gets short-lived AWS credentials only when a workflow runs.
```

## What OIDC Means Here

OIDC means OpenID Connect.

In this project:

```text
GitHub is the identity provider.
AWS is the system deciding whether to trust that identity.
```

Analogy:

```text
GitHub issues an ID card for the workflow.
AWS checks the ID card.
If the ID card matches the trust rules, AWS gives the workflow a temporary visitor badge.
```

## What STS Means

STS means AWS Security Token Service.

STS issues temporary AWS credentials.

Temporary credentials include:

```text
Access key ID
Secret access key
Session token
Expiration time
```

Important:

```text
STS credentials are short-lived.
They are not permanent IAM user access keys.
```

## Who Does What

```text
GitHub Actions:
  Runs the workflow.

GitHub OIDC:
  Issues a signed identity token for the workflow.

AWS IAM OIDC provider:
  Tells AWS that token.actions.githubusercontent.com is a trusted identity provider.

AWS IAM role:
  Defines what trusted GitHub workflows can do.

Trust policy:
  Defines who can assume the role.

Permissions policy:
  Defines what the role can do after it is assumed.

AWS STS:
  Exchanges the valid GitHub OIDC token for temporary AWS credentials.

Terraform:
  Uses those temporary credentials to create/update AWS resources.
```

## Authentication vs Authorization

Authentication:

```text
Who are you?
```

In this setup:

```text
GitHub OIDC token proves the workflow identity.
```

Authorization:

```text
What are you allowed to do?
```

In this setup:

```text
IAM role permissions define what Terraform can create/update/delete.
```

Analogy:

```text
Authentication = showing your ID card at the building entrance.
Authorization = which rooms your badge can open.
```

## What We Created

AWS OIDC provider:

```text
https://token.actions.githubusercontent.com
```

Audience:

```text
sts.amazonaws.com
```

IAM role:

```text
signalforge-github-actions-dev
```

AWS account:

```text
575108962419
```

GitHub repo:

```text
PraveenB19/signalforge-ai-ops-lab
```

GitHub environment:

```text
dev
```

## Why The AWS Console Wizard Was Confusing

The AWS role wizard asked for branch/environment input, but it produced this kind of incorrect `sub` value:

```text
repo:PraveenB19/signalforge-ai-ops-lab:ref:refs/heads/environment:dev
```

That means AWS interpreted `environment:dev` as a branch name.

But we wanted a GitHub Environment, not a branch.

Correct environment-based subject:

```text
repo:PraveenB19/signalforge-ai-ops-lab:environment:dev
```

Branch-based subject would look like:

```text
repo:PraveenB19/signalforge-ai-ops-lab:ref:refs/heads/dev
```

## Correct Trust Policy

The trust policy should restrict role assumption to this repo and GitHub environment:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::575108962419:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:PraveenB19/signalforge-ai-ops-lab:environment:dev"
        }
      }
    }
  ]
}
```

## Why This Is Secure

This trust policy says:

```text
Only GitHub Actions workflows from this specific repo,
using the dev GitHub Environment,
can assume this AWS role.
```

It does not allow:

```text
Other GitHub repos
Other GitHub users
Random branches without the dev environment
Long-lived AWS keys
```

## GitHub Workflow Requirement

For a workflow to use OIDC, it must include:

```yaml
permissions:
  id-token: write
  contents: read
```

Meaning:

```text
id-token: write:
  Allows GitHub Actions to request an OIDC token.

contents: read:
  Allows checkout to read the repo code.
```

The job should also specify:

```yaml
environment: dev
```

Why:

```text
The IAM trust policy expects environment:dev in the token subject.
If the workflow does not use the dev environment, AWS will reject the request.
```

## Same Account Environment Strategy

We can simulate multiple environments in the same AWS account.

Example:

```text
dev:
  signalforge-dev-vpc
  signalforge-dev-alb
  signalforge-dev-app

prod:
  signalforge-prod-vpc
  signalforge-prod-alb
  signalforge-prod-app
```

How we separate them:

```text
GitHub Environments:
  dev, prod

Terraform folders:
  infra/envs/dev
  infra/envs/prod

Terraform variables:
  environment = "dev"
  environment = "prod"

AWS tags:
  Environment = dev
  Environment = prod

IAM roles:
  signalforge-github-actions-dev
  signalforge-github-actions-prod
```

Production note:

```text
Real enterprises often use separate AWS accounts for dev, stage, and prod.
For this lab, same-account separation is acceptable for learning, but we still use naming, tags, and separate GitHub environments.
```

## Interview Explanation

Use this:

```text
We use GitHub OIDC to authenticate GitHub Actions to AWS without storing long-lived AWS access keys. GitHub issues an OIDC token for the workflow. AWS IAM validates the token through the GitHub OIDC provider and checks the role trust policy. If the repo and environment claims match, AWS STS issues short-lived credentials. Terraform then uses those temporary credentials to create infrastructure. The role is restricted to the SignalForge repo and dev environment, which follows least-privilege and reduces credential leakage risk.
```

## Common Troubleshooting

Issue:

```text
AWS says role cannot be assumed.
```

Check:

```text
Does workflow have permissions: id-token: write?
Does workflow use environment: dev?
Does trust policy sub equal repo:PraveenB19/signalforge-ai-ops-lab:environment:dev?
Does audience equal sts.amazonaws.com?
Is the OIDC provider URL token.actions.githubusercontent.com?
Is the role ARN correct in GitHub variables?
```

Issue:

```text
Console wizard creates ref:refs/heads/environment:dev.
```

Meaning:

```text
AWS treated environment:dev as a branch name.
```

Fix:

```text
Update the trust policy manually using JSON or AWS CLI.
```

