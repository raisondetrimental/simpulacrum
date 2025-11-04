/**
 * HighlightedText Component
 * Highlights search query matches within text
 */

import React from 'react';

interface HighlightedTextProps {
  text: string;
  searchQuery?: string;
  className?: string;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, searchQuery, className = '' }) => {
  if (!searchQuery || !searchQuery.trim()) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === searchQuery.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 px-1 rounded font-semibold">
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </span>
  );
};

export default HighlightedText;
