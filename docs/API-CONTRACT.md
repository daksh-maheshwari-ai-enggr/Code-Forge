# Code Forge — API Contract

Base URL: `/api/v1`
Stack: MERN + JavaScript
Auth: `Authorization: Bearer <JWT>`
Roles: `USER`, `AUTHOR`, `ADMIN`

## Response Format

Success:
```json
{"success":true,"data":{}}
```

Error:
```json
{"success":false,"error":{"code":"ERROR_CODE","message":"Message"}}
```

Status codes: `200` success, `201` created, `204` no body, `400` bad request, `401` unauthenticated, `403` forbidden, `404` not found, `409` conflict, `500` server error.

# Authentication

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| POST | `/auth/register` | No | Public |
| POST | `/auth/login` | No | Public |
| GET | `/auth/me` | Yes | Any |
| POST | `/auth/logout` | Yes | Any |

### Register
`POST /auth/register`

```json
{"name":"Daksh","email":"daksh@example.com","password":"password123"}
```

Rules: email unique; password bcrypt-hashed; public registration always creates `USER`; client cannot choose role.

### Login
`POST /auth/login`

```json
{"email":"daksh@example.com","password":"password123"}
```

Returns safe user object + JWT.

### Me
`GET /auth/me`

Returns current authenticated user.

### Logout
`POST /auth/logout`

V1 removes the JWT on the client. Server-side token revocation is not included.

# Users

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/users/me` | Yes | Any |
| PATCH | `/users/me` | Yes | Any |
| PATCH | `/users/me/password` | Yes | Any |

`PATCH /users/me`:
```json
{"name":"Daksh Maheshwari","bio":"Backend Developer","avatarUrl":"https://..."}
```

`PATCH /users/me/password`:
```json
{"currentPassword":"old","newPassword":"newPassword123"}
```

# Admin Users

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/admin/users` | Yes | ADMIN |
| GET | `/admin/users/:userId` | Yes | ADMIN |
| PATCH | `/admin/users/:userId/role` | Yes | ADMIN |
| DELETE | `/admin/users/:userId` | Yes | ADMIN |

Role body:
```json
{"role":"AUTHOR"}
```

# Categories

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/categories` | No | Public |
| POST | `/categories` | Yes | ADMIN |
| PATCH | `/categories/:categoryId` | Yes | ADMIN |
| DELETE | `/categories/:categoryId` | Yes | ADMIN |

# Tags

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/tags` | No | Public |
| POST | `/tags` | Yes | ADMIN |
| PATCH | `/tags/:tagId` | Yes | ADMIN |
| DELETE | `/tags/:tagId` | Yes | ADMIN |

# Articles

| Method | Endpoint | Auth | Role | Ownership |
|---|---|---|---|---|
| GET | `/articles` | No | Public | — |
| GET | `/articles/:articleId` | No* | Public | — |
| POST | `/articles` | Yes | AUTHOR, ADMIN | — |
| PATCH | `/articles/:articleId` | Yes | AUTHOR, ADMIN | AUTHOR: own |
| DELETE | `/articles/:articleId` | Yes | AUTHOR, ADMIN | AUTHOR: own |
| GET | `/users/me/articles` | Yes | Any | Own |
| POST | `/articles/:articleId/submit` | Yes | AUTHOR, ADMIN | AUTHOR: own |

List query:
`page`, `limit`, `search`, `categoryId`, `tag`, `difficulty`, `sortBy`

Create body:
```json
{
  "title":"Understanding Binary Search",
  "description":"Learn binary search",
  "content":"Article content",
  "categoryId":"category_id",
  "tagIds":["tag_id"],
  "difficulty":"BEGINNER",
  "thumbnailUrl":"https://..."
}
```

New article: `DRAFT`.

Statuses:
`DRAFT → PENDING_REVIEW → APPROVED → PUBLISHED`
`PENDING_REVIEW → CHANGES_REQUESTED → PENDING_REVIEW`
`PENDING_REVIEW → REJECTED`

# Article Quiz

Rules: exactly 3 questions, exactly 4 options/question, exactly 1 correct option.

| Method | Endpoint | Auth | Role | Ownership |
|---|---|---|---|---|
| GET | `/articles/:articleId/quiz` | No* | Public | — |
| POST | `/articles/:articleId/quiz` | Yes | AUTHOR, ADMIN | AUTHOR: article owner |
| PATCH | `/articles/:articleId/quiz` | Yes | AUTHOR, ADMIN | AUTHOR: article owner |
| POST | `/articles/:articleId/quiz/attempt` | Yes | Any | — |

Public quiz responses never contain correct answers.

Create body:
```json
{
  "questions":[
    {
      "questionText":"What is binary search?",
      "options":["Searching","Sorting","Graph","Hashing"],
      "correctOptionIndex":0,
      "explanation":"Binary search divides the search space."
    }
  ]
}
```

Attempt body:
```json
{"answers":[{"questionId":"question_id","optionId":"option_id"}]}
```

Score is calculated only by the backend.

# Standalone Quizzes

| Method | Endpoint | Auth | Role | Ownership |
|---|---|---|---|---|
| GET | `/quizzes` | No | Public | — |
| GET | `/quizzes/:quizId` | No* | Public | — |
| POST | `/quizzes` | Yes | AUTHOR, ADMIN | — |
| PATCH | `/quizzes/:quizId` | Yes | AUTHOR, ADMIN | AUTHOR: own |
| DELETE | `/quizzes/:quizId` | Yes | AUTHOR, ADMIN | AUTHOR: own |

Create body:
```json
{
  "title":"JavaScript Fundamentals",
  "description":"Test JavaScript knowledge",
  "categoryId":"category_id",
  "difficulty":"BEGINNER",
  "estimatedTimeMinutes":10
}
```

# Quiz Questions

| Method | Endpoint | Auth | Role | Ownership |
|---|---|---|---|---|
| POST | `/quizzes/:quizId/questions` | Yes | AUTHOR, ADMIN | AUTHOR: own |
| PATCH | `/quizzes/:quizId/questions/:questionId` | Yes | AUTHOR, ADMIN | AUTHOR: own |
| DELETE | `/quizzes/:quizId/questions/:questionId` | Yes | AUTHOR, ADMIN | AUTHOR: own |

Question body:
```json
{
  "questionText":"What is a closure?",
  "options":["A","B","C","D"],
  "correctOptionIndex":1,
  "explanation":"Explanation"
}
```

# Quiz Attempts

| Method | Endpoint | Auth | Role | Ownership |
|---|---|---|---|---|
| POST | `/quizzes/:quizId/attempts` | Yes | Any | — |
| POST | `/attempts/:attemptId/submit` | Yes | Any | Own |
| GET | `/attempts/:attemptId` | Yes | Any | Own; ADMIN any |
| GET | `/users/me/attempts` | Yes | Any | Own |

Attempt status: `IN_PROGRESS`, `COMPLETED`. Completed attempts cannot be submitted again.

# Bookmarks

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/articles/:articleId/bookmark` | Yes |
| DELETE | `/articles/:articleId/bookmark` | Yes |
| GET | `/users/me/bookmarks` | Yes |

# Search

`GET /search`

Query: `q`, `type`, `categoryId`, `difficulty`, `page`, `limit`

`type`: `all`, `article`, `quiz`

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

Reject/request-changes:
```json
{"feedback":"Please improve the explanation."}
```

# Notifications

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/notifications` | Yes |
| PATCH | `/notifications/:notificationId/read` | Yes, own |
| PATCH | `/notifications/read-all` | Yes |

# Dashboards

`GET /users/me/dashboard` — authenticated

`GET /author/dashboard` — AUTHOR/ADMIN

`GET /admin/dashboard` — ADMIN

# Uploads

`POST /uploads` — authenticated, `multipart/form-data`, field `file`.

# Security Rules

1. Protected endpoints require valid JWT.
2. Role authorization happens after authentication.
3. Public registration always creates USER.
4. AUTHOR can modify only own articles/quizzes.
5. ADMIN can manage all content.
6. Backend never trusts frontend role.
7. Passwords/hashes are never returned.
8. Correct quiz answers are never exposed before submission.
9. Attempt ownership is checked server-side.
10. Notification ownership is checked server-side.
