locals {
  name_prefix = "${var.project_name}-${var.environment}"

  common_tags = {
    Project     = "SignalForge AI Ops Lab"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Repository  = "PraveenB19/signalforge-ai-ops-lab"
  }
}
