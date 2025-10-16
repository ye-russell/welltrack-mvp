// ============================================
// WellTrack MVP — DynamoDB Client
// ============================================

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
  BatchGetCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';

// ---------------
// Client Configuration
// ---------------

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      }
    : undefined, // Use IAM role if running on AWS
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true, // Remove undefined values from objects
    convertEmptyValues: false,
  },
  unmarshallOptions: {
    wrapNumbers: false, // Return numbers as numbers, not BigInt
  },
});

// ---------------
// Table Names
// ---------------

export const TABLES = {
  USERS: process.env.DYNAMODB_TABLE_USERS || 'welltrack-dev-users',
  ORGANIZATIONS: process.env.DYNAMODB_TABLE_ORGANIZATIONS || 'welltrack-dev-organizations',
  MEMBERSHIPS: process.env.DYNAMODB_TABLE_MEMBERSHIPS || 'welltrack-dev-memberships',
  PROJECTS: process.env.DYNAMODB_TABLE_PROJECTS || 'welltrack-dev-projects',
  WELLS: process.env.DYNAMODB_TABLE_WELLS || 'welltrack-dev-wells',
  STAGES: process.env.DYNAMODB_TABLE_STAGES || 'welltrack-dev-stages',
  EVENTS: process.env.DYNAMODB_TABLE_EVENTS || 'welltrack-dev-events',
  FILES: process.env.DYNAMODB_TABLE_FILES || 'welltrack-dev-files',
  AUDIT_LOG: process.env.DYNAMODB_TABLE_AUDIT_LOG || 'welltrack-dev-audit-log',
} as const;

// ---------------
// Generic CRUD Operations
// ---------------

export async function getItem<T = any>(
  tableName: string,
  key: Record<string, any>
): Promise<T | null> {
  const command = new GetCommand({
    TableName: tableName,
    Key: key,
  });

  const response = await docClient.send(command);
  return (response.Item as T) || null;
}

export async function putItem<T = any>(
  tableName: string,
  item: T
): Promise<T> {
  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  });

  await docClient.send(command);
  return item;
}

export async function updateItem<T = any>(
  tableName: string,
  key: Record<string, any>,
  updates: Record<string, any>
): Promise<T> {
  // Build update expression dynamically
  const updateExpressionParts: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  Object.entries(updates).forEach(([field, value], index) => {
    const nameKey = `#field${index}`;
    const valueKey = `:value${index}`;
    
    updateExpressionParts.push(`${nameKey} = ${valueKey}`);
    expressionAttributeNames[nameKey] = field;
    expressionAttributeValues[valueKey] = value;
  });

  const command = new UpdateCommand({
    TableName: tableName,
    Key: key,
    UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });

  const response = await docClient.send(command);
  return response.Attributes as T;
}

export async function deleteItem(
  tableName: string,
  key: Record<string, any>
): Promise<void> {
  const command = new DeleteCommand({
    TableName: tableName,
    Key: key,
  });

  await docClient.send(command);
}

export async function queryItems<T = any>(
  tableName: string,
  indexName: string | undefined,
  keyConditionExpression: string,
  expressionAttributeNames?: Record<string, string>,
  expressionAttributeValues?: Record<string, any>,
  limit?: number,
  exclusiveStartKey?: Record<string, any>
): Promise<{ items: T[]; lastEvaluatedKey?: Record<string, any> }> {
  const command = new QueryCommand({
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    Limit: limit,
    ExclusiveStartKey: exclusiveStartKey,
  });

  const response = await docClient.send(command);
  
  return {
    items: (response.Items as T[]) || [],
    lastEvaluatedKey: response.LastEvaluatedKey,
  };
}

export async function scanItems<T = any>(
  tableName: string,
  filterExpression?: string,
  expressionAttributeNames?: Record<string, string>,
  expressionAttributeValues?: Record<string, any>,
  limit?: number
): Promise<T[]> {
  const command = new ScanCommand({
    TableName: tableName,
    FilterExpression: filterExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    Limit: limit,
  });

  const response = await docClient.send(command);
  return (response.Items as T[]) || [];
}

// ---------------
// Batch Operations
// ---------------

export async function batchGetItems<T = any>(
  requests: Array<{ tableName: string; keys: Record<string, any>[] }>
): Promise<Record<string, T[]>> {
  const requestItems: Record<string, any> = {};
  
  requests.forEach(({ tableName, keys }) => {
    requestItems[tableName] = {
      Keys: keys,
    };
  });

  const command = new BatchGetCommand({
    RequestItems: requestItems,
  });

  const response = await docClient.send(command);
  
  const result: Record<string, T[]> = {};
  if (response.Responses) {
    Object.entries(response.Responses).forEach(([tableName, items]) => {
      result[tableName] = items as T[];
    });
  }
  
  return result;
}

// ---------------
// Helper Functions
// ---------------

export function createTimestamps() {
  const now = new Date().toISOString();
  return {
    createdAt: now,
    updatedAt: now,
  };
}

export function updateTimestamp() {
  return {
    updatedAt: new Date().toISOString(),
  };
}

// ---------------
// Transaction Support (Optional)
// ---------------

// For complex multi-table operations, you can use TransactWriteCommand
// Example usage would be implemented in specific service functions
