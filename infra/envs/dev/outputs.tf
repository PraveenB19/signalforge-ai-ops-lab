output "account_id" {
  description = "AWS account Terraform is authenticated to."
  value       = data.aws_caller_identity.current.account_id
}

output "caller_arn" {
  description = "AWS caller ARN used by Terraform."
  value       = data.aws_caller_identity.current.arn
}

output "region" {
  description = "AWS region Terraform is using."
  value       = data.aws_region.current.region
}

output "name_prefix" {
  description = "Prefix that future dev resources will use."
  value       = local.name_prefix
}
