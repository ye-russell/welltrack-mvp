######################
# S3 Bucket for Files #
######################

# Generate unique bucket name if not provided
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

locals {
  s3_bucket_name = var.s3_bucket_name != "" ? var.s3_bucket_name : "${local.project_name}-files-${random_id.bucket_suffix.hex}"
}

resource "aws_s3_bucket" "files" {
  bucket = local.s3_bucket_name
  
  tags = merge(local.common_tags, {
    Name = local.s3_bucket_name
  })
}

# Enable versioning for file recovery
resource "aws_s3_bucket_versioning" "files" {
  bucket = aws_s3_bucket.files.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

# Enable encryption at rest
resource "aws_s3_bucket_server_side_encryption_configuration" "files" {
  bucket = aws_s3_bucket.files.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "files" {
  bucket = aws_s3_bucket.files.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CORS configuration for direct uploads from browser
resource "aws_s3_bucket_cors_configuration" "files" {
  bucket = aws_s3_bucket.files.id
  
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["http://localhost:3000", "https://*.vercel.app"]  # Update with your domains
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Lifecycle policy to move old files to cheaper storage
resource "aws_s3_bucket_lifecycle_configuration" "files" {
  bucket = aws_s3_bucket.files.id
  
  rule {
    id     = "archive-old-files"
    status = "Enabled"
    
    transition {
      days          = 90
      storage_class = "STANDARD_IA"  # Infrequent Access
    }
    
    transition {
      days          = 365
      storage_class = "GLACIER_IR"  # Glacier Instant Retrieval
    }
  }
}
