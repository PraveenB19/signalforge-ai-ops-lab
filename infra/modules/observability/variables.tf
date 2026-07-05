variable "name_prefix" {
  description = "Prefix used for observability resources."
  type        = string
}

variable "aws_region" {
  description = "AWS region used by CloudWatch dashboard widgets."
  type        = string
}

variable "vpc_id" {
  description = "VPC ID for VPC Flow Logs."
  type        = string
}

variable "alb_arn_suffix" {
  description = "ALB ARN suffix for CloudWatch dimensions."
  type        = string
}

variable "target_group_arn_suffix" {
  description = "Target group ARN suffix for CloudWatch dimensions."
  type        = string
}

variable "autoscaling_group_name" {
  description = "Auto Scaling group name for CloudWatch alarms."
  type        = string
}

variable "tags" {
  description = "Common tags applied to observability resources."
  type        = map(string)
  default     = {}
}
