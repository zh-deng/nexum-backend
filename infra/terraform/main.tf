resource "aws_instance" "backend_server" {
  ami           = "ami-0c55b159cbfafe1f0" # Ubuntu 22.04 in eu-central-1
  instance_type = var.instance_type

  tags = {
    Name = "BackendServer"
  }
}
