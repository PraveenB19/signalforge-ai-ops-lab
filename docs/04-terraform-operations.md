# Terraform Operations

## Backend Strategy

We will use S3 for Terraform state and modern S3 lockfiles for state locking.

Example backend:

```hcl
terraform {
  backend "s3" {
    bucket       = "signalforge-terraform-state"
    key          = "dev/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}
```

Important:

- S3 bucket versioning should be enabled.
- S3 bucket encryption should be enabled.
- Public access should be blocked.
- Access should be limited to the Terraform role.
- Each environment should use a separate state key.

## Why Not DynamoDB Locking?

Older Terraform S3 backends used DynamoDB for state locking.

Modern Terraform supports S3 native lockfiles using `use_lockfile = true`. HashiCorp now marks DynamoDB-based locking as deprecated for the S3 backend, so this project uses S3 lockfiles.

## Environment Layout

```text
infra/
  envs/
    dev/
      backend.tf
      main.tf
      terraform.tfvars
    stage/
      backend.tf
      main.tf
      terraform.tfvars
    prod/
      backend.tf
      main.tf
      terraform.tfvars
  modules/
    vpc/
    alb/
    ec2/
    rds/
    monitoring/
    iam/
```

## Drift Detection

Drift means real AWS resources no longer match Terraform state/code.

Examples:

- Someone manually opened a security group.
- Someone changed EC2 instance size.
- Someone deleted a route table.
- Someone modified an ALB listener.
- Someone changed RDS settings.

Commands:

```bash
terraform plan
terraform plan -refresh-only
terraform apply -refresh-only
terraform state list
terraform state show <resource>
terraform import <resource> <id>
```

Drift workflow:

```text
Scheduled GitHub Action runs terraform plan
If plan shows changes, send Slack alert
Do not auto-apply production drift
Human reviews
Either revert AWS manual change or update Terraform code
```

## Staging Works But Production Fails

Common reasons:

- Different variable values
- Missing prod GitHub environment secret
- Prod IAM role has stricter permissions
- Prod VPC/subnet CIDR conflict
- AWS service quota hit
- Different AMI availability
- Manual drift in prod
- Wrong Terraform backend key
- Missing ACM certificate or Route 53 zone
- Security group stricter in prod

Handling strategy:

```text
Use the same modules for all environments
Keep only tfvars different
Run fmt, validate, tflint, and Trivy before plan
Run plan before apply
Require manual approval for prod
Compare stage and prod plans
Use least privilege but verify required permissions
Never skip state locking
```

