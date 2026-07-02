variable "name_prefix" {
  description = "Prefix used for compute resources."
  type        = string
}

variable "private_subnet_ids" {
  description = "Private application subnet IDs for the Auto Scaling group."
  type        = list(string)
}

variable "app_security_group_id" {
  description = "Security group ID attached to app instances."
  type        = string
}

variable "instance_profile_name" {
  description = "IAM instance profile attached to app instances."
  type        = string
}

variable "target_group_arns" {
  description = "ALB target group ARNs attached to the Auto Scaling group."
  type        = list(string)
}

variable "instance_type" {
  description = "EC2 instance type for app instances."
  type        = string
  default     = "t3.micro"
}

variable "app_port" {
  description = "Port exposed by the app instances."
  type        = number
  default     = 8080
}

variable "desired_capacity" {
  description = "Desired number of app instances."
  type        = number
  default     = 2
}

variable "min_size" {
  description = "Minimum number of app instances."
  type        = number
  default     = 2
}

variable "max_size" {
  description = "Maximum number of app instances."
  type        = number
  default     = 3
}

variable "tags" {
  description = "Common tags applied to compute resources."
  type        = map(string)
  default     = {}
}
