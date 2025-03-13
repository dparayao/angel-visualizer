import { MixAnnotations, ElementAnalysis, Pattern } from './types';

/**
 * Utilities for loading and preparing data for the Jungle/DNB visualization
 */

/**
 * Loads the mix annotations JSON file
 * @returns {Promise<MixAnnotations>} The loaded mix annotations data
 */
export const loadMixAnnotations = async (): Promise<MixAnnotations> => {
  try {
    const response = await fetch('/data/mix_annotations.json');
    if (!response.ok) {
      throw new Error(`Failed to load mix annotations: ${response.status}`);
    }
    return await response.json() as MixAnnotations;
  } catch (error) {
    console.error('Error loading mix annotations:', error);
    // Return a minimal structure if loading fails
    return {
      youtubeVideoId: '',
      patterns: [],
      songs: []
    };
  }
};

/**
 * Loads the element analysis JSON file
 * @returns {Promise<ElementAnalysis>} The loaded element analysis data
 */
export const loadElementAnalysis = async (): Promise<ElementAnalysis> => {
  try {
    const response = await fetch('/data/element_analysis.json');
    if (!response.ok) {
      throw new Error(`Failed to load element analysis: ${response.status}`);
    }
    return await response.json() as ElementAnalysis;
  } catch (error) {
    console.error('Error loading element analysis:', error);
    return {};
  }
};

/**
 * Merges the mix annotations with the detailed element analysis
 * @returns {Promise<MixAnnotations>} Enhanced mix annotations with detailed element data
 */
export const loadEnhancedMixData = async (): Promise<MixAnnotations> => {
  try {
    const [mixData, analysisData] = await Promise.all([
      loadMixAnnotations(),
      loadElementAnalysis()
    ]);
    
    // Enhance each pattern with its full analysis data if available
    const enhancedPatterns = mixData.patterns.map((pattern: Pattern) => {
      const analysisKey = pattern.name.toLowerCase().replace(/\s+/g, '_');
      const analysis = analysisData[analysisKey] || {};
      
      return {
        ...pattern,
        fingerprint: pattern.fingerprint || analysis.fingerprint || {},
        details: analysis.details || {}
      };
    });
    
    return {
      ...mixData,
      patterns: enhancedPatterns
    };
  } catch (error) {
    console.error('Error creating enhanced mix data:', error);
    return await loadMixAnnotations(); // Fallback to basic data
  }
};