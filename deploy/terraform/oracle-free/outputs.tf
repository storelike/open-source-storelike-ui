output "instance_public_ip" {
  description = "Public IP of the AIKit server"
  value       = oci_core_instance.aikit.public_ip
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh ubuntu@${oci_core_instance.aikit.public_ip}"
}
