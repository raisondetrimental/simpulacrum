/**
 * General Post Card Component
 * Compact card view for general posts list
 */
import React from 'react';
import type { GeneralPost } from '../../../types/whiteboard';
import { formatDateTime } from '../../../types/whiteboard';

interface GeneralPostCardProps {
  post: GeneralPost;
  isOwner: boolean;
  onClick: (post: GeneralPost) => void;
  onEdit: (post: GeneralPost) => void;
  onDelete: (post: GeneralPost) => void;
}

const GeneralPostCard: React.FC<GeneralPostCardProps> = ({
  post,
  isOwner,
  onClick,
  onEdit,
  onDelete,
}) => {
  const replyCount = post.replies?.length || 0;

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(post)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
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

        {/* Action Buttons (only for owner) */}
        {isOwner && (
          <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(post);
              }}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(post);
              }}
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Content Preview (truncated) */}
      <div
        className="prose prose-sm max-w-none text-gray-700 line-clamp-3 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
          </div>
        </div>
        <span className="text-blue-600 font-medium">Click to view →</span>
      </div>
    </div>
  );
};

export default GeneralPostCard;
