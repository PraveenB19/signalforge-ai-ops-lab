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

output "vpc_id" {
  description = "Planned VPC ID after apply."
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "Planned public subnet IDs after apply."
  value       = module.vpc.public_subnet_ids
}

output "private_app_subnet_ids" {
  description = "Planned private app subnet IDs after apply."
  value       = module.vpc.private_app_subnet_ids
}

output "private_db_subnet_ids" {
  description = "Planned private DB subnet IDs after apply."
  value       = module.vpc.private_db_subnet_ids
}
