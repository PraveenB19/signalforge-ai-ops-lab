# SignalForge Dev Terraform Environment

This folder is the first Terraform environment for the lab.

Current goal:

```text
Prove Terraform can initialize against the S3 backend and read AWS identity
through the GitHub OIDC role before we create real infrastructure.
```

Current files:

```text
backend.tf:
  Uses the S3 state bucket and S3 lockfile.

providers.tf:
  Configures Terraform and the AWS provider.

variables.tf:
  Defines beginner-friendly inputs.

locals.tf:
  Builds naming and common tags.

main.tf:
  Reads current AWS identity and region.

outputs.tf:
  Prints account, caller ARN, region, and name prefix.
```

Why start with data sources:

```text
Data sources read information.
They do not create AWS resources.
This is a safe first Terraform test after OIDC.
```

Expected caller later from GitHub Actions:

```text
arn:aws:sts::575108962419:assumed-role/signalforge-github-actions-dev/...
```

Next after this works:

```text
1. Add VPC module.
2. Add public/private subnets.
3. Add route tables and internet gateway.
4. Add security groups.
5. Add ALB and EC2 app tier.
```
