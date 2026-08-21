# Code Forge API Contract

Version: v1
Base URL: `/api/v1`
Content-Type: `application/json`
Authentication: `Authorization: Bearer <JWT>`

## 1. Standard Responses

### Success
```json
{
  "success": true,
  "data": {}
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {}
  }
}
```

### Pagination
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

## 2. HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 204 | Success with no response body |
| 400 | Bad Request |
| 401 | Authentication required |
| 403 | Forbidden |
| 404 | Resource not found |
| 409 | Conflict |
| 422 | Validation error |
| 500 | Internal server error |

## 3. Enums

### UserRole
`USER`, `AUTHOR`, `ADMIN`

### ArticleStatus
`DRAFT`, `PENDING_REVIEW`, `CHANGES_REQUESTED`, `APPROVED`, `PUBLISHED`, `REJECTED`

### QuizStatus
`DRAFT`, `PENDING_REVIEW`, `CHANGES_REQUESTED`, `APPROVED`, `PUBLISHED`, `REJECTED`

### Difficulty
`BEGINNER`, `INTERMEDIATE`, `ADVANCED`

---

# 4. Authentication

## Register
`POST /auth/register`

Request:
```json
{
  "name": "Daksh",
  "email": "daksh@example.com",
  "password": "password123"
}
```

## Login
`POST /auth/login`

Request:
```json
{
  "email": "daksh@example.com",
  "password": "password123"
}
```

Response returns `user` and `token`.

## Current User
`GET /auth/me`

Auth required.

## Logout
`POST /auth/logout`

Auth required. Returns `204`.

---

# 5. Users / Profile

## Get My Profile
`GET /users/me`

## Update Profile
`PATCH /users/me`

Request:
```json
{
  "name": "Daksh Maheshwari",
  "bio": "Backend Developer",
  "avatarUrl": "https://..."
}
```

---

# 6. Categories

`GET /categories`

`POST /categories` — ADMIN

Request:
```json
{
  "name": "System Design"
}
```

`PATCH /categories/:categoryId` — ADMIN

`DELETE /categories/:categoryId` — ADMIN

---

# 7. Tags

`GET /tags`

`POST /tags` — ADMIN

Request:
```json
{
  "name": "arrays"
}
```

`DELETE /tags/:tagId` — ADMIN

---

# 8. Articles

## List Articles
`GET /articles`

Query:
```text
?page=1
&limit=10
&search=binary
&categoryId=uuid
&difficulty=BEGINNER
&tag=arrays
&sortBy=latest
```

## Get Article
`GET /articles/:articleId`

Public for published articles.

## Create Article
`POST /articles` — AUTHOR/ADMIN

Request:
```json
{
  "title": "Understanding Binary Search",
  "description": "Learn binary search from basics",
  "content": "Article content",
  "categoryId": "category_uuid",
  "tagIds": ["tag_uuid"],
  "difficulty": "BEGINNER",
  "thumbnailUrl": "https://..."
}
```

New articles start as `DRAFT`.

## Update Article
`PATCH /articles/:articleId`

Authors can update only their own articles.

## Delete Article
`DELETE /articles/:articleId`

## My Articles
`GET /users/me/articles`

Query: `status`, `page`, `limit`.

## Submit Article for Review
`POST /articles/:articleId/submit`

Allowed:
`DRAFT -> PENDING_REVIEW`
`CHANGES_REQUESTED -> PENDING_REVIEW`

---

# 9. Article Quiz

Every article quiz contains exactly **3 questions**.

Each question contains exactly **4 options** and **1 correct option**.

Public APIs must never expose the correct answer before submission.

## Get Article Quiz
`GET /articles/:articleId/quiz`

Response:
```json
{
  "success": true,
  "data": {
    "id": "article_quiz_uuid",
    "articleId": "article_uuid",
    "questions": [
      {
        "id": "question_uuid",
        "questionText": "What is binary search?",
        "options": [
          { "id": "option_1", "text": "A searching algorithm" },
          { "id": "option_2", "text": "A sorting algorithm" },
          { "id": "option_3", "text": "A graph algorithm" },
          { "id": "option_4", "text": "A hashing algorithm" }
        ]
      }
    ]
  }
}
```

## Create Article Quiz
`POST /articles/:articleId/quiz` — AUTHOR

Request:
```json
{
  "questions": [
    {
      "questionText": "What is binary search?",
      "options": [
        "Searching algorithm",
        "Sorting algorithm",
        "Graph algorithm",
        "Hashing algorithm"
      ],
      "correctOptionIndex": 0,
      "explanation": "Binary search repeatedly divides the search space."
    }
  ]
}
```

Backend must enforce exactly 3 questions and exactly 4 options per question.

## Update Article Quiz
`PATCH /articles/:articleId/quiz`

## Attempt Article Quiz
`POST /articles/:articleId/quiz/attempt`

Request:
```json
{
  "answers": [
    {
      "questionId": "question_uuid",
      "optionId": "option_uuid"
    }
  ]
}
```

Response includes score, total questions, percentage, correctness and explanations.

---

# 10. Standalone Quizzes

## List Quizzes
`GET /quizzes`

Query:
```text
?page=1
&limit=10
&search=javascript
&categoryId=uuid
&difficulty=INTERMEDIATE
&sortBy=popular
```

## Get Quiz
`GET /quizzes/:quizId`

Public metadata and questions; correct answers are hidden.

## Create Quiz
`POST /quizzes` — AUTHOR/ADMIN

Request:
```json
{
  "title": "JavaScript Fundamentals",
  "description": "Test your JavaScript knowledge",
  "categoryId": "category_uuid",
  "difficulty": "BEGINNER",
  "estimatedTimeMinutes": 10
}
```

## Update Quiz
`PATCH /quizzes/:quizId`

## Delete Quiz
`DELETE /quizzes/:quizId`

---

# 11. Quiz Questions

## Add Question
`POST /quizzes/:quizId/questions`

Request:
```json
{
  "questionText": "What is a closure?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctOptionIndex": 1,
  "explanation": "Explanation..."
}
```

## Update Question
`PATCH /quizzes/:quizId/questions/:questionId`

## Delete Question
`DELETE /quizzes/:quizId/questions/:questionId`

---

# 12. Quiz Attempts

## Start Attempt
`POST /quizzes/:quizId/attempts`

Response:
```json
{
  "success": true,
  "data": {
    "attemptId": "attempt_uuid",
    "quizId": "quiz_uuid",
    "startedAt": "2026-08-22T10:00:00Z"
  }
}
```

## Submit Attempt
`POST /attempts/:attemptId/submit`

Request:
```json
{
  "answers": [
    {
      "questionId": "question_uuid",
      "optionId": "option_uuid"
    }
  ]
}
```

Response includes:
- `attemptId`
- `score`
- `totalQuestions`
- `percentage`
- `correctAnswers`
- `incorrectAnswers`
- `timeTakenSeconds`

## Get Attempt Result
`GET /attempts/:attemptId`

## My Quiz History
`GET /users/me/attempts`

Query: `page`, `limit`.

---

# 13. Bookmarks

`POST /articles/:articleId/bookmark`

`DELETE /articles/:articleId/bookmark`

`GET /users/me/bookmarks`

---

# 14. Search

`GET /search`

Query:
```text
?q=javascript
&type=all
&categoryId=uuid
&page=1
&limit=10
```

Allowed `type`:
`all`, `article`, `quiz`

---

# 15. Author Dashboard

`GET /author/dashboard`

Returns:
- `totalArticles`
- `drafts`
- `pendingReview`
- `published`
- `rejected`

---

# 16. Admin Moderation

## Pending Articles
`GET /admin/articles/pending`

## Review Article
`GET /admin/articles/:articleId`

Returns article, author, category, tags, attached article quiz and submission information.

## Approve Article
`PATCH /admin/articles/:articleId/approve`

Transition:
`PENDING_REVIEW -> APPROVED`

## Reject Article
`PATCH /admin/articles/:articleId/reject`

Request:
```json
{
  "feedback": "Content contains inaccurate information."
}
```

## Request Changes
`PATCH /admin/articles/:articleId/request-changes`

Request:
```json
{
  "feedback": "Please improve the time complexity explanation."
}
```

Transition:
`PENDING_REVIEW -> CHANGES_REQUESTED`

---

# 17. Admin Quiz Moderation

`GET /admin/quizzes/pending`

`GET /admin/quizzes/:quizId`

`PATCH /admin/quizzes/:quizId/approve`

`PATCH /admin/quizzes/:quizId/reject`

`PATCH /admin/quizzes/:quizId/request-changes`

Reject/request-changes body:
```json
{
  "feedback": "Question 4 has an incorrect answer."
}
```

---

# 18. Notifications

## List Notifications
`GET /notifications`

Query: `page`, `limit`, `unread`.

Response item:
```json
{
  "id": "notification_uuid",
  "type": "ARTICLE_APPROVED",
  "title": "Article Approved",
  "message": "Your article has been approved.",
  "isRead": false,
  "createdAt": "2026-08-22T10:00:00Z"
}
```

## Mark Read
`PATCH /notifications/:notificationId/read`

## Mark All Read
`PATCH /notifications/read-all`

---

# 19. Dashboards

## User Dashboard
`GET /users/me/dashboard`

Returns:
- `articlesRead`
- `quizzesAttempted`
- `averageScore`
- `learningStreakDays`
- `recentArticles`
- `recentAttempts`
- `categoryProgress`

## Admin Dashboard
`GET /admin/dashboard`

Returns:
- `totalUsers`
- `pendingArticles`
- `pendingQuizzes`
- `publishedArticles`

---

# 20. Media Upload

`POST /uploads`

Content-Type: `multipart/form-data`

Field:
`file`

Response:
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.example.com/image.png"
  }
}
```

---

# 21. Role Permissions

| Feature | USER | AUTHOR | ADMIN |
|---|---:|---:|---:|
| Read Articles | Yes | Yes | Yes |
| Take Quizzes | Yes | Yes | Yes |
| Bookmark Articles | Yes | Yes | Yes |
| Create Articles | No | Yes | Yes |
| Edit Own Articles | No | Yes | Yes |
| Create Quizzes | No | Yes | Yes |
| Submit Content | No | Yes | No |
| Approve Content | No | No | Yes |
| Reject Content | No | No | Yes |
| Request Changes | No | No | Yes |
| Manage Categories | No | No | Yes |
| Manage Users | No | No | Yes |

---

# 22. Core Entities

```text
User
Article
Category
Tag
ArticleTag
ArticleQuiz
ArticleQuizQuestion
ArticleQuizOption
Quiz
QuizQuestion
QuizOption
QuizAttempt
QuizAnswer
Bookmark
Notification
```

Recommended database tables:

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

Important relations:

```text
articles.author_id
articles.category_id

article_quizzes.article_id
article_quiz_questions.article_quiz_id
article_quiz_options.question_id

quizzes.author_id
quizzes.category_id
quiz_questions.quiz_id
quiz_options.question_id

quiz_attempts.user_id
quiz_attempts.quiz_id

quiz_answers.attempt_id
quiz_answers.question_id
quiz_answers.option_id

bookmarks.user_id
bookmarks.article_id

notifications.user_id
```

---

# 23. Global Rules

1. Never expose correct answers through public quiz APIs.
2. Validate all request bodies with a schema validator such as Zod.
3. Perform authorization on the server.
4. Authors can modify only their own content.
5. Admin endpoints require `ADMIN` role.
6. Published content is publicly readable.
7. Draft/pending content is visible only to its author and admins.
8. Article quizzes contain exactly 3 questions.
9. Each question contains exactly 4 options.
10. Every question has exactly one correct option.
11. IDs are opaque values to the frontend.
12. Dates use ISO 8601 UTC.
13. Use pagination for large lists.
14. Never return passwords or password hashes.
15. Do not send correct answers before quiz submission.
16. All API changes must be reflected in this contract.
17. Breaking API changes require an API version change.
18. Frontend must not rely on undocumented fields.

---

# 24. Main Flows

## Reader
`Home -> Articles -> Article -> Read -> Article Quiz -> Score`

or

`Home -> Quizzes -> Quiz -> Start -> Attempt -> Submit -> Result -> History`

## Author
`Login -> Author Dashboard -> Create Article -> Add Content -> Add 3 MCQs -> Preview -> Save Draft -> Submit Review -> Admin Review -> Approved / Changes Requested / Rejected`

## Admin
`Login -> Admin Dashboard -> Pending Content -> Review Article/Quiz -> Approve / Reject / Request Changes -> Author Notification`
