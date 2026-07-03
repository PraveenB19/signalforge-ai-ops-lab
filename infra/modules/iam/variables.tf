variable "name_prefix" {
  description = "Prefix used for IAM resource names."
  type        = string
}

variable "artifact_bucket_arn" {
  description = "ARN of the artifact S3 bucket EC2 instances can read from."
  type        = string
}

variable "tags" {
  description = "Common tags applied to IAM resources."
  type        = map(string)
  default     = {}
}
