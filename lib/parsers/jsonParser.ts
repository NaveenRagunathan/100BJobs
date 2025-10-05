import { RawCandidate } from '@/types/candidate';

export async function parseJsonFile(fileContent: string): Promise<RawCandidate[]> {
  try {
    const parsed = JSON.parse(fileContent);
    
    // Handle array directly
    if (Array.isArray(parsed)) {
      return parsed;
    }

    // Handle object with array property
    if (typeof parsed === 'object' && parsed !== null) {
      // Try common array property names
      const arrayKeys = ['candidates', 'applications', 'data', 'results', 'applicants', 'users'];
      
      for (const key of arrayKeys) {
        if (Array.isArray(parsed[key])) {
          return parsed[key];
        }
      }

      // If no known keys, try to find any array property
      for (const key of Object.keys(parsed)) {
        if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
          return parsed[key];
        }
      }
    }

    throw new Error('Could not find candidate array in JSON structure');
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }
    throw error;
  }
}

export function validateCandidateData(candidates: RawCandidate[]): { 
  valid: boolean; 
  error?: string;
  stats: {
    total: number;
    withEmail: number;
    withName: number;
  };
} {
  if (!Array.isArray(candidates)) {
    return { 
      valid: false, 
      error: 'Candidates data must be an array',
      stats: { total: 0, withEmail: 0, withName: 0 }
    };
  }

  if (candidates.length === 0) {
    return { 
      valid: false, 
      error: 'Candidate array is empty',
      stats: { total: 0, withEmail: 0, withName: 0 }
    };
  }

  const stats = {
    total: candidates.length,
    withEmail: 0,
    withName: 0
  };

  candidates.forEach(candidate => {
    if (typeof candidate !== 'object' || candidate === null) {
      return;
    }

    // Check for name-like fields
    const nameFields = ['name', 'fullname', 'full_name', 'candidate_name', 'applicant_name'];
    if (nameFields.some(field => candidate[field])) {
      stats.withName++;
    }

    // Check for email-like fields
    const emailFields = ['email', 'emailaddress', 'email_address', 'mail'];
    if (emailFields.some(field => candidate[field])) {
      stats.withEmail++;
    }
  });

  return { valid: true, stats };
}
