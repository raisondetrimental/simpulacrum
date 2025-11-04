/**
 * Whiteboard Overview Page
 * Home page for whiteboard feature showing current week + top general posts
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getWhiteboardOverview } from '../../services/whiteboardService';
import type { WeeklyPost, GeneralPost } from '../../types/whiteboard';
import { formatWeekRange, formatDateTime, USER_ORDER } from '../../types/whiteboard';

interface WhiteboardOverview {
  currentWeek: {
    week_start: string;
    week_end: string;
    posts: WeeklyPost[];
  } | null;
  topGeneralPosts: GeneralPost[];
}

const WhiteboardOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState<WhiteboardOverview>({
    currentWeek: null,
    topGeneralPosts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getWhiteboardOverview();

      if (response.success && response.data) {
        setOverview(response.data);
      } else {
        setError(response.message || 'Failed to load whiteboard overview');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Whiteboard</h1>
        <p className="text-gray-600 mt-2">
          Team updates, discussions, and announcements
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Whiteboard Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Weekly Whiteboard</h2>
            <Link
              to="/whiteboard/weekly"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View All →
            </Link>
          </div>

          {overview.currentWeek ? (
            <>
              <div className="mb-4 pb-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {formatWeekRange(overview.currentWeek.week_start, overview.currentWeek.week_end)}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {overview.currentWeek.posts.length} of {USER_ORDER.length} team members posted
                </p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {USER_ORDER.map((userName) => {
                  const post = overview.currentWeek!.posts.find(p => p.full_name === userName);

                  if (!post) {
                    return (
                      <div
                        key={userName}
                        className="bg-gray-50 rounded-lg border border-gray-300 border-dashed p-3"
                      >
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">{userName}</span> - No post yet
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={post.id}
                      className="bg-blue-50 rounded-lg border border-blue-200 p-3"
                    >
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">{post.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="font-medium">{post.full_name}</span>
                        {post.user_id === user?.id && (
                          <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                to="/whiteboard/weekly"
                className="mt-4 block w-full py-2 text-center text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
              >
                View Full Weekly Posts
              </Link>
            </>
          ) : (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-10 w-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">No posts this week yet</p>
              <Link
                to="/whiteboard/weekly"
                className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Create Weekly Post
              </Link>
            </div>
          )}
        </div>

        {/* General Posts Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">General Posts</h2>
            <Link
              to="/whiteboard/general"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View All →
            </Link>
          </div>

          {overview.topGeneralPosts.length > 0 ? (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {overview.topGeneralPosts.map((post) => (
                  <Link
                    key={post.id}
                    to="/whiteboard/general"
                    className="block bg-gray-50 rounded-lg border border-gray-200 p-3 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm flex-1">{post.title}</h4>
                      {post.is_important && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          IMPORTANT
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                      <span className="font-medium">{post.full_name}</span>
                      <span>•</span>
                      <span>{formatDateTime(post.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{post.replies?.length || 0} {post.replies?.length === 1 ? 'reply' : 'replies'}</span>
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                to="/whiteboard/general"
                className="mt-4 block w-full py-2 text-center text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
              >
                View All General Posts
              </Link>
            </>
          ) : (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-10 w-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">No general posts yet</p>
              <Link
                to="/whiteboard/general"
                className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Create General Post
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="text-sm font-medium opacity-90">Weekly Posts</div>
          <div className="text-2xl font-bold mt-1">
            {overview.currentWeek?.posts.length || 0} / {USER_ORDER.length}
          </div>
          <div className="text-xs opacity-75 mt-1">This week</div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="text-sm font-medium opacity-90">General Posts</div>
          <div className="text-2xl font-bold mt-1">{overview.topGeneralPosts.length}</div>
          <div className="text-xs opacity-75 mt-1">Recent posts</div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="text-sm font-medium opacity-90">Your Status</div>
          <div className="text-xl font-bold mt-1">
            {overview.currentWeek?.posts.some(p => p.user_id === user?.id) ? (
              <span>✓ Posted this week</span>
            ) : (
              <span>⚠ Not posted yet</span>
            )}
          </div>
          <div className="text-xs opacity-75 mt-1">Weekly whiteboard</div>
        </div>
      </div>
    </div>
  );
};

export default WhiteboardOverviewPage;
