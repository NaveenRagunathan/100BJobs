import { RawCandidate, NormalizedCandidate, DetectedSchema, ExperienceItem, EducationItem } from '@/types/candidate';
import { extractFieldValue, extractArrayField } from './schemaDetector';

export function normalizeCandidate(
  rawCandidate: RawCandidate,
  schema: DetectedSchema,
  index: number
): NormalizedCandidate {
  const id = rawCandidate.id || `candidate_${index}`;
  
  // Extract basic fields
  const name = extractFieldValue(rawCandidate, schema.nameFields) || `Candidate ${index}`;
  const email = extractFieldValue(rawCandidate, schema.emailFields) || '';
  const phone = extractFieldValue(rawCandidate, schema.phoneFields);
  const role = extractFieldValue(rawCandidate, schema.roleFields);
  const location = extractFieldValue(rawCandidate, schema.locationFields);

  // Extract and parse skills
  const skills = extractSkills(rawCandidate, schema);

  // Extract and parse experience
  const { experience, yearsOfExperience } = extractExperience(rawCandidate, schema);

  // Extract education
  const education = extractEducation(rawCandidate, schema);

  // Extract salary information
  const salary = extractSalary(rawCandidate, schema);

  // Extract portfolio/social links
  const portfolio = extractPortfolioLinks(rawCandidate, schema);

  // Generate summary from available data
  const summary = generateSummary(rawCandidate, schema);

  return {
    id: String(id),
    name: String(name),
    email: String(email),
    phone: phone ? String(phone) : undefined,
    role: role ? String(role) : undefined,
    yearsOfExperience,
    skills,
    experience,
    education,
    salary,
    location: location ? String(location) : undefined,
    portfolio: portfolio.portfolio,
    github: portfolio.github,
    linkedin: portfolio.linkedin,
    summary,
    rawData: rawCandidate
  };
}

function extractSkills(candidate: RawCandidate, schema: DetectedSchema): string[] {
  const skillsData = extractArrayField(candidate, schema.skillFields);
  const skills: Set<string> = new Set();

  skillsData.forEach(skill => {
    if (typeof skill === 'string') {
      skill.split(/[,;|]/).forEach(s => {
        const trimmed = s.trim();
        if (trimmed) skills.add(trimmed);
      });
    } else if (typeof skill === 'object' && skill !== null) {
      // Handle skills as objects {name: "JavaScript", level: "Expert"}
      const skillName = skill.name || skill.skill || skill.technology;
      if (skillName) skills.add(String(skillName));
    }
  });

  // Also check experience for technologies
  const expData = extractArrayField(candidate, schema.experienceFields);
  expData.forEach(exp => {
    if (typeof exp === 'object' && exp !== null) {
      const techs = exp.technologies || exp.tech_stack || exp.skills;
      if (Array.isArray(techs)) {
        techs.forEach(tech => {
          if (typeof tech === 'string') skills.add(tech.trim());
        });
      } else if (typeof techs === 'string') {
        techs.split(/[,;|]/).forEach(tech => {
          const trimmed = tech.trim();
          if (trimmed) skills.add(trimmed);
        });
      }
    }
  });

  return Array.from(skills);
}

function extractExperience(candidate: RawCandidate, schema: DetectedSchema): { 
  experience: ExperienceItem[];
  yearsOfExperience: number;
} {
  const expData = extractArrayField(candidate, schema.experienceFields);
  const experience: ExperienceItem[] = [];
  let totalYears = 0;

  expData.forEach(exp => {
    if (typeof exp === 'object' && exp !== null) {
      const item: ExperienceItem = {
        company: exp.company || exp.organization || exp.employer,
        role: exp.role || exp.title || exp.position,
        duration: exp.duration || exp.period,
        description: exp.description || exp.responsibilities,
        startDate: exp.start_date || exp.from || exp.startDate,
        endDate: exp.end_date || exp.to || exp.endDate || 'Present',
        technologies: Array.isArray(exp.technologies) ? exp.technologies : 
                     typeof exp.technologies === 'string' ? exp.technologies.split(',').map(t => t.trim()) : []
      };
      experience.push(item);

      // Calculate years from this role
      const years = calculateYearsFromDates(item.startDate, item.endDate) || 
                   extractYearsFromDuration(item.duration);
      if (years) totalYears += years;
    }
  });

  // If no structured experience, try to find years field directly
  if (totalYears === 0) {
    const yearsField = candidate.years_of_experience || candidate.yearsOfExperience || 
                      candidate.experience_years || candidate.totalExperience || candidate.yoe;
    if (typeof yearsField === 'number') {
      totalYears = yearsField;
    } else if (typeof yearsField === 'string') {
      const match = yearsField.match(/(\d+)/);
      if (match) totalYears = parseInt(match[1]);
    }
  }

  return { experience, yearsOfExperience: Math.round(totalYears * 10) / 10 };
}

function extractEducation(candidate: RawCandidate, schema: DetectedSchema): EducationItem[] {
  const eduData = extractArrayField(candidate, schema.educationFields);
  const education: EducationItem[] = [];

  eduData.forEach(edu => {
    if (typeof edu === 'object' && edu !== null) {
      education.push({
        institution: edu.institution || edu.school || edu.university || edu.college,
        degree: edu.degree || edu.qualification,
        field: edu.field || edu.major || edu.specialization,
        year: edu.year || edu.graduation_year || edu.graduationYear,
        gpa: edu.gpa || edu.grade
      });
    } else if (typeof edu === 'string') {
      education.push({ institution: edu });
    }
  });

  return education;
}

function extractSalary(candidate: RawCandidate, schema: DetectedSchema): NormalizedCandidate['salary'] {
  const salaryData = extractFieldValue(candidate, schema.salaryFields);
  
  if (!salaryData) return undefined;

  if (typeof salaryData === 'number') {
    return { expected: salaryData };
  }

  if (typeof salaryData === 'object' && salaryData !== null) {
    return {
      current: salaryData.current || salaryData.current_salary,
      expected: salaryData.expected || salaryData.expected_salary,
      currency: salaryData.currency || 'USD'
    };
  }

  if (typeof salaryData === 'string') {
    const numbers = salaryData.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      return { expected: parseInt(numbers[0]) };
    }
  }

  return undefined;
}

function extractPortfolioLinks(candidate: RawCandidate, schema: DetectedSchema): {
  portfolio?: string;
  github?: string;
  linkedin?: string;
} {
  const portfolioData = extractArrayField(candidate, schema.portfolioFields);
  const result: any = {};

  // Check direct fields first
  if (candidate.github || candidate.githubUrl) {
    result.github = candidate.github || candidate.githubUrl;
  }
  if (candidate.linkedin || candidate.linkedinUrl) {
    result.linkedin = candidate.linkedin || candidate.linkedinUrl;
  }
  if (candidate.portfolio || candidate.website || candidate.personalWebsite) {
    result.portfolio = candidate.portfolio || candidate.website || candidate.personalWebsite;
  }

  // Parse portfolio array
  portfolioData.forEach(item => {
    const url = typeof item === 'string' ? item : item.url || item.link;
    if (url) {
      if (url.includes('github.com') && !result.github) {
        result.github = url;
      } else if (url.includes('linkedin.com') && !result.linkedin) {
        result.linkedin = url;
      } else if (!result.portfolio) {
        result.portfolio = url;
      }
    }
  });

  return result;
}

function generateSummary(candidate: RawCandidate, schema: DetectedSchema): string {
  const summary = candidate.summary || candidate.bio || candidate.about || candidate.description;
  if (summary) return String(summary);

  // Generate from available data
  const parts: string[] = [];
  const role = extractFieldValue(candidate, schema.roleFields);
  const location = extractFieldValue(candidate, schema.locationFields);
  
  if (role) parts.push(`${role}`);
  if (location) parts.push(`based in ${location}`);

  return parts.join(' ') || 'No summary available';
}

function calculateYearsFromDates(startDate?: string, endDate?: string): number | null {
  if (!startDate) return null;

  try {
    const start = new Date(startDate);
    const end = endDate && endDate.toLowerCase() !== 'present' ? new Date(endDate) : new Date();
    
    if (isNaN(start.getTime())) return null;
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    
    return diffYears;
  } catch {
    return null;
  }
}

function extractYearsFromDuration(duration?: string): number | null {
  if (!duration) return null;

  const yearMatch = duration.match(/(\d+)\s*(?:years?|yrs?)/i);
  const monthMatch = duration.match(/(\d+)\s*(?:months?|mos?)/i);

  let years = 0;
  if (yearMatch) years += parseInt(yearMatch[1]);
  if (monthMatch) years += parseInt(monthMatch[1]) / 12;

  return years > 0 ? years : null;
}

export function normalizeCandidates(
  rawCandidates: RawCandidate[],
  schema: DetectedSchema
): NormalizedCandidate[] {
  return rawCandidates.map((candidate, index) => 
    normalizeCandidate(candidate, schema, index)
  );
}
