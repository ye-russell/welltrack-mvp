terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # Uncomment for remote state storage
  # backend "s3" {
  #   bucket = "welltrack-terraform-state"
  #   key    = "mvp/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "WellTrack-MVP"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Local variables
locals {
  project_name = "welltrack-${var.environment}"
  
  common_tags = {
    Project     = "WellTrack-MVP"
    Environment = var.environment
  }
}
