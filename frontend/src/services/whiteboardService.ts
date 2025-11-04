/**
 * Whiteboard Service
 * API client for weekly posts and general posts with threading
 */
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './api';
import type {
  WeeklyPost,
  Week,
  WeeklyPostFormData,
  GeneralPost,
  GeneralPostFormData,
  Reply,
  ReplyFormData,
  WeeklyPostsResponse,
  WeeklyPostResponse,
  GeneralPostsResponse,
  GeneralPostResponse,
  ReplyResponse,
  DeleteResponse,
} from '../types/whiteboard';

// ============================================================================
// Weekly Whiteboard CRUD
// ============================================================================

/**
 * Get all weekly posts, organized by week
 * Returns posts sorted by week (newest first), then by user order
 */
export async function getWeeklyPosts(): Promise<ApiResponse<Week[]>> {
  return apiGet('/api/whiteboards/weekly');
}

/**
 * Create or update the current user's weekly post for this week
 * Only one post per user per week allowed
 */
export async function createOrUpdateWeeklyPost(data: WeeklyPostFormData): Promise<ApiResponse<WeeklyPost>> {
  return apiPost('/api/whiteboards/weekly', data);
}

/**
 * Update a weekly post (only your own)
 */
export async function updateWeeklyPost(
  postId: string,
  data: Partial<WeeklyPostFormData>
): Promise<ApiResponse<WeeklyPost>> {
  return apiPut(`/api/whiteboards/weekly/${postId}`, data);
}

/**
 * Delete a weekly post (only your own)
 */
export async function deleteWeeklyPost(postId: string): Promise<ApiResponse> {
  return apiDelete(`/api/whiteboards/weekly/${postId}`);
}

// ============================================================================
// General Posts CRUD
// ============================================================================

/**
 * Get all general posts, sorted by importance and date
 * Important posts first, sorted by user order then date
 * Non-important posts sorted by date (newest first)
 */
export async function getGeneralPosts(): Promise<ApiResponse<GeneralPost[]>> {
  return apiGet('/api/whiteboards/general');
}

/**
 * Create a new general post
 */
export async function createGeneralPost(data: GeneralPostFormData): Promise<ApiResponse<GeneralPost>> {
  return apiPost('/api/whiteboards/general', data);
}

/**
 * Update a general post (only your own)
 */
export async function updateGeneralPost(
  postId: string,
  data: Partial<GeneralPostFormData>
): Promise<ApiResponse<GeneralPost>> {
  return apiPut(`/api/whiteboards/general/${postId}`, data);
}

/**
 * Delete a general post (only your own)
 */
export async function deleteGeneralPost(postId: string): Promise<ApiResponse> {
  return apiDelete(`/api/whiteboards/general/${postId}`);
}

// ============================================================================
// Reply/Threading
// ============================================================================

/**
 * Add a reply to a general post
 */
export async function addReply(postId: string, data: ReplyFormData): Promise<ApiResponse<Reply>> {
  return apiPost(`/api/whiteboards/general/${postId}/reply`, data);
}

/**
 * Delete a reply (only your own)
 */
export async function deleteReply(postId: string, replyId: string): Promise<ApiResponse> {
  return apiDelete(`/api/whiteboards/general/${postId}/reply/${replyId}`);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the current week's weekly posts
 */
export async function getCurrentWeekPosts(): Promise<{
  week: Week | null;
  error?: string;
}> {
  try {
    const response = await getWeeklyPosts();

    if (!response.success || !response.data || response.data.length === 0) {
      return {
        week: null,
        error: response.message || 'No weekly posts found',
      };
    }

    // First week in the array is the current week (sorted newest first)
    const currentWeek = response.data[0];

    return {
      week: currentWeek,
    };
  } catch (error) {
    return {
      week: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get top N general posts (for overview page)
 */
export async function getTopGeneralPosts(limit: number = 10): Promise<{
  posts: GeneralPost[];
  error?: string;
}> {
  try {
    const response = await getGeneralPosts();

    if (!response.success || !response.data) {
      return {
        posts: [],
        error: response.message || 'Failed to load posts',
      };
    }

    return {
      posts: response.data.slice(0, limit),
    };
  } catch (error) {
    return {
      posts: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if current user has posted in the current week
 */
export async function checkUserHasPostedThisWeek(userId: string): Promise<{
  hasPosted: boolean;
  post: WeeklyPost | null;
}> {
  const { week } = await getCurrentWeekPosts();

  if (!week) {
    return { hasPosted: false, post: null };
  }

  const userPost = week.posts.find(p => p.user_id === userId);

  return {
    hasPosted: !!userPost,
    post: userPost || null,
  };
}

/**
 * Get whiteboard overview data (for home page)
 */
export async function getWhiteboardOverview(): Promise<ApiResponse<{
  currentWeek: Week | null;
  topGeneralPosts: GeneralPost[];
}>> {
  try {
    const [weekResponse, postsResponse] = await Promise.all([
      getCurrentWeekPosts(),
      getTopGeneralPosts(10),
    ]);

    if (weekResponse.error || postsResponse.error) {
      return {
        success: false,
        message: weekResponse.error || postsResponse.error,
        data: {
          currentWeek: null,
          topGeneralPosts: [],
        },
      };
    }

    return {
      success: true,
      data: {
        currentWeek: weekResponse.week,
        topGeneralPosts: postsResponse.posts,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: {
        currentWeek: null,
        topGeneralPosts: [],
      },
    };
  }
}

/**
 * Get general posts by user
 */
export async function getUserGeneralPosts(userId: string): Promise<{
  posts: GeneralPost[];
  error?: string;
}> {
  try {
    const response = await getGeneralPosts();

    if (!response.success || !response.data) {
      return {
        posts: [],
        error: response.message || 'Failed to load posts',
      };
    }

    const userPosts = response.data.filter(p => p.user_id === userId);

    return {
      posts: userPosts,
    };
  } catch (error) {
    return {
      posts: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Count replies for a post
 */
export function countReplies(post: GeneralPost): number {
  return post.replies?.length || 0;
}

/**
 * Check if a post has replies
 */
export function hasReplies(post: GeneralPost): boolean {
  return countReplies(post) > 0;
}

/**
 * Get total post count (weekly + general)
 */
export async function getTotalPostCount(): Promise<{
  weeklyCount: number;
  generalCount: number;
  totalCount: number;
}> {
  try {
    const [weeklyResponse, generalResponse] = await Promise.all([
      getWeeklyPosts(),
      getGeneralPosts(),
    ]);

    const weeklyCount = weeklyResponse.data?.reduce((sum, week) => sum + week.posts.length, 0) || 0;
    const generalCount = generalResponse.data?.length || 0;

    return {
      weeklyCount,
      generalCount,
      totalCount: weeklyCount + generalCount,
    };
  } catch (error) {
    return {
      weeklyCount: 0,
      generalCount: 0,
      totalCount: 0,
    };
  }
}
