# Code Forge Naming Conventions

This document is the naming standard for the Code Forge project.

## 1. General Rules

- API paths: `kebab-case`
- JSON fields: `camelCase`
- Query parameters: `camelCase`
- JavaScript/TypeScript variables and functions: `camelCase`
- Classes, interfaces, types and React components: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Enum values: `UPPER_SNAKE_CASE`
- Database tables: `snake_case`
- Database columns: `snake_case`
- Environment variables: `UPPER_SNAKE_CASE`
- File names: use the convention of the framework/module; backend modules should prefer `kebab-case`
- IDs: use UUID/string IDs and treat them as opaque values
- Dates/timestamps: `createdAt`, `updatedAt`, etc. in API responses; store DB columns as `created_at`, `updated_at`

---

## 2. API URL Naming

Use plural nouns for resources.

### Good

```text
GET /api/v1/articles
GET /api/v1/articles/:articleId
POST /api/v1/articles
PATCH /api/v1/articles/:articleId
DELETE /api/v1/articles/:articleId
```

### Bad

```text
GET /api/v1/getArticles
GET /api/v1/getArticleById
POST /api/v1/createArticle
```

Use kebab-case for multi-word resource paths:

```text
/article-quizzes
/quiz-attempts
/admin/articles
/users/me
```

Do not use verbs in normal CRUD resource URLs.

Action endpoints may use verbs when they represent a state-changing command:

```text
POST /articles/:articleId/submit
PATCH /admin/articles/:articleId/approve
PATCH /admin/articles/:articleId/request-changes
POST /quizzes/:quizId/attempts
POST /attempts/:attemptId/submit
```

---

## 3. HTTP Method Rules

```text
GET     Read/fetch
POST    Create or execute an action
PATCH   Partial update/state transition
PUT     Full replacement only when genuinely required
DELETE  Delete/remove
```

Prefer `PATCH` over `PUT` for partial updates.

---

## 4. JSON Naming

Always use `camelCase`.

### Good

```json
{
  "articleId": "uuid",
  "categoryId": "uuid",
  "questionText": "What is a closure?",
  "correctOptionIndex": 1,
  "readingTimeMinutes": 8,
  "createdAt": "2026-08-22T10:00:00Z"
}
```

### Bad

```json
{
  "article_id": "uuid",
  "question_text": "What is a closure?",
  "created_at": "..."
}
```

---

## 5. Database Naming

Use `snake_case`.

Tables:

```text
users
articles
categories
tags
article_tags
article_quizzes
article_quiz_questions
article_quiz_options
quizzes
quiz_questions
quiz_options
quiz_attempts
quiz_answers
bookmarks
notifications
```

Foreign keys:

```text
user_id
author_id
article_id
category_id
quiz_id
question_id
option_id
attempt_id
notification_id
```

Timestamps:

```text
created_at
updated_at
published_at
submitted_at
started_at
completed_at
```

Boolean columns should normally use an `is_` or `has_` prefix:

```text
is_active
is_published
is_read
has_quiz
```

---

## 6. TypeScript Naming

Variables:

```ts
const articleId = "uuid";
const articleTitle = "Binary Search";
```

Functions:

```ts
getArticle()
createArticle()
updateArticle()
deleteArticle()
submitArticleForReview()
```

Classes:

```ts
ArticleService
QuizService
AuthService
NotificationService
```

Interfaces/types:

```ts
Article
CreateArticleInput
UpdateArticleInput
ArticleResponse
QuizAttemptResponse
```

Constants:

```ts
MAX_ARTICLE_QUIZ_QUESTIONS
MAX_QUESTION_OPTIONS
DEFAULT_PAGE_SIZE
JWT_EXPIRES_IN
```

---

## 7. File Naming

Prefer `kebab-case` for backend files:

```text
article.controller.ts
article.service.ts
article.repository.ts
article.routes.ts
article.schema.ts
auth.middleware.ts
error.middleware.ts
```

React components:

```text
ArticleCard.tsx
ArticleEditor.tsx
QuizBuilder.tsx
QuizQuestion.tsx
AuthorDashboard.tsx
```

React hooks:

```text
useAuth.ts
useArticles.ts
useQuizAttempt.ts
```

---

## 8. Folder Naming

Use lowercase/kebab-case.

Example:

```text
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── articles/
│   ├── quizzes/
│   ├── categories/
│   ├── notifications/
│   └── admin/
├── middleware/
├── config/
├── utils/
└── database/
```

---

## 9. Controller / Service / Repository

Controllers handle HTTP concerns.

```text
article.controller.ts
```

Services contain business logic.

```text
article.service.ts
```

Repositories handle database access.

```text
article.repository.ts
```

Do not put database queries directly inside controllers.

Example:

```text
Request
  ↓
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Database
```

---

## 10. Validation Naming

Use schema names based on the operation:

```text
registerUserSchema
loginUserSchema

createArticleSchema
updateArticleSchema

createArticleQuizSchema
updateArticleQuizSchema

createQuizSchema
updateQuizSchema

submitQuizAttemptSchema
```

Zod example:

```ts
export const createArticleSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
});
```

---

## 11. Enum Naming

Enum type/name: `PascalCase`

Enum values: `UPPER_SNAKE_CASE`

Example:

```ts
enum UserRole {
  USER,
  AUTHOR,
  ADMIN,
}

enum ArticleStatus {
  DRAFT,
  PENDING_REVIEW,
  CHANGES_REQUESTED,
  APPROVED,
  PUBLISHED,
  REJECTED,
}
```

Do not mix styles:

```text
Admin
admin
PendingReview
pending-review
```

---

## 12. Boolean Naming

Use clear prefixes:

```text
isActive
isRead
isPublished
hasQuiz
hasAttempted
```

Avoid:

```text
active
read
published
quiz
```

when the value is specifically boolean and ambiguity is possible.

---

## 13. IDs

API:

```json
{
  "articleId": "uuid",
  "authorId": "uuid",
  "categoryId": "uuid"
}
```

Database:

```text
article_id
author_id
category_id
```

Route params should identify the resource:

```text
/articles/:articleId
/quizzes/:quizId
/questions/:questionId
```

Do not use vague params such as:

```text
/articles/:id
```

when the route contains multiple resource types and a specific name improves clarity.

---

## 14. Query Parameters

Use `camelCase`.

```text
?page=1
&limit=10
&search=javascript
&categoryId=uuid
&sortBy=latest
&sortOrder=desc
```

Do not use:

```text
?page_number=1
&category_id=uuid
```

---

## 15. API Response Fields

Use consistent naming.

Prefer:

```text
totalQuestions
correctAnswers
incorrectAnswers
timeTakenSeconds
readingTimeMinutes
estimatedTimeMinutes
```

Avoid ambiguous names:

```text
total
correct
time
readingTime
```

when the unit or meaning matters.

---

## 16. Date / Time

API uses ISO 8601 UTC:

```text
2026-08-22T10:00:00Z
```

Examples:

```text
createdAt
updatedAt
publishedAt
submittedAt
startedAt
completedAt
```

Never send locale-formatted dates from the backend.

---

## 17. Error Codes

Use stable `UPPER_SNAKE_CASE` codes:

```text
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
ARTICLE_NOT_FOUND
QUIZ_NOT_FOUND
USER_NOT_FOUND
INVALID_CREDENTIALS
EMAIL_ALREADY_EXISTS
ARTICLE_ALREADY_SUBMITTED
QUIZ_ALREADY_ATTEMPTED
INVALID_QUIZ_ANSWERS
INTERNAL_SERVER_ERROR
```

Frontend should use `error.code` for logic rather than parsing the human-readable message.

---

## 18. Git Branch Naming

Use:

```text
feature/<short-description>
fix/<short-description>
refactor/<short-description>
docs/<short-description>
chore/<short-description>
```

Examples:

```text
feature/article-crud
feature/article-quiz
feature/auth
feature/admin-moderation
fix/quiz-score-calculation
docs/api-contract
chore/setup-docker
```

Keep branch names short and descriptive.

---

## 19. Commit Naming

Use Conventional Commits:

```text
feat: add article CRUD APIs
feat: add article quiz attempts
fix: prevent duplicate quiz submissions
docs: add API contract
refactor: extract article service
test: add article controller tests
chore: configure eslint
```

Format:

```text
<type>: <short description>
```

Allowed types:

```text
feat
fix
docs
refactor
test
chore
perf
ci
```

Use imperative wording:

```text
feat: add article search
```

not:

```text
feat: added article search
```

---

## 20. Pull Request Naming

Use:

```text
feat: article CRUD
feat: article quiz
feat: authentication
fix: prevent duplicate quiz attempts
docs: add API contract
```

PR description should contain:

```text
## What changed

## Why

## API changes

## Testing

## Screenshots (if UI)
```

---

## 21. Environment Variables

Use `UPPER_SNAKE_CASE`.

Example:

```text
NODE_ENV
PORT
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
REDIS_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

Never commit:

```text
.env
.env.local
.env.production
```

Commit:

```text
.env.example
```

with placeholder values.

---

## 22. Naming Examples for Code Forge

Article:

```text
Article
articleId
articleTitle
articleStatus
article.controller.ts
article.service.ts
article.repository.ts
createArticleSchema
```

Article quiz:

```text
ArticleQuiz
articleQuizId
articleQuizQuestion
articleQuizOption
createArticleQuizSchema
```

Standalone quiz:

```text
Quiz
quizId
quizQuestion
quizOption
quizAttempt
quizAnswer
```

Author:

```text
AuthorDashboard
authorId
authorArticle
```

Admin:

```text
AdminDashboard
adminId
adminArticleReview
```

---

## 23. Important Consistency Rules

1. Never mix `camelCase` and `snake_case` in API JSON.
2. Never use different names for the same concept.
3. If the API calls it `articleId`, frontend and backend both use `articleId`.
4. Database may use `article_id`.
5. Use `questionText` consistently; do not alternate with `question`.
6. Use `correctOptionIndex` consistently where an index is intentionally used.
7. Use `avatarUrl`, `thumbnailUrl`, etc. for URLs.
8. Use `isRead`, `isActive`, `hasQuiz` for booleans.
9. Use explicit units such as `timeTakenSeconds`.
10. Update `API.md` whenever an API contract changes.
11. Breaking changes must be discussed before implementation.
12. Do not introduce new naming styles without team agreement.
