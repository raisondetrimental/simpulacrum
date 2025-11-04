/**
 * General Post Editor Modal
 * Modal for creating/editing general whiteboard posts
 * Admins can create/edit posts on behalf of other users
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getUsers } from '../../../services/usersService';
import RichTextEditor from './RichTextEditor';
import type { GeneralPost, GeneralPostFormData } from '../../../types/whiteboard';
import type { User } from '../../../types/users';

interface GeneralPostEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: GeneralPostFormData & { user_id?: string; full_name?: string }) => Promise<void>;
  post?: GeneralPost | null;
}

const GeneralPostEditor: React.FC<GeneralPostEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  post,
}) => {
  const { user: currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUserFullName, setSelectedUserFullName] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  // Load users if admin
  useEffect(() => {
    const loadUsers = async () => {
      if (isAdmin && isOpen) {
        setLoadingUsers(true);
        try {
          const response = await getUsers();
          if (response.success && response.data) {
            setUsers(response.data);
          }
        } catch (err) {
          console.error('Failed to load users:', err);
        } finally {
          setLoadingUsers(false);
        }
      }
    };

    loadUsers();
  }, [isAdmin, isOpen]);

  // Initialize form with existing post data when editing
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setIsImportant(post.is_important);
      setSelectedUserId(post.user_id);
      setSelectedUserFullName(post.full_name);
    } else {
      setTitle('');
      setContent('');
      setIsImportant(false);
      setSelectedUserId('');
      setSelectedUserFullName('');
    }
    setError(null);
  }, [post, isOpen]);

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    const user = users.find(u => u.id === userId);
    setSelectedUserId(userId);
    setSelectedUserFullName(user?.full_name || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!content.trim() || content === '<p></p>') {
      setError('Content is required');
      return;
    }

    if (isAdmin && !selectedUserId) {
      setError('Please select a user for this post');
      return;
    }

    setSaving(true);

    try {
      const postData: GeneralPostFormData & { user_id?: string; full_name?: string } = {
        title,
        content,
        is_important: isImportant,
      };

      // Add user selection if admin specified a user
      if (isAdmin && selectedUserId && selectedUserFullName) {
        postData.user_id = selectedUserId;
        postData.full_name = selectedUserFullName;
      }

      await onSave(postData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setIsImportant(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-900">
            {post ? 'Edit General Post' : 'New General Post'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {post ? 'Update your post' : 'Create a new post for the team'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Admin User Selector */}
          {isAdmin && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-4">
              <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-2">
                Post on behalf of user *
              </label>
              <select
                id="user-select"
                value={selectedUserId}
                onChange={handleUserChange}
                disabled={saving || loadingUsers}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">-- Select a user --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.username})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-1">
                {loadingUsers ? 'Loading users...' : 'Select which team member this post is for'}
              </p>
            </div>
          )}

          {/* Title */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={saving}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/200 characters</p>
          </div>

          {/* Important Checkbox */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                disabled={saving}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Mark as Important
              </span>
              <span className="text-xs text-gray-500">
                (Important posts appear at the top)
              </span>
            </label>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Write your post..."
              disabled={saving}
              minHeight="300px"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneralPostEditor;
