variable "name_prefix" {
  description = "Prefix used for security group names."
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where security groups will be created."
  type        = string
}

variable "app_port" {
  description = "Port where the Java application listens."
  type        = number
  default     = 8080
}

variable "database_port" {
  description = "Database port allowed from the app security group."
  type        = number
  default     = 5432
}

variable "tags" {
  description = "Common tags applied to security groups."
  type        = map(string)
  default     = {}
}
