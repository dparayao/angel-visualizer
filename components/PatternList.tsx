import React from 'react';
import { Pattern } from '../lib/types';

interface PatternListProps {
  patterns: Pattern[];
  onPatternSelect: (pattern: Pattern) => void;
}

const PatternList = ({ patterns, onPatternSelect }: PatternListProps) => {
  // Returns an appropriate icon based on pattern type
  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'jungle':
        return '🥁'; // drum for jungle
      case 'dnb':
        return '🔊'; // speaker for dnb
      default:
        return '📊'; // default icon
    }
  };

  // Returns a color class based on pattern type
  const getPatternColor = (type: string) => {
    switch (type) {
      case 'jungle':
        return 'border-orange-400';
      case 'dnb':
        return 'border-purple-600';
      default:
        return 'border-gray-400';
    }
  };

  return (
    <div className="w-full">
      {patterns.length === 0 ? (
        <p className="text-gray-600">No elements currently active</p>
      ) : (
        <ul className="space-y-2">
          {patterns.map((pattern, index) => (
            <li 
              key={`${pattern.name}-${index}`}
              className={`p-3 bg-white rounded-lg shadow cursor-pointer border-l-4 ${getPatternColor(pattern.type)} hover:bg-gray-50 transition`}
              onClick={() => onPatternSelect(pattern)}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getPatternIcon(pattern.type)}</span>
                <div>
                  <h3 className="font-bold">{pattern.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{pattern.type} element</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatternList;