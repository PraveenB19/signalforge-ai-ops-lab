# SignalForge Dev Terraform Environment

This folder is the first Terraform environment for the lab.

Current goal:

```text
Plan the first VPC network boundary without applying it yet.
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
  Reads current AWS identity/region and calls the VPC module.

outputs.tf:
  Prints account, caller ARN, region, and name prefix.
```

Why start with plan-only:

```text
Planning shows exactly what Terraform would create before anything exists in
AWS. This is how we review infrastructure safely in CI.
```

Expected caller later from GitHub Actions:

```text
arn:aws:sts::575108962419:assumed-role/signalforge-github-actions-dev/...
```

Next after this works:

```text
1. Review VPC plan output.
2. Decide whether to add NAT Gateway now or later.
3. Add security groups.
4. Add ALB and EC2 app tier.
```
