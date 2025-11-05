import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile, updateProfile, changePassword } from '../../services/profileService';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    username: '',
    full_name: '',
    email: '',
    role: '',
    created_at: ''
  });

  // Profile update form
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [profileUpdateMessage, setProfileUpdateMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      if (response.success && response.data) {
        setProfileData(response.data);
        setFullName(response.data.full_name || '');
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileUpdateMessage(null);
    setProfileUpdateLoading(true);

    try {
      if (fullName === profileData.full_name) {
        setProfileUpdateMessage({ type: 'error', text: 'No changes to save' });
        setProfileUpdateLoading(false);
        return;
      }

      const response = await updateProfile({ full_name: fullName });
      if (response.success && response.data) {
        setProfileData(response.data);
        setProfileUpdateMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditingProfile(false);
      } else {
        setProfileUpdateMessage({ type: 'error', text: response.message || 'Failed to update profile' });
      }
    } catch (error: any) {
      setProfileUpdateMessage({
        type: 'error',
        text: error.message || 'Failed to update profile'
      });
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFullName(profileData.full_name || '');
    setIsEditingProfile(false);
    setProfileUpdateMessage(null);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeMessage(null);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordChangeMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setPasswordChangeMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setPasswordChangeLoading(true);

    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });

      setPasswordChangeMessage({ type: 'success', text: 'Password changed successfully!' });

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordChangeMessage({
        type: 'error',
        text: error.message || 'Failed to change password'
      });
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>
          {/* Admin buttons - show for admin and super admin users */}
          <div className="flex gap-2">
            {user?.is_super_admin && (
              <Link
                to="/admin/super"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 transition-colors font-medium"
              >
                My Portal
              </Link>
            )}
            {profileData.role === 'admin' && (
              <Link
                to="/admin/users"
                className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information Card */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {profileUpdateMessage && (
              <div className={`px-4 py-3 rounded-md mb-4 ${
                profileUpdateMessage.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {profileUpdateMessage.text}
              </div>
            )}

            {!isEditingProfile ? (
              // Display mode
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
                  <div className="text-gray-900 font-medium">{profileData.username}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                  <div className="text-gray-900">{profileData.full_name || '-'}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <div className="text-gray-900">{profileData.email || '-'}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                  <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {profileData.role}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Member Since</label>
                  <div className="text-gray-900">
                    {new Date(profileData.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ) : (
              // Edit mode
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
                  <div className="text-gray-900 font-medium bg-gray-50 px-4 py-2 rounded-md border border-gray-200">
                    {profileData.username}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                </div>

                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                    disabled={profileUpdateLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <div className="text-gray-900 bg-gray-50 px-4 py-2 rounded-md border border-gray-200">
                    {profileData.email || '-'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                  <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {profileData.role}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={profileUpdateLoading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {profileUpdateLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={profileUpdateLoading}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Password Change Card */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>

            <p className="text-sm text-gray-600 mb-6">
              Update your password to keep your account secure. You must enter your current password to make changes.
            </p>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passwordChangeMessage && (
                <div className={`px-4 py-3 rounded-md ${
                  passwordChangeMessage.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {passwordChangeMessage.text}
                </div>
              )}

              <div>
                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  id="current_password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter current password"
                  disabled={passwordChangeLoading}
                />
              </div>

              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  id="new_password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new password (min 6 characters)"
                  disabled={passwordChangeLoading}
                />
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirm_password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm new password"
                  disabled={passwordChangeLoading}
                />
              </div>

              <button
                type="submit"
                disabled={passwordChangeLoading}
                className="w-full bg-black text-white py-2 px-4 rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {passwordChangeLoading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
