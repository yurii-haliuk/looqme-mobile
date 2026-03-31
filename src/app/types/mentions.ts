export type Sentiment = 'positive' | 'neutral' | 'negative';

export type SourcePlatform =
  | 'youtube'
  | 'facebook'
  | 'instagram'
  | 'telegram'
  | 'twitter'
  | 'web'
  | 'news'
  | 'forum';

export type MentionState = 'all' | 'selected' | 'processed' | 'unprocessed' | 'deleted';

export type SortOption =
  | 'date_desc'
  | 'date_asc'
  | 'duplicates'
  | 'monthly_audience'
  | 'avg_views'
  | 'engagement'
  | 'views'
  | 'audience'
  | 'author_audience'
  | 'place_audience';

export interface Mention {
  id: string;
  sourceType: SourcePlatform;
  sourceLabel: string;
  sourceUrl: string;
  publishedAt: string;
  author: {
    name: string;
    audience: number;
  };
  sentiment: Sentiment;
  isProcessed: boolean;
  title: string;
  body: string;
  thumbnailUrl?: string;
  metrics: {
    reach: number;
    likes: number;
    comments: number;
    reposts: number;
  };
  tags: string[];
}

export interface SearchProfile {
  id: string;
  name: string;
  icon: string;
  keywords: string[];
}

export interface SentimentSummary {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface TagFilter {
  included: string[];
  excluded: string[];
}

export interface FeedFilters {
  searchProfileId: string | null;
  sentiment: Sentiment | null;
  sources: SourcePlatform[];
  languages: string[];
  countries: string[];
  authors: string[];
  dateRange: { from: Date; to: Date } | null;
  tags: TagFilter;
  mentionState: MentionState;
  sortBy: SortOption;
  geographyEnabled: boolean;
  ratingRange: { min: number; max: number } | null;
  audienceRange: { min: number; max: number } | null;
  mentionType: string[];
  role: string[];
  searchQuery: string;
}

export interface Folder {
  id: string;
  name: string;
  mentionCount: number;
  isSystem: boolean;
}

export type TagColor = '#420c8d' | '#00cc87' | '#fa248c' | '#ff8c00' | '#3b82f6' | '#8b5cf6' | '#6b7280';

export interface SystemTag {
  id: string;
  name: string;
  color: TagColor;
}

export interface ActiveFilterChip {
  key: string;
  label: string;
  category: string;
}
