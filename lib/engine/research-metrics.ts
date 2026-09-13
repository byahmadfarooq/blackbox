export interface ReadabilityMetrics {
  gradeLevel: number;
  readingEase: number;
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  readingLevelCategory: 'Optimal (Grade 6-9)' | 'Moderate (Grade 10-12)' | 'Academic / Heavy (Grade 13+)';
}

export interface BuzzwordMetrics {
  foundBuzzwords: string[];
  buzzwordCount: number;
  buzzwordRatio: number;
}

export interface DomComplexityMetrics {
  totalDomNodes: number;
  maxDomDepth: number;
}

// English syllable counter heuristic
function countSyllablesInWord(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (clean.length <= 3) return 1;
  
  // Replace silent endings
  const processed = clean.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  const syllables = processed.match(/[aeiouy]{1,2}/g);
  return syllables ? Math.max(1, syllables.length) : 1;
}

// Compute Flesch-Kincaid Grade Level based on Unbounce conversion research
export function calculateReadability(text: string): ReadabilityMetrics {
  const cleanedText = text.replace(/\s+/g, ' ').trim();
  if (!cleanedText) {
    return {
      gradeLevel: 8,
      readingEase: 70,
      wordCount: 0,
      sentenceCount: 0,
      syllableCount: 0,
      readingLevelCategory: 'Optimal (Grade 6-9)',
    };
  }

  const sentences = cleanedText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);

  const words = cleanedText.split(/\s+/).filter((w) => w.trim().length > 0);
  const wordCount = Math.max(1, words.length);

  let totalSyllables = 0;
  for (const word of words) {
    totalSyllables += countSyllablesInWord(word);
  }

  // Flesch-Kincaid Grade Level formula
  const rawGrade = 0.39 * (wordCount / sentenceCount) + 11.8 * (totalSyllables / wordCount) - 15.59;
  const gradeLevel = Math.max(1, Math.min(18, Math.round(rawGrade * 10) / 10));

  // Flesch Reading Ease formula
  const rawEase = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (totalSyllables / wordCount);
  const readingEase = Math.max(0, Math.min(100, Math.round(rawEase)));

  let readingLevelCategory: 'Optimal (Grade 6-9)' | 'Moderate (Grade 10-12)' | 'Academic / Heavy (Grade 13+)';
  if (gradeLevel <= 9.5) {
    readingLevelCategory = 'Optimal (Grade 6-9)';
  } else if (gradeLevel <= 12.5) {
    readingLevelCategory = 'Moderate (Grade 10-12)';
  } else {
    readingLevelCategory = 'Academic / Heavy (Grade 13+)';
  }

  return {
    gradeLevel,
    readingEase,
    wordCount,
    sentenceCount,
    syllableCount: totalSyllables,
    readingLevelCategory,
  };
}

// Nielsen Norman Group (NN/g) Buzzword & Information Scent Detector
const B2B_BUZZWORDS = [
  'cutting-edge',
  'cutting edge',
  'synergistic',
  'synergy',
  'all-in-one',
  'all in one',
  'seamless',
  'seamlessly',
  'revolutionize',
  'revolutionizing',
  'game-changer',
  'game changer',
  'empower',
  'empowers',
  'streamline',
  'streamlines',
  'next-generation',
  'next-gen',
  'next gen',
  'disruptive',
  'holistic',
  'world-class',
  'state-of-the-art',
];

export function detectBuzzwords(text: string): BuzzwordMetrics {
  const lowerText = text.toLowerCase();
  const found: string[] = [];

  for (const buzz of B2B_BUZZWORDS) {
    const regex = new RegExp(`\\b${buzz}\\b`, 'i');
    if (regex.test(lowerText)) {
      found.push(buzz);
    }
  }

  const words = lowerText.split(/\s+/).filter(Boolean).length;
  const buzzwordRatio = words > 0 ? (found.length / words) * 100 : 0;

  return {
    foundBuzzwords: found,
    buzzwordCount: found.length,
    buzzwordRatio: Math.round(buzzwordRatio * 100) / 100,
  };
}
