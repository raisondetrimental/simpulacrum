import React from 'react';
import { Link } from 'react-router-dom';

interface SubLink {
  name: string;
  path: string;
}

interface ModuleCardProps {
  title: string;
  description: string;
  icon: string;
  subLinks: SubLink[];
  preview?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'gray';
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  icon,
  subLinks,
  preview,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
    green: 'border-green-200 hover:border-green-400 hover:bg-green-50',
    purple: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50',
    orange: 'border-orange-200 hover:border-orange-400 hover:bg-orange-50',
    gray: 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    gray: 'text-gray-600'
  };

  return (
    <div className={`bg-white rounded-lg border-2 ${colorClasses[color]} transition-all duration-200 p-6 flex flex-col h-full`}>
      {/* Header */}
      <div className="flex items-start mb-4">
        <svg className={`w-8 h-8 ${iconColorClasses[color]} mr-3 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>

      {/* Preview Section */}
      {preview && (
        <div className="mb-4 py-3 px-4 bg-gray-50 rounded-md border border-gray-200">
          {preview}
        </div>
      )}

      {/* Sub Links */}
      <div className="mt-auto space-y-2">
        {subLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
          >
            → {link.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ModuleCard;
