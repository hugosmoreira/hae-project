# API Services Layer

This directory contains a centralized API service layer for the Housing Authority Exchange application. All services use Supabase as the backend and provide a consistent interface for data operations.

## Architecture

### Base Service (`base.ts`)
- `BaseApiService`: Abstract base class with common CRUD operations
- Generic request functions: `get()`, `getById()`, `post()`, `put()`, `delete()`
- Built-in pagination, sorting, filtering, and search capabilities
- Consistent error handling and response formatting

### Service Structure
```
src/services/api/
├── base.ts              # Base API service with common functionality
├── discussions.ts       # Discussion management
├── knowledgeBase.ts     # Knowledge base articles
├── polls.ts            # Community polls and voting
├── users.ts            # User profiles and management
├── benchmarks.ts       # Performance benchmarks
├── index.ts            # Centralized exports
└── README.md           # This documentation
```

## Available Services

### 1. Discussions API (`discussionsApi`)
**Purpose**: Manage community discussions and replies

**Key Methods**:
- `getAllDiscussions()` - Get all discussions with pagination
- `getDiscussionById(id)` - Get discussion with full details
- `createDiscussion(discussion)` - Create new discussion
- `searchDiscussions(term)` - Search discussions
- `getTrendingDiscussions()` - Get trending discussions
- `likeDiscussion(id, userId)` - Like/unlike discussions

**Usage**:
```typescript
import { discussionsApi } from '@/services/api';

// Get all discussions
const result = await discussionsApi.getAllDiscussions({
  page: 1,
  limit: 20
});

// Create a new discussion
const newDiscussion = await discussionsApi.createDiscussion({
  title: 'New Discussion',
  content: 'Discussion content...',
  author_id: userId,
  category: 'General'
});
```

### 2. Knowledge Base API (`knowledgeBaseApi`)
**Purpose**: Manage knowledge base articles and helpful votes

**Key Methods**:
- `getAllArticles()` - Get all articles with pagination
- `getArticleById(id)` - Get article by ID
- `getArticleBySlug(slug)` - Get article by slug
- `createArticle(article)` - Create new article
- `searchArticles(term)` - Search articles
- `markAsHelpful(id, userId)` - Mark article as helpful
- `getPopularArticles()` - Get most helpful articles

**Usage**:
```typescript
import { knowledgeBaseApi } from '@/services/api';

// Search articles
const articles = await knowledgeBaseApi.searchArticles('HUD guidelines');

// Mark article as helpful
await knowledgeBaseApi.markAsHelpful(articleId, userId);
```

### 3. Polls API (`pollsApi`)
**Purpose**: Manage community polls and voting

**Key Methods**:
- `getAllPolls()` - Get all polls
- `getPollById(id, userId?)` - Get poll with user vote status
- `createPoll(poll, options)` - Create poll with options
- `voteOnPoll(pollId, optionId, userId)` - Vote on poll
- `getPollResults(pollId)` - Get poll results with percentages
- `getActivePolls()` - Get active (non-expired) polls

**Usage**:
```typescript
import { pollsApi } from '@/services/api';

// Create a poll with options
const poll = await pollsApi.createPoll(
  {
    question: 'What is your preferred inspection method?',
    description: 'Help us understand your processes',
    author_id: userId,
    expires_at: '2024-12-31'
  },
  [
    { option_text: 'Physical inspections only' },
    { option_text: 'Virtual inspections only' },
    { option_text: 'Hybrid approach' }
  ]
);

// Vote on poll
await pollsApi.voteOnPoll(pollId, optionId, userId);
```

### 4. Users API (`usersApi`)
**Purpose**: Manage user profiles, roles, and permissions

**Key Methods**:
- `getAllUsers()` - Get all users with profiles
- `getUserById(id)` - Get user by ID
- `getCurrentUser()` - Get current authenticated user
- `updateProfile(id, updates)` - Update user profile
- `searchUsers(term)` - Search users
- `assignRole(userId, role)` - Assign role to user
- `getUserPermissions(userId)` - Get user permissions

**Usage**:
```typescript
import { usersApi } from '@/services/api';

// Get current user
const currentUser = await usersApi.getCurrentUser();

// Update profile
await usersApi.updateProfile(userId, {
  username: 'New Name',
  role: 'Inspector',
  region: 'Oregon'
});

// Check permissions
const permissions = await usersApi.getUserPermissions(userId);
```

### 5. Benchmarks API (`benchmarksApi`)
**Purpose**: Manage performance benchmarks and comparisons

**Key Methods**:
- `getMetrics()` - Get all benchmark metrics
- `submitBenchmarkData(data)` - Submit benchmark data
- `getAuthorityBenchmarks(authorityId)` - Get authority's benchmarks
- `getMetricComparison(metricId, period)` - Compare authorities
- `getBenchmarkStats()` - Get benchmark statistics
- `exportBenchmarkData(metricIds, period)` - Export data

**Usage**:
```typescript
import { benchmarksApi } from '@/services/api';

// Submit benchmark data
await benchmarksApi.submitBenchmarkData({
  metric_id: 'inspection_completion_rate',
  authority_id: 'authority-123',
  value: 95.5,
  period: '2024-Q1'
});

// Get authority comparison
const comparison = await benchmarksApi.getMetricComparison(
  'inspection_completion_rate',
  '2024-Q1'
);
```

## Common Patterns

### Error Handling
All API methods return a consistent `ApiResponse<T>` format:
```typescript
type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  success: boolean;
};
```

### Pagination
Use the `PaginationParams` interface:
```typescript
const result = await discussionsApi.getAllDiscussions({
  page: 1,
  limit: 20,
  offset: 0
});
```

### Sorting
Use the `SortParams` interface:
```typescript
const result = await knowledgeBaseApi.getAllArticles(
  undefined, // pagination
  { column: 'helpful_count', ascending: false } // sort
);
```

### Filtering
Use the `FilterParams` interface:
```typescript
const result = await discussionsApi.getAllDiscussions(
  undefined, // pagination
  undefined, // sort
  { category: 'Inspections', author_id: userId } // filters
);
```

## Type Safety

All services are fully typed with TypeScript. Import types from the main index:

```typescript
import type { 
  DiscussionWithAuthor,
  KnowledgeArticleWithAuthor,
  PollWithOptions,
  UserWithProfile,
  AuthorityBenchmark
} from '@/services/api';
```

## Error Handling

Use the `handleApiResponse` utility for consistent error handling:

```typescript
import { handleApiResponse } from '@/services/api';

try {
  const discussions = handleApiResponse(
    await discussionsApi.getAllDiscussions()
  );
  // Use discussions data
} catch (error) {
  console.error('Failed to fetch discussions:', error.message);
}
```

## Health Checks

Check service health:

```typescript
import { checkServiceHealth } from '@/services/api';

const health = await checkServiceHealth();
console.log('API Health:', health.overall);
```

## Best Practices

1. **Always handle errors**: Use try-catch blocks or the `handleApiResponse` utility
2. **Use pagination**: For large datasets, always specify pagination parameters
3. **Cache results**: Consider using React Query or similar for caching
4. **Type safety**: Use TypeScript types for better development experience
5. **Consistent naming**: Follow the established naming conventions

## Examples

### Complete Discussion Flow
```typescript
import { discussionsApi } from '@/services/api';

// Get trending discussions
const trending = await discussionsApi.getTrendingDiscussions(5);

// Create a new discussion
const newDiscussion = await discussionsApi.createDiscussion({
  title: 'Best Practices for Virtual Inspections',
  content: 'What tools and processes work best?',
  author_id: currentUser.id,
  category: 'Technology',
  tags: ['Virtual Inspections', 'Technology']
});

// Like the discussion
await discussionsApi.likeDiscussion(newDiscussion.id, currentUser.id);
```

### Complete Poll Flow
```typescript
import { pollsApi } from '@/services/api';

// Create a poll
const poll = await pollsApi.createPoll(
  {
    question: 'How often do you conduct inspections?',
    author_id: currentUser.id,
    expires_at: '2024-12-31'
  },
  [
    { option_text: 'Daily' },
    { option_text: 'Weekly' },
    { option_text: 'Monthly' },
    { option_text: 'As needed' }
  ]
);

// Vote on the poll
await pollsApi.voteOnPoll(poll.id, optionId, currentUser.id);

// Get results
const results = await pollsApi.getPollResults(poll.id);
```

This API service layer provides a robust, type-safe, and consistent interface for all data operations in the Housing Authority Exchange application.
