data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

data "aws_availability_zones" "available" {
  state = "available"
}

module "vpc" {
  source = "../../modules/vpc"

  name_prefix              = local.name_prefix
  vpc_cidr                 = var.vpc_cidr
  availability_zones       = slice(data.aws_availability_zones.available.names, 0, 2)
  public_subnet_cidrs      = var.public_subnet_cidrs
  private_app_subnet_cidrs = var.private_app_subnet_cidrs
  private_db_subnet_cidrs  = var.private_db_subnet_cidrs
  enable_nat_gateway       = var.enable_nat_gateway
  tags                     = local.common_tags
}

module "artifacts" {
  source = "../../modules/artifacts"

  bucket_name   = "${var.project_name}-${var.environment}-artifacts-${data.aws_caller_identity.current.account_id}-${data.aws_region.current.region}"
  force_destroy = true
  tags          = local.common_tags
}

module "security_groups" {
  source = "../../modules/security-groups"

  name_prefix   = local.name_prefix
  vpc_id        = module.vpc.vpc_id
  app_port      = var.app_port
  database_port = var.database_port
  tags          = local.common_tags
}

module "iam" {
  source = "../../modules/iam"

  name_prefix         = local.name_prefix
  artifact_bucket_arn = module.artifacts.bucket_arn
  tags                = local.common_tags
}

module "alb" {
  source = "../../modules/alb"

  name_prefix           = local.name_prefix
  vpc_id                = module.vpc.vpc_id
  public_subnet_ids     = module.vpc.public_subnet_ids
  alb_security_group_id = module.security_groups.alb_security_group_id
  target_port           = var.app_port
  health_check_path     = "/actuator/health"
  tags                  = local.common_tags
}

module "compute" {
  source = "../../modules/compute"

  name_prefix           = local.name_prefix
  private_subnet_ids    = module.vpc.private_app_subnet_ids
  app_security_group_id = module.security_groups.app_security_group_id
  instance_profile_name = module.iam.ec2_instance_profile_name
  target_group_arns     = [module.alb.target_group_arn]
  instance_type         = var.app_instance_type
  app_port              = var.app_port
  desired_capacity      = var.app_desired_capacity
  min_size              = var.app_min_size
  max_size              = var.app_max_size
  tags                  = local.common_tags
}
