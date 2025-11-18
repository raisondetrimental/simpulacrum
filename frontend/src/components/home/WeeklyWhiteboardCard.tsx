import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentWeekPosts } from '../../services/whiteboardService';
import type { Week } from '../../types/whiteboard';

const WeeklyWhiteboardCard: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState<Week | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentWeek();
  }, []);

  const loadCurrentWeek = async () => {
    try {
      const { week, error } = await getCurrentWeekPosts();
      if (!error && week) {
        setCurrentWeek(week);
      }
    } catch (error) {
      console.error('Failed to load current week:', error);
    } finally {
      setLoading(false);
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="card bg-white border-gray-200 h-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Whiteboard</h3>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-square">
      <div className="card bg-white border-gray-200 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Weekly Whiteboard</h3>
          <Link to="/whiteboard/weekly" className="text-sm text-slate-600 hover:text-slate-800">
            View All →
          </Link>
        </div>

        {!currentWeek || currentWeek.posts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">No posts this week</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="mb-2 text-xs font-medium text-gray-600">
              Week of {new Date(currentWeek.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' - '}
              {new Date(currentWeek.week_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {currentWeek.posts.slice(0, 6).map((post) => (
                <div
                  key={post.id}
                  className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold text-purple-700">{post.full_name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700">
                    {truncateText(stripHtml(post.content), 100)}
                  </p>
                </div>
              ))}
            </div>
            {currentWeek.posts.length > 6 && (
              <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                <Link
                  to="/whiteboard/weekly"
                  className="text-sm text-slate-600 hover:text-slate-800 font-medium"
                >
                  View {currentWeek.posts.length - 6} more →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyWhiteboardCard;
