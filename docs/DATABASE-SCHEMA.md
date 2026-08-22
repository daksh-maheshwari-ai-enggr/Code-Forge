# Code Forge — MongoDB Schema

Stack: MongoDB + Mongoose + JavaScript.

## User — `users`

```js
{
  name: String,
  email: String,
  password: String,
  role: String,
  avatarUrl: String,
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

Rules:
- `name`, `email`, `password` required.
- `email`: unique, lowercase, trim.
- `password`: bcrypt hash.
- `role`: `USER | AUTHOR | ADMIN`.
- Default role: `USER`.

Indexes: `email` unique, `role`.

## Category — `categories`

```js
{
  name: String,
  slug: String,
  createdAt: Date,
  updatedAt: Date
}
```

`name` and `slug` unique.

## Tag — `tags`

```js
{
  name: String,
  slug: String,
  createdAt: Date,
  updatedAt: Date
}
```

`name` and `slug` unique.

## Article — `articles`

```js
{
  title: String,
  slug: String,
  description: String,
  content: String,
  author: ObjectId,
  category: ObjectId,
  tags: [ObjectId],
  thumbnailUrl: String,
  difficulty: String,
  status: String,
  readingTimeMinutes: Number,
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

References:
- `author → User`
- `category → Category`
- `tags → Tag[]`

Difficulty: `BEGINNER | INTERMEDIATE | ADVANCED`

Status:
`DRAFT | PENDING_REVIEW | CHANGES_REQUESTED | APPROVED | PUBLISHED | REJECTED`

Indexes: `slug` unique, `author`, `category`, `status`, `difficulty`, `createdAt`.

## Article Quiz — `article_quizzes`

```js
{
  article: ObjectId,
  questions: [
    {
      questionText: String,
      options: [
        { text: String }
      ],
      correctOptionIndex: Number,
      explanation: String
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

Rules:
- One quiz per article.
- Exactly 3 questions.
- Exactly 4 options/question.
- Exactly 1 correct option.
- Correct answer stored in DB but excluded from public response.

Index: `article` unique.

## Quiz — `quizzes`

```js
{
  title: String,
  description: String,
  author: ObjectId,
  category: ObjectId,
  difficulty: String,
  estimatedTimeMinutes: Number,
  status: String,
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

References:
`author → User`, `category → Category`

Status same as Article.

Indexes: `author`, `category`, `status`, `difficulty`, `createdAt`.

## Quiz Question — `quiz_questions`

```js
{
  quiz: ObjectId,
  questionText: String,
  options: [
    { text: String }
  ],
  correctOptionIndex: Number,
  explanation: String,
  createdAt: Date,
  updatedAt: Date
}
```

Rules: exactly 4 options and 1 correct option.

Index: `quiz`.

## Quiz Attempt — `quiz_attempts`

```js
{
  user: ObjectId,
  quiz: ObjectId,
  answers: [
    {
      question: ObjectId,
      selectedOption: ObjectId,
      isCorrect: Boolean
    }
  ],
  score: Number,
  totalQuestions: Number,
  percentage: Number,
  status: String,
  startedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

References:
`user → User`, `quiz → Quiz`, `answers.question → QuizQuestion`

Status: `IN_PROGRESS | COMPLETED`

Rules:
- Only owner can submit/view.
- Completed attempt cannot be submitted again.
- Backend calculates score.

Indexes: `user`, `quiz`, `user + quiz`, `status`.

## Bookmark — `bookmarks`

```js
{
  user: ObjectId,
  article: ObjectId,
  createdAt: Date
}
```

Unique compound index:
`user + article`

## Notification — `notifications`

```js
{
  user: ObjectId,
  type: String,
  title: String,
  message: String,
  isRead: Boolean,
  article: ObjectId,
  quiz: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

Types:
`ARTICLE_APPROVED`
`ARTICLE_REJECTED`
`ARTICLE_CHANGES_REQUESTED`
`QUIZ_APPROVED`
`QUIZ_REJECTED`
`QUIZ_CHANGES_REQUESTED`

Default `isRead = false`.

Indexes: `user`, `user + isRead`, `createdAt`.

# Relationships

```text
User
 ├── Articles
 ├── Quizzes
 ├── QuizAttempts
 ├── Bookmarks
 └── Notifications

Article
 ├── Author → User
 ├── Category → Category
 ├── Tags → Tag[]
 └── ArticleQuiz

ArticleQuiz
 └── Questions[] → Options[]

Quiz
 ├── Author → User
 ├── Category → Category
 └── QuizQuestions

QuizQuestion
 └── Options[]

QuizAttempt
 ├── User
 ├── Quiz
 └── Answers[]

Bookmark
 ├── User
 └── Article

Notification
 ├── User
 ├── Article (optional)
 └── Quiz (optional)
```

# Embedding vs Referencing

Embed:
- ArticleQuiz questions/options.
- QuizAttempt answers.
- QuizQuestion options.

Reference:
- Users.
- Articles.
- Categories.
- Tags.
- Quizzes.
- Attempts.
- Bookmarks.
- Notifications.

# Data Rules

1. Email unique.
2. Slugs unique.
3. One ArticleQuiz per article.
4. Article quiz exactly 3 questions.
5. Every question exactly 4 options.
6. Exactly one correct option.
7. Bookmark user+article unique.
8. Password always bcrypt hashed.
9. Correct answers never exposed in public responses.
