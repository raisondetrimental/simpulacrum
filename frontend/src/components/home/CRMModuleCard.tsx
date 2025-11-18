import React from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SubLink {
  name: string;
  path: string;
}

interface CRMModuleCardProps {
  title: string;
  description: string;
  icon: string;
  color: 'green' | 'purple' | 'violet' | 'blue';
  organizationCount: number;
  contactCount: number;
  subLinks: SubLink[];
  chartData?: { name: string; value: number }[];
}

const CRMModuleCard: React.FC<CRMModuleCardProps> = ({
  title,
  description,
  icon,
  color,
  organizationCount,
  contactCount,
  subLinks,
  chartData
}) => {
  const colorSchemes = {
    green: {
      gradient: 'from-green-50 to-emerald-100',
      border: 'border-green-200',
      iconBg: 'bg-green-500',
      textPrimary: 'text-green-900',
      textSecondary: 'text-green-700',
      hoverBorder: 'hover:border-green-400',
      chartColors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0']
    },
    purple: {
      gradient: 'from-purple-50 to-purple-100',
      border: 'border-purple-200',
      iconBg: 'bg-purple-500',
      textPrimary: 'text-purple-900',
      textSecondary: 'text-purple-700',
      hoverBorder: 'hover:border-purple-400',
      chartColors: ['#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff']
    },
    violet: {
      gradient: 'from-violet-50 to-violet-100',
      border: 'border-violet-200',
      iconBg: 'bg-violet-500',
      textPrimary: 'text-violet-900',
      textSecondary: 'text-violet-700',
      hoverBorder: 'hover:border-violet-400',
      chartColors: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']
    },
    blue: {
      gradient: 'from-blue-50 to-blue-100',
      border: 'border-blue-200',
      iconBg: 'bg-blue-500',
      textPrimary: 'text-blue-900',
      textSecondary: 'text-blue-700',
      hoverBorder: 'hover:border-blue-400',
      chartColors: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']
    }
  };

  const scheme = colorSchemes[color];

  // Custom tooltip for mini chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white px-3 py-2 rounded-lg shadow-lg border border-slate-700 text-xs">
          <p className="font-semibold">{payload[0].name}</p>
          <p>{payload[0].value} records</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`card bg-gradient-to-br ${scheme.gradient} ${scheme.border} ${scheme.hoverBorder} transition-all duration-300 hover:shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`${scheme.iconBg} rounded-lg p-3 flex-shrink-0`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${scheme.textPrimary} mb-1`}>{title}</h3>
            <p className="text-xs text-gray-600">{description}</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500 font-medium mb-1">Organizations</p>
          <p className={`text-2xl font-bold ${scheme.textPrimary}`}>{organizationCount}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500 font-medium mb-1">Contacts</p>
          <p className={`text-2xl font-bold ${scheme.textPrimary}`}>{contactCount}</p>
        </div>
      </div>

      {/* Mini Chart (if data provided) */}
      {chartData && chartData.length > 0 && (
        <div className="bg-white rounded-lg p-3 border border-gray-200 mb-4">
          <p className="text-xs text-gray-500 font-medium mb-2">Distribution</p>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={scheme.chartColors[index % scheme.chartColors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {chartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: scheme.chartColors[index % scheme.chartColors.length] }}
                ></div>
                <span className="text-xs text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Access</p>
        {subLinks.slice(0, 4).map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`block px-3 py-2 text-sm ${scheme.textSecondary} bg-white rounded-md border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors`}
          >
            <div className="flex items-center justify-between">
              <span>{link.name}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CRMModuleCard;
