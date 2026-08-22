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

# 2. Frontend Structure

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

Routes contain mapping, not business logic.

Controllers stay thin. Business rules belong in services.

# 5. Authentication

## Register

    Register Form
     ↓
    Name + Email + Password + Role
     ↓
    POST /auth/register
     ↓
    Validate required fields
     ↓
    Validate role
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

Public registration allows:

    USER
    AUTHOR

`ADMIN` cannot be created through public registration.

Admin accounts are created through seed data.

If the frontend sends:

    role = USER

the account is created as `USER`.

If the frontend sends:

    role = AUTHOR

the account is created as `AUTHOR`.

If the frontend sends:

    role = ADMIN

the backend rejects the request.

## Login

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

JWT payload:

    {
      userId,
      role
    }

Password is never placed in JWT.

# 6. Auth Middleware

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

Missing/invalid token → `401`.

`req.user` contains the authenticated user's identity and role.

# 7. Role Middleware

Role checking happens after authentication.

    authMiddleware
     ↓
    requireRole("ADMIN")
     ↓
    Role matches?
     ├── YES → next()
     └── NO → 403

Examples:

    POST /articles
    → AUTHOR, ADMIN

    PATCH /admin/articles/:id/approve
    → ADMIN

    POST /quizzes/:id/attempts
    → USER, AUTHOR, ADMIN

Supported roles:

    USER
    AUTHOR
    ADMIN

# 8. Ownership

Role is not the same as ownership.

For article update:

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

For articles and quizzes:

    AUTHOR
     ↓
    Can modify own content
     ↓
    Cannot modify another author's content

For user-specific resources:

    USER
     ↓
    Can access own attempts
    Can access own bookmarks
    Can access own notifications

ADMIN can access/manage resources according to the API contract.

# 9. Frontend Authentication

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

AuthContext:

    {
      user,
      token,
      isAuthenticated,
      loading,
      login,
      register,
      logout
    }

On app start:

    App Start
     ↓
    Token exists?
     ↓
    GET /auth/me
     ↓
    Valid?
     ├── YES → restore user
     └── NO → clear auth

# 10. Axios

Create one Axios instance in `services/api.js`.

Responsibilities:

- Base URL.
- Attach JWT.
- Common response handling.

    localStorage token
     ↓
    Axios interceptor
     ↓
    Authorization: Bearer <token>

Components should use service functions instead of manually building requests.

# 11. Frontend Routes

Public:

    /
    /login
    /register
    /articles
    /articles/:articleId
    /quizzes
    /quizzes/:quizId

Authenticated:

    /dashboard
    /profile
    /bookmarks
    /quiz-history

Author:

    /author/dashboard
    /author/articles
    /author/articles/create
    /author/articles/:articleId/edit

Admin:

    /admin/dashboard
    /admin/users
    /admin/articles
    /admin/quizzes

Route flow:

    ProtectedRoute
     ↓
    Authenticated?
     ├── NO → /login
     └── YES → RoleRoute
                  ↓
              Correct role?
               ├── NO → Unauthorized
               └── YES → Page

Frontend protection is navigation/UI protection. Backend remains the real security layer.

# 12. Article Flow

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

Published articles become public.

# 13. Article Quiz Flow

    Article
     ↓
    ArticleQuiz
     ↓
    3 Questions
     ↓
    4 Options each
     ↓
    1 Correct Option

Reader receives only:

    question + options

Reader does not receive:

    correctOption

On submit:

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

Score calculation is always performed by the backend.

# 14. Standalone Quiz Flow

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

Reader:

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

# 15. Quiz Attempt Flow

## Start

    POST /quizzes/:quizId/attempts
     ↓
    Create QuizAttempt
     ↓
    IN_PROGRESS

## Submit

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

Completed attempts cannot be submitted again.

# 16. Admin Moderation

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

# 17. Notifications

Backend creates notifications when moderation actions happen.

Example:

    Approve Article
     ↓
    Article status updated
     ↓
    Create Notification
     ↓
    notification.user = article.author

Types:

    ARTICLE_APPROVED
    ARTICLE_REJECTED
    ARTICLE_CHANGES_REQUESTED
    QUIZ_APPROVED
    QUIZ_REJECTED
    QUIZ_CHANGES_REQUESTED

# 18. Search

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

Filters:

    search
    category
    tag
    difficulty
    type
    page
    limit
    sort

# 19. Uploads

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

MongoDB stores the URL, not image binary.

# 20. Main System Flow

    CODE FORGE
         │
     ┌───┴────┐
     │        │
    READER   AUTHOR
     │        │
    Read     Create Article
    Article      │
     │       Add MCQs
    Article       │
    Quiz       Submit
     │            │
    Result        ▼
               ADMIN
                 │
          Review / Approve
                 │
                 ▼
             PUBLISHED
                 │
                 ▼
               READER

# 21. Development Dependency Flow

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

Independent frontend screens can be built in parallel from Figma and the API contract.