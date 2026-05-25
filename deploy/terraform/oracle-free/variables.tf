variable "tenancy_ocid" {
  description = "OCI tenancy OCID"
  type        = string
}

variable "user_ocid" {
  description = "OCI user OCID"
  type        = string
}

variable "fingerprint" {
  description = "OCI API key fingerprint"
  type        = string
}

variable "private_key_path" {
  description = "Path to OCI API private key"
  type        = string
}

variable "region" {
  description = "OCI region"
  type        = string
  default     = "eu-frankfurt-1"
}

variable "ssh_public_key" {
  description = "SSH public key for instance access"
  type        = string
}

variable "domain" {
  description = "Public domain name for TLS"
  type        = string
}

variable "anthropic_api_key" {
  description = "Anthropic API key"
  type        = string
  sensitive   = true
}

variable "telegram_bot_token" {
  description = "Telegram bot token"
  type        = string
  sensitive   = true
}

variable "owner_chat_id" {
  description = "Telegram chat ID of the store owner"
  type        = string
}

variable "totp_secret" {
  description = "Base32-encoded TOTP secret"
  type        = string
  sensitive   = true
}

variable "session_secret" {
  description = "JWT session signing secret"
  type        = string
  sensitive   = true
}

variable "instance_ocpus" {
  description = "Number of OCPUs (max 4 for Always Free)"
  type        = number
  default     = 2
}

variable "instance_memory_gb" {
  description = "Memory in GB (max 24 for Always Free)"
  type        = number
  default     = 12
}
