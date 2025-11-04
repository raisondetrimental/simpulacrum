/**
 * Weekly Post Card Component
 * Displays an individual weekly whiteboard post
 */
import React from 'react';
import type { WeeklyPost } from '../../../types/whiteboard';
import { formatDateTime } from '../../../types/whiteboard';

interface WeeklyPostCardProps {
  post: WeeklyPost;
  isOwner: boolean;
  onEdit: (post: WeeklyPost) => void;
  onDelete: (post: WeeklyPost) => void;
}

const WeeklyPostCard: React.FC<WeeklyPostCardProps> = ({
  post,
  isOwner,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span className="font-medium text-gray-700">{post.full_name}</span>
            <span>•</span>
            <span>{formatDateTime(post.created_at)}</span>
            {post.updated_at !== post.created_at && (
              <>
                <span>•</span>
                <span className="italic">Edited {formatDateTime(post.updated_at)}</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons (only for owner) */}
        {isOwner && (
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => onEdit(post)}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(post)}
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="prose prose-sm max-w-none text-gray-700 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  );
};

export default WeeklyPostCard;
