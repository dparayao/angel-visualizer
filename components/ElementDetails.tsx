import React from 'react';
import { Pattern } from '../lib/types';

interface ElementDetailsProps {
  element: Pattern | null;
}

// Define types for element descriptions
interface ElementDescriptions {
  [key: string]: string;
}

const ElementDetails = ({ element }: ElementDetailsProps) => {
  if (!element) return null;

  const formatTimeRange = (start: number, end: number): string => {
    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  // Helper to get a description based on element type and name
  const getElementDescription = (element: Pattern): string => {
    // The actual descriptions would be more detailed and accurate
    // These are placeholders that you would expand based on your domain knowledge
    
    const descriptions: ElementDescriptions = {
      // Jungle elements
      'Amen Break': 'A famous drum break from The Winstons\' "Amen, Brother" (1969), cornerstone of jungle music.',
      'Reggae Bass': 'A deep, rhythmic bassline inspired by reggae music, often slowed down to fit jungle\'s tempo.',
      'Reese Bass': 'A growling, distorted bass sound named after Kevin Saunderson\'s "Just Want Another Chance" (1988).',
      
      // DNB elements
      'DNB Drums': 'Fast breakbeat patterns at around 170-180 BPM, characterized by syncopated rhythms.',
      'Car Bass': 'Deep, rumbling bass designed to be felt in car audio systems, common in modern DNB.'
    };
    
    // Try to match by name exactly, then by partial name
    if (descriptions[element.name]) {
      return descriptions[element.name];
    }
    
    // Default descriptions by type
    if (element.type === 'jungle') {
      return 'A classic jungle element characterized by choppy breakbeats and deep bass.';
    } else if (element.type === 'dnb') {
      return 'A drum and bass element featuring fast-paced drums and electronic bass.';
    }
    
    return 'An electronic music element used in the mix.';
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-2">Element Details</h2>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-bold">{element.name}</h3>
        <p className="text-sm text-gray-600 mb-4 capitalize">{element.type} element</p>
        
        <p className="mb-4">{getElementDescription(element)}</p>
        
        <div className="mb-4">
          <h4 className="font-bold mb-1">Appearances in mix:</h4>
          <ul className="list-disc list-inside">
            {element.timestamps.map((ts, idx) => (
              <li key={idx} className="text-sm">
                {formatTimeRange(ts.start, ts.end)} 
                <span className="text-gray-500 ml-1">
                  ({Math.round(ts.end - ts.start)} seconds)
                </span>
                {ts.song && (
                  <span className="block text-blue-600 ml-5 text-xs">
                    {ts.song}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        {element.fingerprint && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-bold mb-2">Sound Characteristics:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(element.fingerprint).map(([key, value]) => {
                // Skip complex nested objects for simple display
                if (typeof value === 'object') return null;
                
                const displayValue = String(value);
                
                return (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key.replace('_', ' ')}:</span>
                    <span className="font-mono">{displayValue}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Display additional details if available */}
        {element.details && Object.keys(element.details).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-bold mb-2">Additional Details:</h4>
            <div className="text-sm space-y-2">
              {Object.entries(element.details).map(([key, value]) => {
                // Skip complex nested objects for simple display
                if (typeof value === 'object') return null;
                
                return (
                  <div key={key}>
                    <span className="capitalize font-semibold">{key.replace(/_/g, ' ')}:</span>
                    <span className="ml-2">{String(value)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-bold mb-2">Historical Context:</h4>
          <p className="text-sm">
            {element.type === 'jungle' 
              ? 'Jungle emerged in the UK in the early 1990s, combining influences from reggae, breakbeat hardcore, and techno.'
              : 'Drum and Bass evolved from jungle in the mid-1990s, emphasizing faster tempos and more sophisticated production techniques.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ElementDetails;