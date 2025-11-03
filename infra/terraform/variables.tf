variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "eu-central-1" # Frankfurt
}

variable "instance_type" {
  description = "Type of EC2 instance"
  type        = string
  default     = "t2.micro" # Free tier eligible
}
