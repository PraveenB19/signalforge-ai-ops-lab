variable "bucket_name" {
  description = "Name of the S3 bucket used for application artifacts."
  type        = string
}

variable "force_destroy" {
  description = "Whether Terraform can delete the bucket even when it contains objects."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Common tags applied to artifact resources."
  type        = map(string)
  default     = {}
}
