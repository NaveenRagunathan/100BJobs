import { NormalizedCandidate } from '@/types/candidate';
import { FilterCriteria } from '@/types/query';

export function applyRuleBasedFilter(
  candidates: NormalizedCandidate[],
  criteria: FilterCriteria
): NormalizedCandidate[] {
  // If no specific criteria, return all candidates (for flexible startup hiring)
  if (!criteria.skills?.length && criteria.minExperience === undefined &&
      criteria.maxExperience === undefined && !criteria.salaryMax) {
    return candidates;
  }

  return candidates.filter(candidate => {
    // Skills matching - be more lenient for startup hiring
    if (criteria.skills && criteria.skills.length > 0) {
      const candidateSkills = candidate.skills.map(s => s.toLowerCase());
      const requiredSkills = criteria.skills.map(s => s.toLowerCase());

      // For startup hiring, require at least 1 matching skill, not all
      const hasAnySkills = requiredSkills.some(requiredSkill =>
        candidateSkills.some(cs => cs.includes(requiredSkill) || requiredSkill.includes(cs))
      );

      if (!hasAnySkills) {
        // If no skills match, check if candidate has any technical skills for developer roles
        if (requiredSkills.some(skill => skill.includes('develop') || skill.includes('code') || skill.includes('program'))) {
          const hasAnyTechSkills = candidateSkills.some(cs =>
            cs.includes('javascript') || cs.includes('python') || cs.includes('react') ||
            cs.includes('node') || cs.includes('java') || cs.includes('develop') ||
            cs.includes('code') || cs.includes('program')
          );
          if (!hasAnyTechSkills) return false;
        } else {
          return false;
        }
      }
    }

    // Experience range - be more flexible
    if (criteria.minExperience !== undefined && candidate.yearsOfExperience !== undefined) {
      if (candidate.yearsOfExperience < (criteria.minExperience - 1)) return false; // Allow 1 year flexibility
    }
    if (criteria.maxExperience !== undefined && candidate.yearsOfExperience !== undefined) {
      if (candidate.yearsOfExperience > (criteria.maxExperience + 2)) return false; // Allow more senior candidates
    }

    // Salary filtering - be lenient
    if (criteria.salaryMax !== undefined && candidate.salary?.expected !== undefined) {
      if (candidate.salary.expected > (criteria.salaryMax * 1.2)) return false; // Allow 20% over budget
    }

    return true;
  });
}

export function scoreSkillMatch(candidateSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 1;

  const normalizedCandidateSkills = candidateSkills.map(s => s.toLowerCase());
  const normalizedRequiredSkills = requiredSkills.map(s => s.toLowerCase());

  let matches = 0;
  normalizedRequiredSkills.forEach(required => {
    if (normalizedCandidateSkills.some(cs => 
      cs.includes(required) || required.includes(cs)
    )) {
      matches++;
    }
  });

  return matches / normalizedRequiredSkills.length;
}

export function calculateSeniorityLevel(yearsOfExperience?: number): string {
  if (!yearsOfExperience) return 'unknown';
  if (yearsOfExperience < 2) return 'junior';
  if (yearsOfExperience < 5) return 'mid';
  if (yearsOfExperience < 8) return 'senior';
  return 'lead';
}
