/**
 * Weekly Whiteboard Page
 * Displays weekly posts organized by week, with current week at top
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getWeeklyPosts,
  createOrUpdateWeeklyPost,
  deleteWeeklyPost,
} from '../../services/whiteboardService';
import type { Week, WeeklyPost, WeeklyPostFormData } from '../../types/whiteboard';
import { formatWeekRange, isCurrentWeek, USER_ORDER } from '../../types/whiteboard';
import WeeklyPostCard from '../../components/features/whiteboard/WeeklyPostCard';
import WeeklyPostEditor from '../../components/features/whiteboard/WeeklyPostEditor';

const WeeklyWhiteboardPage: React.FC = () => {
  const { user } = useAuth();
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editor modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<WeeklyPost | null>(null);
  const [currentWeekLabel, setCurrentWeekLabel] = useState('');
  const [creatingForUser, setCreatingForUser] = useState<{ userId: string; fullName: string } | null>(null);

  // Delete confirmation state
  const [deleteConfirmPost, setDeleteConfirmPost] = useState<WeeklyPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadWeeklyPosts();
  }, []);

  const loadWeeklyPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getWeeklyPosts();

      if (response.success && response.data) {
        setWeeks(response.data);
      } else {
        setError(response.message || 'Failed to load weekly posts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    const currentWeek = weeks.find(w => isCurrentWeek(w.week_start));
    const userPost = currentWeek?.posts.find(p => p.user_id === user?.id);

    setEditingPost(userPost || null);
    setCreatingForUser(null);
    setCurrentWeekLabel(
      currentWeek
        ? formatWeekRange(currentWeek.week_start, currentWeek.week_end)
        : 'Current Week'
    );
    setIsEditorOpen(true);
  };

  const handleCreatePostForUser = (userId: string, fullName: string) => {
    const currentWeek = weeks.find(w => isCurrentWeek(w.week_start));

    setEditingPost(null);
    setCreatingForUser({ userId, fullName });
    setCurrentWeekLabel(
      currentWeek
        ? formatWeekRange(currentWeek.week_start, currentWeek.week_end)
        : 'Current Week'
    );
    setIsEditorOpen(true);
  };

  const handleEditPost = (post: WeeklyPost) => {
    setEditingPost(post);
    setCreatingForUser(null);
    setCurrentWeekLabel(formatWeekRange(post.week_start, post.week_end));
    setIsEditorOpen(true);
  };

  const handleSavePost = async (data: WeeklyPostFormData) => {
    setError(null);
    setSuccess(null);

    const response = await createOrUpdateWeeklyPost(data);

    if (response.success) {
      setSuccess(editingPost ? 'Post updated successfully!' : 'Post created successfully!');
      setIsEditorOpen(false);
      setEditingPost(null);
      await loadWeeklyPosts();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } else {
      throw new Error(response.message || 'Failed to save post');
    }
  };

  const handleDeleteClick = (post: WeeklyPost) => {
    setDeleteConfirmPost(post);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmPost) return;

    try {
      setDeleting(true);
      setError(null);
      setSuccess(null);

      const response = await deleteWeeklyPost(deleteConfirmPost.id);

      if (response.success) {
        setSuccess('Post deleted successfully!');
        setDeleteConfirmPost(null);
        await loadWeeklyPosts();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to delete post');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmPost(null);
  };

  // Check if current user has posted this week
  const currentWeek = weeks.find(w => isCurrentWeek(w.week_start));
  const userHasPostedThisWeek = currentWeek?.posts.some(p => p.user_id === user?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Weekly Whiteboard</h1>
            <p className="text-gray-600 mt-2">
              Share your weekly updates with the team. One post per person per week.
            </p>
          </div>

          {/* Create/Edit Post Buttons */}
          <div className="flex gap-2">
            {/* User's own post button - always shown */}
            <button
              onClick={handleCreatePost}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
            >
              {userHasPostedThisWeek ? '✏️ Edit My Post' : '+ New Post'}
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Weeks List */}
      {weeks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No posts yet</h3>
          <p className="mt-2 text-gray-600">
            Be the first to share your weekly update with the team!
          </p>
          <button
            onClick={handleCreatePost}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
          >
            Create First Post
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {weeks.map((week) => (
            <div key={week.week_start} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              {/* Week Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-300">
                <h2 className="text-xl font-bold text-gray-900">
                  {formatWeekRange(week.week_start, week.week_end)}
                  {isCurrentWeek(week.week_start) && (
                    <span className="ml-3 px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full font-medium">
                      Current Week
                    </span>
                  )}
                </h2>
                <span className="text-sm text-gray-600">
                  {week.posts.length} {week.posts.length === 1 ? 'post' : 'posts'}
                </span>
              </div>

              {/* Posts Grid - Fixed User Order */}
              <div className="space-y-3">
                {USER_ORDER.map((userName) => {
                  const post = week.posts.find(p => p.full_name === userName);
                  const isCurrentWeekSlot = isCurrentWeek(week.week_start);

                  if (!post) {
                    // Empty slot for user who hasn't posted
                    return (
                      <div
                        key={userName}
                        className="bg-gray-100 rounded-lg border border-gray-300 border-dashed p-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">{userName}</span> - No post
                          </p>
                          {isAdmin && isCurrentWeekSlot && (
                            <button
                              onClick={() => handleCreatePostForUser('', userName)}
                              className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 border border-blue-200 transition-colors"
                            >
                              + Add Post
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <WeeklyPostCard
                      key={post.id}
                      post={post}
                      isOwner={post.user_id === user?.id || user?.role === 'admin'}
                      onEdit={handleEditPost}
                      onDelete={handleDeleteClick}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Editor Modal */}
      <WeeklyPostEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingPost(null);
          setCreatingForUser(null);
        }}
        onSave={handleSavePost}
        post={editingPost}
        weekLabel={currentWeekLabel}
        preSelectedUserName={creatingForUser?.fullName}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete your post "<strong>{deleteConfirmPost.title}</strong>"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyWhiteboardPage;
