import React, { useState, useEffect, useRef } from 'react';
import { apiGet } from '../../services/api';

interface User {
  id: string;
  username: string;
  full_name: string;
}

interface UserMultiSelectProps {
  selectedUserIds: string[];
  onChange: (userIds: string[]) => void;
  label?: string;
  placeholder?: string;
}

export const UserMultiSelect: React.FC<UserMultiSelectProps> = ({
  selectedUserIds,
  onChange,
  label = 'Assign to Users',
  placeholder = 'Select users...'
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch active users on mount
  useEffect(() => {
    fetchActiveUsers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchActiveUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching active users from: /api/users/active');

      const data = await apiGet<User[]>('/api/users/active');
      console.log('Users data:', data);

      if (data.success) {
        setUsers(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId: string) => {
    const newSelection = selectedUserIds.includes(userId)
      ? selectedUserIds.filter(id => id !== userId)
      : [...selectedUserIds, userId];

    onChange(newSelection);
  };

  const getSelectedUserNames = (): string => {
    if (selectedUserIds.length === 0) {
      return placeholder;
    }

    const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));
    return selectedUsers.map(user => user.full_name).join(', ');
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  if (loading) {
    return (
      <div className="space-y-1">
        {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
        <div className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-500">
          Loading users...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-1">
        {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
        <div className="w-full p-2 border border-yellow-300 rounded bg-yellow-50 text-yellow-800">
          ⚠️ {error}
        </div>
        <p className="text-xs text-gray-500">
          You can still save the meeting without assigning users. User assignment is optional.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {selectedUserIds.length > 0 && (
            <span className="ml-2 text-xs text-gray-500">
              ({selectedUserIds.length} selected)
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {/* Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-2 border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left"
        >
          <div className="flex items-center justify-between">
            <span className={selectedUserIds.length === 0 ? 'text-gray-400' : 'text-gray-900'}>
              {getSelectedUserNames()}
            </span>
            <div className="flex items-center space-x-2">
              {selectedUserIds.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                  title="Clear all"
                >
                  ✕
                </button>
              )}
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
            {users.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                No users available
              </div>
            ) : (
              <div className="py-1">
                {users.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  return (
                    <label
                      key={user.id}
                      className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleUser(user.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.username}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected users as chips (optional, can be shown below dropdown) */}
      {selectedUserIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {users
            .filter(user => selectedUserIds.includes(user.id))
            .map(user => (
              <span
                key={user.id}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
              >
                {user.full_name}
                <button
                  type="button"
                  onClick={() => toggleUser(user.id)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ✕
                </button>
              </span>
            ))}
        </div>
      )}
    </div>
  );
};

export default UserMultiSelect;
