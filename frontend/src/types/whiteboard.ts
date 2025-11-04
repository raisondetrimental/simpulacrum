/**
 * TypeScript types for Whiteboard Module
 * Weekly posts and general posts with threading
 */

// ============================================================================
// User Order (Fixed sorting order)
// ============================================================================

export const USER_ORDER = [
  "Naveen Anandakumar",
  "Aijan Sadyrova",
  "Lavinia Geraldo",
  "Kush Ganatra",
  "Maximilian Johnson",
  "Amgalan Battulga",
  "Cameron Thomas"
] as const;

export type WhiteboardUser = typeof USER_ORDER[number];

// ============================================================================
// Weekly Whiteboard Types
// ============================================================================

export interface WeeklyPost {
  id: string;
  week_start: string;  // ISO date string
  week_end: string;    // ISO date string
  user_id: string;
  full_name: string;
  title: string;
  content: string;     // HTML content from rich text editor
  created_at: string;  // ISO datetime string
  updated_at: string;  // ISO datetime string
}

export interface Week {
  week_start: string;
  week_end: string;
  posts: WeeklyPost[];
}

export interface WeeklyPostFormData {
  title: string;
  content: string;
}

// ============================================================================
// General Posts Types
// ============================================================================

export interface Reply {
  id: string;
  user_id: string;
  full_name: string;
  content: string;     // HTML content from rich text editor
  created_at: string;  // ISO datetime string
}

export interface GeneralPost {
  id: string;
  user_id: string;
  full_name: string;
  title: string;
  content: string;     // HTML content from rich text editor
  is_important: boolean;
  created_at: string;  // ISO datetime string
  updated_at: string;  // ISO datetime string
  replies: Reply[];
}

export interface GeneralPostFormData {
  title: string;
  content: string;
  is_important?: boolean;
}

export interface ReplyFormData {
  content: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface WeeklyPostsResponse {
  success: boolean;
  data: Week[];
  count: number;
  message?: string;
}

export interface WeeklyPostResponse {
  success: boolean;
  data: WeeklyPost;
  message?: string;
}

export interface GeneralPostsResponse {
  success: boolean;
  data: GeneralPost[];
  count: number;
  message?: string;
}

export interface GeneralPostResponse {
  success: boolean;
  data: GeneralPost;
  message?: string;
}

export interface ReplyResponse {
  success: boolean;
  data: Reply;
  message?: string;
}

export interface DeleteResponse {
  success: boolean;
  message?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Get the sort index for a user based on USER_ORDER
 */
export function getUserSortIndex(fullName: string): number {
  const index = USER_ORDER.indexOf(fullName as WhiteboardUser);
  return index === -1 ? USER_ORDER.length : index;
}

/**
 * Format a date range for display
 */
export function formatWeekRange(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart);
  const end = new Date(weekEnd);

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString('en-US', options);
  const endStr = end.toLocaleDateString('en-US', options);

  return `${startStr} - ${endStr}, ${start.getFullYear()}`;
}

/**
 * Check if a week is the current week
 */
export function isCurrentWeek(weekStart: string): boolean {
  const now = new Date();
  const start = new Date(weekStart);

  // Get Monday of current week
  const daysSinceMonday = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const currentMonday = new Date(now);
  currentMonday.setDate(now.getDate() - daysSinceMonday);
  currentMonday.setHours(0, 0, 0, 0);

  return start.getTime() === currentMonday.getTime();
}

/**
 * Format a datetime for display
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format a date for display (without time)
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
}
