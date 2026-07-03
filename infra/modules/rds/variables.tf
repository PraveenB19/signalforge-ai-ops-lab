variable "name_prefix" {
  description = "Prefix used for database resources."
  type        = string
}

variable "private_db_subnet_ids" {
  description = "Private database subnet IDs for the DB subnet group."
  type        = list(string)
}

variable "db_security_group_id" {
  description = "Security group ID attached to the database."
  type        = string
}

variable "database_name" {
  description = "Initial database name."
  type        = string
  default     = "signalforge"
}

variable "database_username" {
  description = "Database admin username."
  type        = string
  default     = "signalforge_admin"
}

variable "instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t4g.micro"
}

variable "allocated_storage" {
  description = "Allocated storage in GB."
  type        = number
  default     = 20
}

variable "skip_final_snapshot" {
  description = "Whether to skip final snapshot on destroy."
  type        = bool
  default     = true
}

variable "tags" {
  description = "Common tags applied to RDS resources."
  type        = map(string)
  default     = {}
}
