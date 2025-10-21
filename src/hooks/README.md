# Custom React Hooks

This directory contains custom React hooks for the Housing Authority Exchange application. All hooks use React Query for data fetching and provide consistent loading, error, and success states.

## Architecture

### Base Pattern
All hooks follow a consistent pattern:
- **Loading State**: `isLoading` boolean
- **Error State**: `error` object or null
- **Data State**: `data` with the fetched information
- **Refetch Function**: `refetch()` to manually trigger data fetching
- **Mutation Functions**: For create, update, delete operations

### React Query Integration
- Uses `@tanstack/react-query` for caching and synchronization
- Automatic background refetching
- Optimistic updates for mutations
- Query invalidation for cache management

## Available Hooks

### 1. Discussions Hooks (`useDiscussions.ts`)

**Purpose**: Manage community discussions and interactions

**Key Hooks**:
- `useDiscussions()` - Get all discussions with pagination/filtering
- `useDiscussion(id)` - Get single discussion by ID
- `useTrendingDiscussions(limit)` - Get trending discussions
- `useRecentDiscussions(limit)` - Get recent discussions
- `useSearchDiscussions(term)` - Search discussions
- `useDiscussionsByCategory(category)` - Get discussions by category
- `useUserDiscussions(userId)` - Get user's discussions
- `useDiscussionsByTags(tags)` - Get discussions by tags
- `useDiscussionStats()` - Get discussion statistics

**Mutation Hooks**:
- `useCreateDiscussion()` - Create new discussion
- `useUpdateDiscussion()` - Update existing discussion
- `useDeleteDiscussion()` - Delete discussion
- `useLikeDiscussion()` - Like a discussion
- `useUnlikeDiscussion()` - Unlike a discussion

**Combined Hooks**:
- `useDiscussionsData()` - Get discussions, trending, recent, and stats

**Usage**:
```typescript
import { useDiscussions, useCreateDiscussion, useLikeDiscussion } from '@/hooks';

function DiscussionsPage() {
  const { data: discussions, isLoading, error } = useDiscussions({
    page: 1,
    limit: 20
  });
  
  const createDiscussion = useCreateDiscussion();
  const likeDiscussion = useLikeDiscussion();
  
  const handleCreateDiscussion = async (discussionData) => {
    await createDiscussion.mutateAsync(discussionData);
  };
  
  const handleLike = async (discussionId) => {
    await likeDiscussion.mutateAsync({ 
      discussionId, 
      userId: currentUser.id 
    });
  };
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {discussions?.data?.map(discussion => (
        <DiscussionCard key={discussion.id} discussion={discussion} />
      ))}
    </div>
  );
}
```

### 2. Knowledge Base Hooks (`useKnowledgeBase.ts`)

**Purpose**: Manage knowledge base articles and helpful votes

**Key Hooks**:
- `useKnowledgeArticles()` - Get all articles with pagination
- `useKnowledgeArticle(id)` - Get single article by ID
- `useKnowledgeArticleBySlug(slug)` - Get article by slug
- `usePopularArticles(limit)` - Get most helpful articles
- `useRecentArticles(limit)` - Get recent articles
- `useSearchArticles(term)` - Search articles
- `useArticlesByCategory(category)` - Get articles by category
- `useArticlesByAuthor(authorId)` - Get articles by author
- `useRelatedArticles(articleId)` - Get related articles
- `useKnowledgeArticleStats()` - Get article statistics
- `useCategoryStats()` - Get category statistics

**Mutation Hooks**:
- `useCreateArticle()` - Create new article
- `useUpdateArticle()` - Update existing article
- `useDeleteArticle()` - Delete article
- `useMarkAsHelpful()` - Mark article as helpful
- `useRemoveHelpfulVote()` - Remove helpful vote
- `useGenerateSlug()` - Generate unique slug

**Combined Hooks**:
- `useKnowledgeBaseData()` - Get articles, popular, recent, stats, and category stats
- `useKnowledgeBaseByCategory(category)` - Get category-specific data

**Usage**:
```typescript
import { useKnowledgeArticles, useMarkAsHelpful, useSearchArticles } from '@/hooks';

function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: articles, isLoading } = useKnowledgeArticles({
    page: 1,
    limit: 20
  });
  
  const { data: searchResults } = useSearchArticles(searchTerm);
  const markAsHelpful = useMarkAsHelpful();
  
  const handleMarkHelpful = async (articleId) => {
    await markAsHelpful.mutateAsync({ 
      articleId, 
      userId: currentUser.id 
    });
  };
  
  return (
    <div>
      <SearchInput 
        value={searchTerm}
        onChange={setSearchTerm}
      />
      {searchTerm ? (
        <ArticleList articles={searchResults?.data} />
      ) : (
        <ArticleList articles={articles?.data} />
      )}
    </div>
  );
}
```

### 3. Polls Hooks (`usePolls.ts`)

**Purpose**: Manage community polls and voting

**Key Hooks**:
- `usePolls()` - Get all polls with pagination
- `usePoll(id, userId?)` - Get single poll with user vote status
- `useActivePolls(limit)` - Get active (non-expired) polls
- `useExpiredPolls(limit)` - Get expired polls
- `usePollsByAuthor(authorId)` - Get polls by author
- `useUserVotes(userId)` - Get user's votes
- `usePollResults(pollId, userId?)` - Get poll results with percentages
- `usePollStats()` - Get poll statistics
- `useCanUserVote(pollId, userId)` - Check if user can vote

**Mutation Hooks**:
- `useCreatePoll()` - Create new poll with options
- `useUpdatePoll()` - Update existing poll
- `useDeletePoll()` - Delete poll
- `useVoteOnPoll()` - Vote on poll

**Combined Hooks**:
- `usePollsData()` - Get polls, active polls, and stats
- `usePollManagement()` - Poll CRUD operations
- `usePollVoting()` - Voting operations
- `usePollWithResults(pollId, userId?)` - Get poll with results
- `useUserPollActivity(userId)` - User's poll activity

**Usage**:
```typescript
import { useActivePolls, useVoteOnPoll, usePollResults } from '@/hooks';

function PollsPage() {
  const { data: activePolls, isLoading } = useActivePolls(10);
  const voteOnPoll = useVoteOnPoll();
  
  const handleVote = async (pollId, optionId) => {
    await voteOnPoll.mutateAsync({ 
      pollId, 
      optionId, 
      userId: currentUser.id 
    });
  };
  
  return (
    <div>
      {activePolls?.data?.map(poll => (
        <PollCard 
          key={poll.id} 
          poll={poll}
          onVote={handleVote}
        />
      ))}
    </div>
  );
}
```

### 4. Benchmarks Hooks (`useBenchmarks.ts`)

**Purpose**: Manage performance benchmarks and comparisons

**Key Hooks**:
- `useBenchmarkMetrics()` - Get all benchmark metrics
- `useBenchmarkMetric(id)` - Get single metric by ID
- `useAuthorityBenchmarks(authorityId, period?)` - Get authority's benchmarks
- `useMetricComparison(metricId, period)` - Compare authorities for a metric
- `useMetricRanking(metricId, period)` - Get metric rankings
- `useOverallRank(authorityId, period?)` - Get authority's overall rank
- `useBenchmarkStats()` - Get benchmark statistics
- `useMetricTrends(metricId, periods)` - Get metric trends over time
- `useAllAuthoritiesBenchmarks(period)` - Get all authorities' benchmarks

**Mutation Hooks**:
- `useCreateMetric()` - Create new benchmark metric
- `useUpdateMetric()` - Update existing metric
- `useDeleteMetric()` - Delete metric
- `useSubmitBenchmarkData()` - Submit benchmark data
- `useExportBenchmarkData()` - Export benchmark data

**Combined Hooks**:
- `useBenchmarksData()` - Get metrics and stats
- `useAuthorityBenchmarkData(authorityId, period?)` - Authority-specific data
- `useMetricComparisonData(metricId, period)` - Metric comparison data
- `useBenchmarkManagement()` - Metric CRUD operations
- `useBenchmarkDataSubmission()` - Data submission operations
- `useBenchmarkDashboard(period)` - Comprehensive dashboard data

**Usage**:
```typescript
import { useBenchmarkDashboard, useSubmitBenchmarkData } from '@/hooks';

function BenchmarksPage() {
  const { data: dashboard, isLoading } = useBenchmarkDashboard('2024-Q1');
  const submitData = useSubmitBenchmarkData();
  
  const handleSubmitData = async (benchmarkData) => {
    await submitData.mutateAsync(benchmarkData);
  };
  
  return (
    <div>
      <BenchmarkChart data={dashboard?.allAuthorities?.data} />
      <BenchmarkTable data={dashboard?.stats?.data} />
    </div>
  );
}
```

## Common Patterns

### Loading States
```typescript
const { data, isLoading, error } = useDiscussions();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <DataComponent data={data} />;
```

### Mutations
```typescript
const createDiscussion = useCreateDiscussion();

const handleSubmit = async (formData) => {
  try {
    await createDiscussion.mutateAsync(formData);
    // Success handling
  } catch (error) {
    // Error handling
  }
};
```

### Combined Data
```typescript
const { discussions, trending, recent, stats, isLoading, error } = useDiscussionsData();

// All data is loaded together with combined loading/error states
```

### Query Invalidation
All mutation hooks automatically invalidate related queries:
- Creating a discussion invalidates discussions list and stats
- Voting on a poll invalidates poll results and user votes
- Submitting benchmark data invalidates authority benchmarks

## Configuration

### Stale Times
- **Discussions**: 5 minutes
- **Knowledge Articles**: 5 minutes  
- **Polls**: 2 minutes (more dynamic)
- **Benchmarks**: 15 minutes (less frequently changing)
- **Stats**: 15 minutes

### Retry Counts
- **Default**: 2 retries
- **Critical**: 3 retries
- **Non-critical**: 1 retry

## Error Handling

All hooks provide consistent error handling:

```typescript
const { data, isLoading, error } = useDiscussions();

if (error) {
  console.error('Failed to fetch discussions:', error.message);
  return <ErrorMessage error={error} />;
}
```

## Type Safety

All hooks are fully typed with TypeScript:

```typescript
import type { DiscussionWithAuthor, PollWithOptions } from '@/hooks';

const { data }: { data: DiscussionWithAuthor[] | null } = useDiscussions();
```

## Best Practices

1. **Use combined hooks** for related data to avoid multiple loading states
2. **Handle loading and error states** in your components
3. **Use mutations** for data modifications
4. **Leverage automatic cache invalidation** for data consistency
5. **Use TypeScript types** for better development experience

## Examples

### Complete Discussion Flow
```typescript
import { 
  useDiscussions, 
  useCreateDiscussion, 
  useLikeDiscussion,
  useDiscussionsData 
} from '@/hooks';

function DiscussionsPage() {
  const { discussions, trending, recent, stats, isLoading, error } = useDiscussionsData();
  const createDiscussion = useCreateDiscussion();
  const likeDiscussion = useLikeDiscussion();
  
  const handleCreate = async (data) => {
    await createDiscussion.mutateAsync(data);
  };
  
  const handleLike = async (discussionId) => {
    await likeDiscussion.mutateAsync({ discussionId, userId: currentUser.id });
  };
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <TrendingSection discussions={trending?.data} onLike={handleLike} />
      <RecentSection discussions={recent?.data} onLike={handleLike} />
      <CreateDiscussionForm onSubmit={handleCreate} />
    </div>
  );
}
```

This hooks system provides a clean, consistent, and type-safe interface for all data operations in the Housing Authority Exchange application.
