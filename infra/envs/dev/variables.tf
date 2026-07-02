variable "aws_region" {
  description = "AWS region for the dev environment."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name used for tags and resource naming."
  type        = string
  default     = "signalforge"
}

variable "vpc_cidr" {
  description = "CIDR block for the dev VPC."
  type        = string
  default     = "10.20.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets."
  type        = list(string)
  default     = ["10.20.1.0/24", "10.20.2.0/24"]
}

variable "private_app_subnet_cidrs" {
  description = "CIDR blocks for private app subnets."
  type        = list(string)
  default     = ["10.20.11.0/24", "10.20.12.0/24"]
}

variable "private_db_subnet_cidrs" {
  description = "CIDR blocks for private database subnets."
  type        = list(string)
  default     = ["10.20.21.0/24", "10.20.22.0/24"]
}

variable "enable_nat_gateway" {
  description = "Whether dev private app subnets should route outbound internet traffic through a NAT gateway."
  type        = bool
  default     = true
}

variable "app_port" {
  description = "Port where the SignalForge application listens."
  type        = number
  default     = 8080
}

variable "database_port" {
  description = "Database port allowed from app instances."
  type        = number
  default     = 5432
}

variable "app_instance_type" {
  description = "EC2 instance type for dev app instances."
  type        = string
  default     = "t3.micro"
}

variable "app_desired_capacity" {
  description = "Desired number of dev app instances."
  type        = number
  default     = 2
}

variable "app_min_size" {
  description = "Minimum number of dev app instances."
  type        = number
  default     = 2
}

variable "app_max_size" {
  description = "Maximum number of dev app instances."
  type        = number
  default     = 3
}
