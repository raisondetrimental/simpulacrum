/**
 * General Post Detail Modal
 * Shows full post with threaded replies
 */
import React, { useState } from 'react';
import RichTextEditor from './RichTextEditor';
import type { GeneralPost, ReplyFormData } from '../../../types/whiteboard';
import { formatDateTime } from '../../../types/whiteboard';

interface GeneralPostDetailProps {
  post: GeneralPost;
  isOpen: boolean;
  onClose: () => void;
  onAddReply: (data: ReplyFormData) => Promise<void>;
  onDeleteReply: (replyId: string) => Promise<void>;
  currentUserId: string;
  currentUserRole?: string;
}

const GeneralPostDetail: React.FC<GeneralPostDetailProps> = ({
  post,
  isOpen,
  onClose,
  onAddReply,
  onDeleteReply,
  currentUserId,
  currentUserRole,
}) => {
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!replyContent.trim() || replyContent === '<p></p>') {
      setError('Reply content is required');
      return;
    }

    setSubmitting(true);

    try {
      await onAddReply({ content: replyContent });
      setReplyContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) {
      return;
    }

    setDeletingReplyId(replyId);
    try {
      await onDeleteReply(replyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete reply');
    } finally {
      setDeletingReplyId(null);
    }
  };

  if (!isOpen) return null;

  const sortedReplies = [...post.replies].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{post.title}</h2>
              {post.is_important && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  IMPORTANT
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{post.full_name}</span>
              <span>•</span>
              <span>{formatDateTime(post.created_at)}</span>
              {post.updated_at !== post.created_at && (
                <>
                  <span>•</span>
                  <span className="italic">Edited</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Post Content */}
        <div className="p-6 border-b border-gray-200">
          <div
            className="prose prose-sm max-w-none text-gray-700 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Replies Section */}
        <div className="p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Replies ({sortedReplies.length})
          </h3>

          {/* Existing Replies */}
          {sortedReplies.length > 0 ? (
            <div className="space-y-4 mb-6">
              {sortedReplies.map((reply) => (
                <div key={reply.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-medium text-gray-900">{reply.full_name}</span>
                      <span className="text-gray-500">{formatDateTime(reply.created_at)}</span>
                    </div>
                    {(reply.user_id === currentUserId || currentUserRole === 'admin') && (
                      <button
                        onClick={() => handleDeleteReply(reply.id)}
                        disabled={deletingReplyId === reply.id}
                        className="text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingReplyId === reply.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                  <div
                    className="prose prose-sm max-w-none text-gray-700 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6"
                    dangerouslySetInnerHTML={{ __html: reply.content }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 mb-6 bg-white rounded-lg border border-gray-200 border-dashed">
              <svg
                className="mx-auto h-10 w-10 text-gray-400 mb-2"
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
              <p className="text-gray-500">No replies yet. Be the first to reply!</p>
            </div>
          )}

          {/* Add Reply Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Add a Reply</h4>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmitReply}>
              <RichTextEditor
                content={replyContent}
                onChange={setReplyContent}
                placeholder="Write your reply..."
                disabled={submitting}
                minHeight="150px"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setReplyContent('')}
                  disabled={submitting || !replyContent}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralPostDetail;
