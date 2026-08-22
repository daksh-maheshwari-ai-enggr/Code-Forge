# Code Forge — System Architecture

Stack:
- MongoDB
- Express.js
- React
- Node.js
- JavaScript
- Mongoose
- JWT
- bcrypt
- Axios
- React Router
- Tailwind CSS

Validation: normal JavaScript validation for v1. No Zod.

# 1. High-Level

```text
React
  ↓
React Router / Context
  ↓
Axios
  ↓
Express
  ↓
Routes
  ↓
Middleware
  ↓
Controllers
  ↓
Services
  ↓
Mongoose
  ↓
MongoDB
```

# 2. Frontend Structure

```text
client/src/
├── components/
├── pages/
├── layouts/
├── context/
├── hooks/
├── services/
├── routes/
├── utils/
├── App.jsx
└── main.jsx
```

Responsibilities:
- `components`: reusable UI.
- `pages`: screen-level UI.
- `layouts`: shared page layouts.
- `context`: global state such as authentication.
- `hooks`: reusable React logic.
- `services`: API calls.
- `routes`: public/protected/role routes.
- `utils`: frontend helpers.

# 3. Backend Structure

```text
server/src/
├── config/
├── models/
├── routes/
├── controllers/
├── services/
├── middleware/
├── validators/
├── utils/
├── app.js
└── server.js
```

Responsibilities:
- `config`: DB/environment configuration.
- `models`: Mongoose schemas.
- `routes`: endpoints + middleware mapping.
- `controllers`: HTTP request/response handling.
- `services`: business logic.
- `middleware`: authentication, roles, errors.
- `validators`: manual request validation.
- `utils`: reusable helpers.

# 4. Backend Request Flow

```text
HTTP Request
 ↓
Route
 ↓
Authentication Middleware
 ↓
Authorization Middleware
 ↓
Controller
 ↓
Service
 ↓
Mongoose Model
 ↓
MongoDB
 ↓
Service
 ↓
Controller
 ↓
Response
```

Routes contain mapping, not business logic.

Controllers stay thin. Business rules belong in services.

# 5. Authentication

## Register

```text
Register Form
 ↓
POST /auth/register
 ↓
Validate required fields
 ↓
Check email
 ↓
bcrypt.hash(password)
 ↓
Create User
 ↓
Generate JWT
 ↓
Return user + token
```

Public registration always creates `USER`.

## Login

```text
Login Form
 ↓
POST /auth/login
 ↓
Find User
 ↓
bcrypt.compare()
 ↓
Generate JWT
 ↓
Return user + token
```

JWT payload:
```js
{
  userId,
  role
}
```

Password is never placed in JWT.

# 6. Auth Middleware

```text
Request
 ↓
Authorization header
 ↓
Extract Bearer token
 ↓
jwt.verify()
 ↓
req.user = { userId, role }
 ↓
next()
```

Missing/invalid token → `401`.

# 7. Role Middleware

```text
authMiddleware
 ↓
requireRole("ADMIN")
 ↓
Role matches?
 ├── YES → next()
 └── NO  → 403
```

Examples:

```text
POST /articles
→ AUTHOR, ADMIN

PATCH /admin/articles/:id/approve
→ ADMIN

POST /quizzes/:id/attempts
→ USER, AUTHOR, ADMIN
```

# 8. Ownership

Role is not ownership.

Article update:

```text
Request
 ↓
JWT
 ↓
Find Article
 ↓
ADMIN?
 ├── YES → allowed
 └── NO
      ↓
article.author === req.user.userId?
 ├── YES → allowed
 └── NO → 403
```

Same principle applies to author-owned quizzes, attempts, bookmarks and notifications.

# 9. Frontend Authentication

```text
Login
 ↓
auth.api.js
 ↓
POST /auth/login
 ↓
JWT + User
 ↓
AuthContext
 ↓
Store token
 ↓
Update user
```

AuthContext:

```js
{
  user,
  token,
  isAuthenticated,
  loading,
  login,
  register,
  logout
}
```

On app start:

```text
App Start
 ↓
Token exists?
 ↓
GET /auth/me
 ↓
Valid?
 ├── YES → restore user
 └── NO → clear auth
```

# 10. Axios

Create one Axios instance in `services/api.js`.

Responsibilities:
- Base URL.
- Attach JWT.
- Common response handling.

```text
localStorage token
 ↓
Axios interceptor
 ↓
Authorization: Bearer <token>
```

Components should use service functions instead of manually building requests.

# 11. Frontend Routes

Public:

```text
/
 /login
 /register
 /articles
 /articles/:articleId
 /quizzes
 /quizzes/:quizId
```

Authenticated:

```text
/dashboard
/profile
/bookmarks
/quiz-history
```

Author:

```text
/author/dashboard
/author/articles
/author/articles/create
/author/articles/:articleId/edit
```

Admin:

```text
/admin/dashboard
/admin/users
/admin/articles
/admin/quizzes
```

Route flow:

```text
ProtectedRoute
 ↓
Authenticated?
 ├── NO → /login
 └── YES → RoleRoute
              ↓
          Correct role?
           ├── NO → Unauthorized
           └── YES → Page
```

Frontend protection is navigation/UI protection. Backend remains the real security layer.

# 12. Article Flow

```text
Author
 ↓
Create Article
 ↓
DRAFT
 ↓
Write/Edit
 ↓
Add Article Quiz
 ↓
Submit
 ↓
PENDING_REVIEW
 ↓
Admin Review
 ├── APPROVED
 ├── REJECTED
 └── CHANGES_REQUESTED
        ↓
     Author edits
        ↓
   PENDING_REVIEW
```

Published articles become public.

# 13. Article Quiz Flow

```text
Article
 ↓
ArticleQuiz
 ↓
3 Questions
 ↓
4 Options each
 ↓
1 Correct Option
```

Reader receives only:
```text
question + options
```

Reader does not receive:
```text
correctOption
```

On submit:

```text
Answers
 ↓
Backend
 ↓
Load correct answers
 ↓
Compare
 ↓
Calculate score
 ↓
Return result
```

# 14. Standalone Quiz Flow

```text
Author
 ↓
Create Quiz
 ↓
Add Questions
 ↓
Add Options
 ↓
Set Correct Answers
 ↓
DRAFT
 ↓
Submit
 ↓
Admin Review
 ↓
PUBLISHED
```

Reader:

```text
Quiz
 ↓
Start Attempt
 ↓
Answer
 ↓
Submit
 ↓
Backend calculates score
 ↓
Save Attempt
 ↓
Result
```

# 15. Quiz Attempt Flow

Start:

```text
POST /quizzes/:quizId/attempts
 ↓
Create QuizAttempt
 ↓
IN_PROGRESS
```

Submit:

```text
POST /attempts/:attemptId/submit
 ↓
Verify owner
 ↓
Verify not completed
 ↓
Load correct answers
 ↓
Calculate result
 ↓
Save answers/result
 ↓
COMPLETED
```

# 16. Admin Moderation

```text
Admin Dashboard
 ↓
Pending Articles / Quizzes
 ↓
Review
 ↓
Approve / Reject / Request Changes
 ↓
Update status
 ↓
Create Notification
 ↓
Author sees notification
```

# 17. Notifications

Backend creates notifications when moderation actions happen.

Example:

```text
Approve Article
 ↓
Article status updated
 ↓
Create Notification
 ↓
notification.user = article.author
```

Types:
```text
ARTICLE_APPROVED
ARTICLE_REJECTED
ARTICLE_CHANGES_REQUESTED
QUIZ_APPROVED
QUIZ_REJECTED
QUIZ_CHANGES_REQUESTED
```

# 18. Search

```text
GET /search
 ↓
Read query/filter
 ↓
Build MongoDB query
 ↓
Articles / Quizzes
 ↓
Pagination
 ↓
Response
```

Filters:
`search`, `category`, `tag`, `difficulty`, `type`, `page`, `limit`, `sort`.

# 19. Uploads

```text
Frontend
 ↓
multipart/form-data
 ↓
POST /uploads
 ↓
Multer
 ↓
Storage
 ↓
File URL
 ↓
Save URL in MongoDB
```

MongoDB stores the URL, not image binary.

# 20. Main System Flow

```text
                    CODE FORGE
                         │
             ┌───────────┴───────────┐
             │                       │
          READER                   AUTHOR
             │                       │
        Read Article            Create Article
             │                       │
        Article Quiz              Add MCQs
             │                       │
          Result                  Submit
                                     │
                                     ▼
                                   ADMIN
                                     │
                            Review / Approve
                                     │
                                     ▼
                                 PUBLISHED
                                     │
                                     ▼
                                   READER
```

# 21. Development Dependency Flow

```text
Project Setup
      ↓
MongoDB + Models
      ↓
Backend Infrastructure
      ↓
Authentication
      ↓
User/Profile
      ↓
Categories + Tags
      ↓
Article CRUD
      ↓
Article Quiz
      ↓
Admin Moderation
      ↓
Standalone Quiz
      ↓
Quiz Attempts
      ↓
Bookmarks + Search
      ↓
Notifications + Dashboards
      ↓
Frontend Integration
```

Independent frontend screens can be built in parallel from Figma and the API contract.
