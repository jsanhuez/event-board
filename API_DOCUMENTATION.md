# Event Board - GraphQL API Documentation

## Overview

All GraphQL operations are available through the **Apollo Gateway** at:
```
POST http://localhost:4000/graphql
```

Include JWT token in Authorization header:
```
Authorization: Bearer <accessToken>
```

## Authentication Operations

### Register User

Create a new user account.

**Endpoint**: `POST http://localhost:4000/graphql`

**Mutation**:
```graphql
mutation {
  register(input: {
    email: "user@example.com"
    name: "John Doe"
    password: "securePassword123"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      name
    }
  }
}
```

**Response**:
```json
{
  "data": {
    "register": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "user": {
        "id": "507f1f77bcf86cd799439011",
        "email": "user@example.com",
        "name": "John Doe"
      }
    }
  }
}
```

**Notes**:
- Password must be at least 6 characters
- Email must be unique
- Returns JWT tokens for authentication

---

### Login User

Authenticate and obtain JWT tokens.

**Mutation**:
```graphql
mutation {
  login(input: {
    email: "user@example.com"
    password: "securePassword123"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      name
    }
  }
}
```

**Response**:
```json
{
  "data": {
    "login": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "user": {
        "id": "507f1f77bcf86cd799439011",
        "email": "user@example.com",
        "name": "John Doe"
      }
    }
  }
}
```

**Error Responses**:
```json
{
  "errors": [
    {
      "message": "Invalid credentials"
    }
  ]
}
```

**Notes**:
- Access token expires after 1 hour
- Refresh token expires after 7 days
- Store accessToken in sessionStorage
- Store refreshToken in HTTP-only cookie

---

## Event Operations

### List All Events

Retrieve all events with optional filtering.

**No authentication required**

**Query**:
```graphql
query {
  events {
    _id
    title
    description
    date
    location
    category
    organizer
    status
    createdAt
    updatedAt
  }
}
```

**Response**:
```json
{
  "data": {
    "events": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "TypeScript Workshop",
        "description": "Learn advanced TypeScript",
        "date": "2026-03-15T10:00:00Z",
        "location": "Room 3",
        "category": "workshop",
        "organizer": "John Doe",
        "status": "confirmed",
        "createdAt": "2026-02-18T10:00:00Z",
        "updatedAt": "2026-02-18T10:00:00Z"
      }
    ]
  }
}
```

---

### List Events with Filters

Filter events by category and/or status.

**Query**:
```graphql
query {
  events(filter: {
    category: "workshop"
    status: "confirmed"
  }) {
    _id
    title
    category
    status
  }
}
```

**Available Filters**:
- `category`: "workshop" | "meetup" | "talk" | "social"
- `status`: "draft" | "confirmed" | "cancelled"
- `organizer`: string

**Example** - Filter by category only:
```graphql
query {
  events(filter: { category: "workshop" }) {
    _id
    title
  }
}
```

**Example** - Filter by status only:
```graphql
query {
  events(filter: { status: "confirmed" }) {
    _id
    title
  }
}
```

**Example** - Filter by organizer:
```graphql
query {
  events(filter: { organizer: "John Doe" }) {
    _id
    title
    organizer
  }
}
```

---

### Get Single Event

Retrieve a specific event by ID.

**No authentication required**

**Query**:
```graphql
query {
  event(id: "507f1f77bcf86cd799439011") {
    _id
    title
    description
    date
    location
    category
    organizer
    status
    createdAt
    updatedAt
  }
}
```

**Response**:
```json
{
  "data": {
    "event": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "TypeScript Workshop",
      "description": "Learn advanced TypeScript patterns and best practices",
      "date": "2026-03-15T10:00:00Z",
      "location": "Room 3",
      "category": "workshop",
      "organizer": "John Doe",
      "status": "confirmed",
      "createdAt": "2026-02-18T10:00:00Z",
      "updatedAt": "2026-02-18T10:00:00Z"
    }
  }
}
```

**Error Response** (not found):
```json
{
  "data": {
    "event": null
  }
}
```

---

### Create Event

Create a new event. **Requires authentication**.

**Mutation**:
```graphql
mutation {
  createEvent(input: {
    title: "React Masterclass"
    description: "Advanced React patterns and hooks"
    date: "2026-04-10T14:00:00Z"
    location: "Virtual"
    category: "talk"
    organizer: "Jane Smith"
    status: "confirmed"
  }) {
    _id
    title
    description
    date
    location
    category
    organizer
    status
    createdAt
    updatedAt
  }
}
```

**Response**:
```json
{
  "data": {
    "createEvent": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "React Masterclass",
      "description": "Advanced React patterns and hooks",
      "date": "2026-04-10T14:00:00Z",
      "location": "Virtual",
      "category": "talk",
      "organizer": "Jane Smith",
      "status": "confirmed",
      "createdAt": "2026-02-18T11:30:00Z",
      "updatedAt": "2026-02-18T11:30:00Z"
    }
  }
}
```

**Required Fields**:
- `title` (string, max 100 chars)
- `description` (string)
- `date` (ISO 8601 datetime)
- `location` (string)
- `category` (enum: "workshop" | "meetup" | "talk" | "social")
- `organizer` (string)

**Optional Fields**:
- `status` (enum: "draft" | "confirmed" | "cancelled", default: "draft")

**Error Response** (invalid input):
```json
{
  "errors": [
    {
      "message": "Unauthorized"
    }
  ]
}
```

**Notes**:
- Requires valid JWT token
- Returns newly created event with MongoDB ID

---

### Update Event

Update an existing event. **Requires authentication**.

**Mutation**:
```graphql
mutation {
  updateEvent(input: {
    id: "507f1f77bcf86cd799439011"
    title: "Updated Workshop Title"
    status: "confirmed"
  }) {
    _id
    title
    description
    date
    location
    category
    organizer
    status
    updatedAt
  }
}
```

**Response**:
```json
{
  "data": {
    "updateEvent": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Updated Workshop Title",
      "description": "Learn advanced TypeScript",
      "date": "2026-03-15T10:00:00Z",
      "location": "Room 3",
      "category": "workshop",
      "organizer": "John Doe",
      "status": "confirmed",
      "updatedAt": "2026-02-18T12:00:00Z"
    }
  }
}
```

**Optional Fields** (all fields can be updated individually):
- `title`
- `description`
- `date`
- `location`
- `category`
- `organizer`
- `status`

**Example** - Update only status:
```graphql
mutation {
  updateEvent(input: {
    id: "507f1f77bcf86cd799439011"
    status: "cancelled"
  }) {
    _id
    status
  }
}
```

**Required Field**:
- `id` (string - MongoDB ObjectId)

**Notes**:
- Requires valid JWT token
- Only provided fields are updated
- `updatedAt` timestamp automatically refreshed

---

### Delete Event

Delete an event. **Requires authentication**.

**Mutation**:
```graphql
mutation {
  deleteEvent(id: "507f1f77bcf86cd799439011") {
    _id
    title
  }
}
```

**Response**:
```json
{
  "data": {
    "deleteEvent": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "TypeScript Workshop"
    }
  }
}
```

**Error Response** (event not found):
```json
{
  "data": {
    "deleteEvent": null
  }
}
```

**Notes**:
- Requires valid JWT token
- Returns deleted event data
- Event is permanently removed from database

---

## User Operations

### Get User

Retrieve user information by ID.

**Query**:
```graphql
query {
  user(id: "507f1f77bcf86cd799439011") {
    id
    email
    name
  }
}
```

**Response**:
```json
{
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

---

### Update User

Update user profile information. **Requires authentication**.

**Mutation**:
```graphql
mutation {
  updateUser(input: {
    id: "507f1f77bcf86cd799439011"
    name: "Jane Doe"
    email: "janedoe@example.com"
  }) {
    id
    email
    name
  }
}
```

**Response**:
```json
{
  "data": {
    "updateUser": {
      "id": "507f1f77bcf86cd799439011",
      "email": "janedoe@example.com",
      "name": "Jane Doe"
    }
  }
}
```

**Optional Fields**:
- `name` (string)
- `email` (string, must be unique)

**Notes**:
- Requires valid JWT token
- Only provided fields are updated

---

## Error Handling

### Common Error Responses

**Authentication Error**:
```json
{
  "errors": [
    {
      "message": "Unauthorized"
    }
  ]
}
```

**Validation Error**:
```json
{
  "errors": [
    {
      "message": "Bad Request Exception",
      "extensions": {
        "invalidFields": ["title", "description"]
      }
    }
  ]
}
```

**Not Found**:
```json
{
  "data": {
    "event": null
  }
}
```

**Invalid Input**:
```json
{
  "errors": [
    {
      "message": "Email already registered"
    }
  ]
}
```

---

## Testing in GraphQL Playground

### 1. Access GraphQL Endpoint
```
http://localhost:4000/graphql
```

### 2. Set Authentication Header
In the bottom left, click "HTTP Headers" and add:
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN_HERE"
}
```

### 3. Write and Run Queries/Mutations
- Copy queries from documentation above
- Replace placeholders with actual values
- Click play button to execute

### 4. View Results
- Check "Data" tab for response data
- Check "Errors" tab for any errors
- Check "Network" tab for request details

---

## Common Use Cases

### Complete User Flow

1. **Register**:
   ```graphql
   mutation { register(input: {...}) { accessToken user {...} } }
   ```

2. **Store Tokens**:
   - sessionStorage.setItem('accessToken', accessToken)
   - cookies.set('refreshToken', refreshToken)

3. **Set Auth Header**:
   ```javascript
   headers: { Authorization: `Bearer ${accessToken}` }
   ```

4. **Create Event**:
   ```graphql
   mutation { createEvent(input: {...}) { _id ... } }
   ```

5. **Fetch Events**:
   ```graphql
   query { events { _id title ... } }
   ```

---

## Rate Limiting

Current setup does not include rate limiting. To add:
- Update API Gateway middleware
- Implement using `@nestjs/throttler`
- Configure limits per endpoint

---

## Pagination

Not currently implemented. To add:
- Add `skip` and `take` parameters to queries
- Update service to respect limits
- Example: `events(skip: 0, take: 10)`

---

## Subscriptions

GraphQL Subscriptions (WebSocket) not currently enabled. Can be added with:
- Apollo Subscriptions
- GraphQL subscriptions package
- WebSocket server configuration

---

## Schema Information

For complete schema documentation:
1. Open http://localhost:4000/graphql
2. Click "Schema" button (right side)
3. Browse full type definitions and documentation

---

**Last Updated**: February 18, 2026
**API Version**: 1.0.0
