###################
# DynamoDB Tables #
###################

# 1. Users Table
resource "aws_dynamodb_table" "users" {
  name           = "${local.project_name}-users"
  billing_mode   = "PAY_PER_REQUEST"  # On-demand pricing
  hash_key       = "userId"
  
  attribute {
    name = "userId"
    type = "S"
  }
  
  attribute {
    name = "email"
    type = "S"
  }
  
  global_secondary_index {
    name            = "EmailIndex"
    hash_key        = "email"
    projection_type = "ALL"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  server_side_encryption {
    enabled = true
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.project_name}-users"
  })
}

# 2. Organizations Table
resource "aws_dynamodb_table" "organizations" {
  name           = "${local.project_name}-organizations"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "orgId"
  
  attribute {
    name = "orgId"
    type = "S"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  server_side_encryption {
    enabled = true
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.project_name}-organizations"
  })
}

# 3. Memberships Table
resource "aws_dynamodb_table" "memberships" {
  name           = "${local.project_name}-memberships"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "membershipId"
  
  attribute {
    name = "membershipId"
    type = "S"
  }
  
  attribute {
    name = "orgId"
    type = "S"
  }
  
  attribute {
    name = "userId"
    type = "S"
  }
  
  global_secondary_index {
    name            = "OrgMembersIndex"
    hash_key        = "orgId"
    range_key       = "userId"
    projection_type = "ALL"
  }
  
  global_secondary_index {
    name            = "UserOrgsIndex"
    hash_key        = "userId"
    projection_type = "ALL"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  server_side_encryption {
    enabled = true
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.project_name}-memberships"
  })
}

# 4. Projects Table
resource "aws_dynamodb_table" "projects" {
  name           = "${local.project_name}-projects"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "projectId"
  
  attribute {
    name = "projectId"
    type = "S"
  }
  
  attribute {
    name = "orgId"
    type = "S"
  }
  
  attribute {
    name = "createdAt"
    type = "S"
  }
  
  global_secondary_index {
    name            = "OrgProjectsIndex"
    hash_key        = "orgId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  server_side_encryption {
    enabled = true
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.project_name}-projects"
  })
}

# 5. Wells Table
resource "aws_dynamodb_table" "wells" {
  name           = "${local.project_name}-wells"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "wellId"
  
  attribute {
    name = "wellId"
    type = "S"
  }
  
  attribute {
    name = "projectId"
    type = "S"
  }
  
  attribute {
    name = "orgId"
    type = "S"
  }
  
  attribute {
    name = "createdAt"
    type = "S"
  }
  
  attribute {
    name = "name"
    type = "S"
  }
  
  global_secondary_index {
    name            = "ProjectWellsIndex"
    hash_key        = "projectId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }
  
  global_secondary_index {
    name            = "OrgWellsIndex"
    hash_key        = "orgId"
    range_key       = "name"
    projection_type = "ALL"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  server_side_encryption {
    enabled = true
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.project_name}-wells"
  })
}

# 6. Stages Table
resource "aws_dynamodb_table" "stages" {
  name           = "${local.project_name}-stages"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "stageId"
  
  attribute {
    name = "stageId"
    type = "S"
  }
  
  attribute {
    name = "wellId"
    type = "S"
  }
  
  attribute {
    name = "order"
    type = "N"
  }
  
  global_secondary_index {
    name            = "WellStagesIndex"
    hash_key        = "wellId"
    range_key       = "order"
    projection_type = "ALL"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  server_side_encryption {
    enabled = true
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.project_name}-stages"
  })
}

# 7. Events Table
resource "aws_dynamodb_table" "events" {
  name           = "${local.project_name}-events"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "eventId"
  
  attribute {
    name = "eventId"
    type = "S"
  }
  
  attribute {
    name = "wellId"
    type = "S"
  }
  
  attribute {
    name = "stageId"
    type = "S"
  }
  
  attribute {
    name = "startTime"
    type = "S"
  }
  
  global_secondary_index {
    name            = "WellEventsIndex"
    hash_key        = "wellId"
    range_key       = "startTime"
    projection_type = "ALL"
  }
  
  global_secondary_index {
    name            = "StageEventsIndex"
    hash_key        = "stageId"
    range_key       = "startTime"
    projection_type = "ALL"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  server_side_encryption {
    enabled = true
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.project_name}-events"
  })
}

# 8. Files Table
resource "aws_dynamodb_table" "files" {
  name           = "${local.project_name}-files"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "fileId"
  
  attribute {
    name = "fileId"
    type = "S"
  }
  
  attribute {
    name = "wellId"
    type = "S"
  }
  
  attribute {
    name = "stageId"
    type = "S"
  }
  
  attribute {
    name = "orgId"
    type = "S"
  }
  
  attribute {
    name = "uploadedAt"
    type = "S"
  }
  
  global_secondary_index {
    name            = "WellFilesIndex"
    hash_key        = "wellId"
    range_key       = "uploadedAt"
    projection_type = "ALL"
  }
  
  global_secondary_index {
    name            = "StageFilesIndex"
    hash_key        = "stageId"
    range_key       = "uploadedAt"
    projection_type = "ALL"
  }
  
  global_secondary_index {
    name            = "OrgFilesIndex"
    hash_key        = "orgId"
    range_key       = "uploadedAt"
    projection_type = "ALL"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  server_side_encryption {
    enabled = true
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.project_name}-files"
  })
}

# 9. AuditLog Table
resource "aws_dynamodb_table" "audit_log" {
  name           = "${local.project_name}-audit-log"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "logId"
  
  attribute {
    name = "logId"
    type = "S"
  }
  
  attribute {
    name = "entityId"
    type = "S"
  }
  
  attribute {
    name = "userId"
    type = "S"
  }
  
  attribute {
    name = "timestamp"
    type = "S"
  }
  
  global_secondary_index {
    name            = "EntityHistoryIndex"
    hash_key        = "entityId"
    range_key       = "timestamp"
    projection_type = "ALL"
  }
  
  global_secondary_index {
    name            = "UserActivityIndex"
    hash_key        = "userId"
    range_key       = "timestamp"
    projection_type = "ALL"
  }
  
  # TTL for auto-deletion of old logs (optional, 90 days)
  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  server_side_encryption {
    enabled = true
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.project_name}-audit-log"
  })
}
