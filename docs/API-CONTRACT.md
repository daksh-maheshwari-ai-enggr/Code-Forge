# Code Forge — API Contract

Base URL: `/api/v1`

Stack: MERN + JavaScript

Authentication: `Authorization: Bearer <JWT>`

Roles:
- `USER`
- `AUTHOR`
- `ADMIN`

---

# Response Format

## Success

    {
      "success": true,
      "data": {}
    }

## Error

    {
      "success": false,
      "error": {
        "code": "ERROR_CODE",
        "message": "Message"
      }
    }

## Status Codes

| Status | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 204 | Success, no body |
| 400 | Bad request |
| 401 | Unauthenticated |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
| 500 | Server error |

---

# Authentication

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| POST | `/auth/register` | No | Public |
| POST | `/auth/login` | No | Public |
| GET | `/auth/me` | Yes | Any |
| POST | `/auth/logout` | Yes | Any |

## Register

`POST /auth/register`

### Request

    {
      "name": "Daksh",
      "email": "daksh@example.com",
      "password": "password123",
      "role": "AUTHOR"
    }

### Allowed Roles

- `USER`
- `AUTHOR`

### Rules

- `name`, `email`, `password`, and `role` are required.
- Email must be unique.
- Password must be bcrypt-hashed before storing.
- Public registration allows only `USER` or `AUTHOR`.
- `ADMIN` cannot be created through public registration.
- Backend must reject `role: "ADMIN"`.
- `ADMIN` accounts are created through seed data.

### Response

    {
      "success": true,
      "data": {
        "user": {
          "id": "user_id",
          "name": "Daksh",
          "email": "daksh@example.com",
          "role": "AUTHOR"
        },
        "token": "jwt_token"
      }
    }

### Errors

- `400` — Invalid input or invalid role
- `409` — Email already exists

---

## Login

`POST /auth/login`

### Request

    {
      "email": "daksh@example.com",
      "password": "password123"
    }

### Flow

    Email + Password
          ↓
      Find User
          ↓
    bcrypt.compare()
          ↓
     Generate JWT
          ↓
   Return User + JWT

### Response

Returns safe user object + JWT.

Password must never be returned.

### Errors

- `400` — Invalid input
- `401` — Invalid credentials

---

## Get Current User

`GET /auth/me`

Auth: Required

Returns the currently authenticated user.

---

## Logout

`POST /auth/logout`

Auth: Required

V1 removes the JWT on the client.

Server-side token revocation is not included in v1.

---

# Users

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/users/me` | Yes | Any |
| PATCH | `/users/me` | Yes | Any |
| PATCH | `/users/me/password` | Yes | Any |

## Update Profile

`PATCH /users/me`

    {
      "name": "Daksh Maheshwari",
      "bio": "Backend Developer",
      "avatarUrl": "https://..."
    }

## Change Password

`PATCH /users/me/password`

    {
      "currentPassword": "old",
      "newPassword": "newPassword123"
    }

---

# Admin Users

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/admin/users` | Yes | ADMIN |
| GET | `/admin/users/:userId` | Yes | ADMIN |
| PATCH | `/admin/users/:userId/role` | Yes | ADMIN |
| DELETE | `/admin/users/:userId` | Yes | ADMIN |

## Change User Role

`PATCH /admin/users/:userId/role`

### Request

    {
      "role": "AUTHOR"
    }

Allowed role changes:

    USER → AUTHOR
    AUTHOR → USER

Admin accounts are created through seed data.

---

# Categories

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/categories` | No | Public |
| POST | `/categories` | Yes | ADMIN |
| PATCH | `/categories/:categoryId` | Yes | ADMIN |
| DELETE | `/categories/:categoryId` | Yes | ADMIN |

---

# Tags

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/tags` | No | Public |
| POST | `/tags` | Yes | ADMIN |
| PATCH | `/tags/:tagId` | Yes | ADMIN |
| DELETE | `/tags/:tagId` | Yes | ADMIN |

---

# Articles

| Method | Endpoint | Auth | Role | Ownership |
|---|---|---|---|---|
| GET | `/articles` | No | Public | — |
| GET | `/articles/:articleId` | No | Public | — |
| POST | `/articles` | Yes | AUTHOR, ADMIN | — |
| PATCH | `/articles/:articleId` | Yes | AUTHOR, ADMIN | AUTHOR: own |
| DELETE | `/articles/:articleId` | Yes | AUTHOR, ADMIN | AUTHOR: own |
| GET | `/users/me/articles` | Yes | Any | Own |
| POST | `/articles/:articleId/submit` | Yes | AUTHOR, ADMIN | AUTHOR: own |

## List Query

    page
    limit
    search
    categoryId
    tag
    difficulty
    sortBy

## Create Article

`POST /articles`

    {
      "title": "Understanding Binary Search",
      "description": "Learn binary search",
      "content": "Article content",
      "categoryId": "category_id",
      "tagIds": ["tag_id"],
      "difficulty": "BEGINNER",
      "thumbnailUrl": "https://..."
    }

New article status:

    DRAFT

## Article Status Flow

    DRAFT
       ↓
    PENDING_REVIEW
       ↓
    APPROVED
       ↓
    PUBLISHED

Changes requested:

    PENDING_REVIEW
       ↓
    CHANGES_REQUESTED
       ↓
    AUTHOR EDITS
       ↓
    PENDING_REVIEW

Rejected:

    PENDING_REVIEW
       ↓
    REJECTED

---

# Article Quiz

Every article quiz contains:

- Exactly 3 questions
- Exactly 4 options per question
- Exactly 1 correct option per question

| Method | Endpoint | Auth | Role | Ownership |
|---|---|---|---|---|
| GET | `/articles/:articleId/quiz` | No | Public | — |
| POST | `/articles/:articleId/quiz` | Yes | AUTHOR, ADMIN | AUTHOR: article owner |
| PATCH | `/articles/:articleId/quiz` | Yes | AUTHOR, ADMIN | AUTHOR: article owner |
| POST | `/articles/:articleId/quiz/attempt` | Yes | Any | — |

Public quiz responses must never contain correct answers.

## Create Article Quiz

    {
      "questions": [
        {
          "questionText": "What is binary search?",
          "options": [
            "Searching",
            "Sorting",
            "Graph",
            "Hashing"
          ],
          "correctOptionIndex": 0,
          "explanation": "Binary search divides the search space."
        }
      ]
    }

## Attempt Article Quiz

    {
      "answers": [
        {
          "questionId": "question_id",
          "optionId": "option_id"
        }
      ]
    }

Score is calculated only by the backend.

---

# Standalone Quizzes

| Method | Endpoint | Auth | Role | Ownership |
|---|---|---|---|---|
| GET | `/quizzes` | No | Public | — |
| GET | `/quizzes/:quizId` | No | Public | — |
| POST | `/quizzes` | Yes | AUTHOR, ADMIN | — |
| PATCH | `/quizzes/:quizId` | Yes | AUTHOR, ADMIN | AUTHOR: own |
| DELETE | `/quizzes/:quizId` | Yes | AUTHOR, ADMIN | AUTHOR: own |

## Create Quiz

    {
      "title": "JavaScript Fundamentals",
      "description": "Test JavaScript knowledge",
      "categoryId": "category_id",
      "difficulty": "BEGINNER",
      "estimatedTimeMinutes": 10
    }

---

# Quiz Questions

| Method | Endpoint | Auth | Role | Ownership |
|---|---|---|---|---|
| POST | `/quizzes/:quizId/questions` | Yes | AUTHOR, ADMIN | AUTHOR: own |
| PATCH | `/quizzes/:quizId/questions/:questionId` | Yes | AUTHOR, ADMIN | AUTHOR: own |
| DELETE | `/quizzes/:quizId/questions/:questionId` | Yes | AUTHOR, ADMIN | AUTHOR: own |

## Question Body

    {
      "questionText": "What is a closure?",
      "options": [
        "A",
        "B",
        "C",
        "D"
      ],
      "correctOptionIndex": 1,
      "explanation": "Explanation"
    }

---

# Quiz Attempts

| Method | Endpoint | Auth | Role | Ownership |
|---|---|---|---|---|
| POST | `/quizzes/:quizId/attempts` | Yes | Any | — |
| POST | `/attempts/:attemptId/submit` | Yes | Any | Own |
| GET | `/attempts/:attemptId` | Yes | Any | Own; ADMIN any |
| GET | `/users/me/attempts` | Yes | Any | Own |

Attempt statuses:

    IN_PROGRESS
    COMPLETED

Completed attempts cannot be submitted again.

---

# Bookmarks

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/articles/:articleId/bookmark` | Yes |
| DELETE | `/articles/:articleId/bookmark` | Yes |
| GET | `/users/me/bookmarks` | Yes |

---

# Search

`GET /search`

## Query Parameters

    q
    type
    categoryId
    difficulty
    page
    limit

Allowed types:

    all
    article
    quiz

---

# Admin Moderation

| Method | Endpoint | Role |
|---|---|---|
| GET | `/admin/articles/pending` | ADMIN |
| GET | `/admin/articles/:articleId` | ADMIN |
| PATCH | `/admin/articles/:articleId/approve` | ADMIN |
| PATCH | `/admin/articles/:articleId/reject` | ADMIN |
| PATCH | `/admin/articles/:articleId/request-changes` | ADMIN |
| GET | `/admin/quizzes/pending` | ADMIN |
| GET | `/admin/quizzes/:quizId` | ADMIN |
| PATCH | `/admin/quizzes/:quizId/approve` | ADMIN |
| PATCH | `/admin/quizzes/:quizId/reject` | ADMIN |
| PATCH | `/admin/quizzes/:quizId/request-changes` | ADMIN |

## Reject / Request Changes

    {
      "feedback": "Please improve the explanation."
    }

---

# Notifications

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/notifications` | Yes |
| PATCH | `/notifications/:notificationId/read` | Yes, own |
| PATCH | `/notifications/read-all` | Yes |

---

# Dashboards

## User Dashboard

`GET /users/me/dashboard`

Auth: Required

## Author Dashboard

`GET /author/dashboard`

Auth: Required

Roles:

    AUTHOR
    ADMIN

## Admin Dashboard

`GET /admin/dashboard`

Auth: Required

Role:

    ADMIN

---

# Uploads

`POST /uploads`

Auth: Required

Content-Type:

    multipart/form-data

Field:

    file

---

# Middleware & Authorization

## Authentication Middleware

Every protected endpoint uses:

    authMiddleware

Flow:

    Request
       ↓
    Read Authorization header
       ↓
    Extract Bearer token
       ↓
    jwt.verify()
       ↓
    Set req.user
       ↓
    next()

`req.user`:

    {
      userId,
      role
    }

Missing or invalid token:

    401 Unauthorized

---

## Role Middleware

Role checking happens after authentication.

Example:

    authMiddleware
          ↓
    requireRole("ADMIN")
          ↓
       Controller

Insufficient role:

    403 Forbidden

Supported roles:

    USER
    AUTHOR
    ADMIN

---

# Ownership Rules

AUTHOR can modify only content where:

    content.author === req.user.userId

ADMIN can manage any content.

Users can access only their own:

    profile
    attempts
    bookmarks
    notifications

---

# Security Rules

1. Protected endpoints require a valid JWT.
2. Role authorization happens after authentication.
3. Public registration allows only `USER` or `AUTHOR`.
4. `ADMIN` accounts are created through seed data.
5. Backend rejects `role: "ADMIN"` during public registration.
6. AUTHOR can modify only own articles and quizzes.
7. ADMIN can manage all content.
8. Backend never trusts frontend permissions.
9. Passwords/hashes are never returned.
10. Correct quiz answers are never exposed before submission.
11. Attempt ownership is checked server-side.
12. Notification ownership is checked server-side.
13. Frontend route protection is not sufficient for security.
14. Backend middleware is mandatory for protected operations.