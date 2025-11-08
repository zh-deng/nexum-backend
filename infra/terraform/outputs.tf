output "instance_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.backend_server.public_ip
}
