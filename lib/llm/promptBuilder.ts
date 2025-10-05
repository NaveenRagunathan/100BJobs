import { NormalizedCandidate } from '@/types/candidate';
import { RoleRequirement } from '@/types/query';

export function buildBatchScoringPrompt(
  candidates: NormalizedCandidate[],
  role: RoleRequirement
): string {
  const candidateSummaries = candidates.map(c => ({
    id: c.id,
    name: c.name,
    role: c.role || 'Not specified',
    experience: c.yearsOfExperience || 0,
    skills: c.skills.slice(0, 15).join(', '),
    summary: c.summary?.substring(0, 200) || 'No summary'
  }));

  return `You are evaluating ${candidates.length} candidates for a ${role.title} position.

Requirements:
- Seniority: ${role.seniority}
- Must-have skills: ${role.mustHaveSkills.join(', ')}
- Nice-to-have skills: ${role.niceToHaveSkills.join(', ')}
${role.minYearsExperience ? `- Minimum experience: ${role.minYearsExperience} years` : ''}
${role.maxYearsExperience ? `- Maximum experience: ${role.maxYearsExperience} years` : ''}

Candidates:
${JSON.stringify(candidateSummaries, null, 2)}

Score each candidate 0-100 based on role fit. Return ONLY valid JSON with no markdown formatting:
{
  "scores": [
    {"id": "candidate_id", "score": 85, "reason": "One sentence why"},
    ...
  ]
}`;
}

export function buildDeepAnalysisPrompt(
  candidates: NormalizedCandidate[],
  role: RoleRequirement,
  count: number
): string {
  const candidateDetails = candidates.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    role: c.role || 'Not specified',
    yearsOfExperience: c.yearsOfExperience || 0,
    skills: c.skills.join(', '),
    experience: c.experience.map(e => `${e.role} at ${e.company} (${e.duration || 'duration unknown'})`).join('; '),
    education: c.education.map(e => `${e.degree} from ${e.institution}`).join('; '),
    summary: c.summary,
    portfolio: c.portfolio,
    github: c.github,
    linkedin: c.linkedin
  }));

  return `You are selecting the top ${count} candidates for a ${role.title} position from ${candidates.length} finalists.

Requirements:
- Role: ${role.title}
- Seniority: ${role.seniority}
- Must-have skills: ${role.mustHaveSkills.join(', ')}
- Nice-to-have skills: ${role.niceToHaveSkills.join(', ')}
${role.minYearsExperience ? `- Minimum experience: ${role.minYearsExperience} years` : ''}
- Soft criteria: ${role.softCriteria.join(', ')}

Candidates:
${JSON.stringify(candidateDetails, null, 2)}

Select the best ${count} candidates with detailed analysis. Return ONLY valid JSON with no markdown formatting:
{
  "selections": [
    {
      "id": "candidate_id",
      "rank": 1,
      "matchPercentage": 95,
      "strengths": ["strength1", "strength2", "strength3"],
      "concerns": ["concern1", "concern2"],
      "uniqueQualities": ["quality1", "quality2"],
      "detailedReasoning": "Comprehensive 2-3 sentence explanation of why this candidate is perfect"
    },
    ...
  ]
}`;
}
