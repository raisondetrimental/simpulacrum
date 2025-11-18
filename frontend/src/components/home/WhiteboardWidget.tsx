import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTopGeneralPosts } from '../../services/whiteboardService';
import type { GeneralPost } from '../../types/whiteboard';

interface WhiteboardWidgetProps {
  limit?: number;
}

const WhiteboardWidget: React.FC<WhiteboardWidgetProps> = ({ limit = 8 }) => {
  const [posts, setPosts] = useState<GeneralPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [limit]);

  const loadPosts = async () => {
    try {
      const { posts: fetchedPosts, error } = await getTopGeneralPosts(limit);
      if (!error) {
        setPosts(fetchedPosts);
      }
    } catch (error) {
      console.error('Failed to load whiteboard posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="card bg-white border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Whiteboard Posts</h3>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-white border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Latest Whiteboard Posts</h3>
        <Link to="/whiteboard" className="text-sm text-slate-600 hover:text-slate-800">
          View All Posts →
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No whiteboard posts yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/whiteboard/general/${post.id}`}
              className="block p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">{post.title}</h4>
                  {post.is_important && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 flex-shrink-0">
                      Important
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{formatDate(post.created_at)}</span>
              </div>

              <p className="text-xs text-gray-600 mb-2">
                {truncateText(stripHtml(post.content), 120)}
              </p>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">By {post.full_name}</span>
                {post.replies && post.replies.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default WhiteboardWidget;
