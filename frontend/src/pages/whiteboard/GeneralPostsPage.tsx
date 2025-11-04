/**
 * General Posts Page
 * Displays all general whiteboard posts with threading
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getGeneralPosts,
  createGeneralPost,
  updateGeneralPost,
  deleteGeneralPost,
  addReply,
  deleteReply,
} from '../../services/whiteboardService';
import type { GeneralPost, GeneralPostFormData, ReplyFormData } from '../../types/whiteboard';
import GeneralPostCard from '../../components/features/whiteboard/GeneralPostCard';
import GeneralPostDetail from '../../components/features/whiteboard/GeneralPostDetail';
import GeneralPostEditor from '../../components/features/whiteboard/GeneralPostEditor';

const GeneralPostsPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<GeneralPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editor modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<GeneralPost | null>(null);

  // Detail modal state
  const [detailPost, setDetailPost] = useState<GeneralPost | null>(null);

  // Delete confirmation state
  const [deleteConfirmPost, setDeleteConfirmPost] = useState<GeneralPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadGeneralPosts();
  }, []);

  const loadGeneralPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getGeneralPosts();

      if (response.success && response.data) {
        setPosts(response.data);
      } else {
        setError(response.message || 'Failed to load general posts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setIsEditorOpen(true);
  };

  const handleEditPost = (post: GeneralPost) => {
    setEditingPost(post);
    setIsEditorOpen(true);
  };

  const handleSavePost = async (data: GeneralPostFormData) => {
    setError(null);
    setSuccess(null);

    if (editingPost) {
      // Update existing post
      const response = await updateGeneralPost(editingPost.id, data);
      if (response.success) {
        setSuccess('Post updated successfully!');
        setIsEditorOpen(false);
        setEditingPost(null);
        await loadGeneralPosts();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to update post');
      }
    } else {
      // Create new post
      const response = await createGeneralPost(data);
      if (response.success) {
        setSuccess('Post created successfully!');
        setIsEditorOpen(false);
        await loadGeneralPosts();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to create post');
      }
    }
  };

  const handleDeleteClick = (post: GeneralPost) => {
    setDeleteConfirmPost(post);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmPost) return;

    try {
      setDeleting(true);
      setError(null);
      setSuccess(null);

      const response = await deleteGeneralPost(deleteConfirmPost.id);

      if (response.success) {
        setSuccess('Post deleted successfully!');
        setDeleteConfirmPost(null);
        await loadGeneralPosts();
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

  const handlePostClick = (post: GeneralPost) => {
    setDetailPost(post);
  };

  const handleCloseDetail = () => {
    setDetailPost(null);
  };

  const handleAddReply = async (data: ReplyFormData) => {
    if (!detailPost) return;

    setError(null);
    const response = await addReply(detailPost.id, data);

    if (response.success) {
      setSuccess('Reply added successfully!');
      await loadGeneralPosts();
      // Update detail post to show new reply
      const updatedPosts = await getGeneralPosts();
      if (updatedPosts.success && updatedPosts.data) {
        const updatedPost = updatedPosts.data.find(p => p.id === detailPost.id);
        if (updatedPost) {
          setDetailPost(updatedPost);
        }
      }
      setTimeout(() => setSuccess(null), 3000);
    } else {
      throw new Error(response.message || 'Failed to add reply');
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!detailPost) return;

    setError(null);
    const response = await deleteReply(detailPost.id, replyId);

    if (response.success) {
      setSuccess('Reply deleted successfully!');
      await loadGeneralPosts();
      // Update detail post to reflect deletion
      const updatedPosts = await getGeneralPosts();
      if (updatedPosts.success && updatedPosts.data) {
        const updatedPost = updatedPosts.data.find(p => p.id === detailPost.id);
        if (updatedPost) {
          setDetailPost(updatedPost);
        }
      }
      setTimeout(() => setSuccess(null), 3000);
    } else {
      throw new Error(response.message || 'Failed to delete reply');
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
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">General Posts</h1>
            <p className="text-gray-600 mt-2">
              Share updates, discussions, and important announcements with the team.
            </p>
          </div>

          {/* Create Post Button */}
          <button
            onClick={handleCreatePost}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
          >
            + New Post
          </button>
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

      {/* Posts List */}
      {posts.length === 0 ? (
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No posts yet</h3>
          <p className="mt-2 text-gray-600">
            Start a conversation by creating the first post!
          </p>
          <button
            onClick={handleCreatePost}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
          >
            Create First Post
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <GeneralPostCard
              key={post.id}
              post={post}
              isOwner={post.user_id === user?.id || user?.role === 'admin'}
              onClick={handlePostClick}
              onEdit={handleEditPost}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Post Editor Modal */}
      <GeneralPostEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingPost(null);
        }}
        onSave={handleSavePost}
        post={editingPost}
      />

      {/* Post Detail Modal */}
      {detailPost && user && (
        <GeneralPostDetail
          post={detailPost}
          isOpen={!!detailPost}
          onClose={handleCloseDetail}
          onAddReply={handleAddReply}
          onDeleteReply={handleDeleteReply}
          currentUserId={user.id}
          currentUserRole={user.role}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the post "<strong>{deleteConfirmPost.title}</strong>"?
              This will also delete all replies. This action cannot be undone.
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

export default GeneralPostsPage;
