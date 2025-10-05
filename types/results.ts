import { NormalizedCandidate } from './candidate';

export interface ScoredCandidate {
  candidate: NormalizedCandidate;
  score: number;
  briefReasoning: string;
  role: string;
}

export interface FinalSelection {
  candidate: NormalizedCandidate;
  role: string;
  matchPercentage: number;
  strengths: string[];
  concerns: string[];
  uniqueQualities: string[];
  detailedReasoning: string;
  rank: number;
}

export interface ProcessingProgress {
  stage: 'uploading' | 'parsing' | 'filtering' | 'scoring' | 'analyzing' | 'complete' | 'error';
  message: string;
  percentage: number;
  candidatesProcessed?: number;
  totalCandidates?: number;
  currentBatch?: number;
  totalBatches?: number;
}

export interface SessionData {
  sessionId: string;
  candidates: NormalizedCandidate[];
  fileHash: string;
  uploadedAt: Date;
  expiresAt: Date;
}

export interface CacheEntry<T> {
  data: T;
  expiresAt: Date;
}

export interface ExportData {
  name: string;
  email: string;
  phone: string;
  role: string;
  matchPercentage: number;
  yearsExperience: number;
  skills: string;
  strengths: string;
  concerns: string;
  reasoning: string;
}
