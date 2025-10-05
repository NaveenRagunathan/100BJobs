import { RawCandidate, DetectedSchema } from '@/types/candidate';

const FIELD_PATTERNS = {
  name: ['name', 'fullname', 'full_name', 'candidate_name', 'applicant_name', 'candidatename'],
  email: ['email', 'emailaddress', 'email_address', 'mail', 'e_mail'],
  phone: ['phone', 'phonenumber', 'phone_number', 'mobile', 'contact', 'telephone', 'cell'],
  role: ['role', 'position', 'title', 'jobtitle', 'job_title', 'current_role', 'desired_role', 'designation'],
  experience: ['experience', 'work_experience', 'employment', 'work_history', 'job_history', 'previous_roles', 'career'],
  skills: ['skills', 'technical_skills', 'technologies', 'tech_stack', 'competencies', 'expertise', 'proficiencies'],
  education: ['education', 'academic', 'qualifications', 'degrees', 'schooling', 'university'],
  salary: ['salary', 'compensation', 'expected_salary', 'current_salary', 'ctc', 'package', 'pay'],
  location: ['location', 'city', 'address', 'current_location', 'residence', 'based_in', 'region'],
  portfolio: ['portfolio', 'website', 'personal_site', 'projects', 'github', 'linkedin', 'url', 'link']
};

export function detectSchema(candidates: RawCandidate[]): DetectedSchema {
  if (candidates.length === 0) {
    throw new Error('Cannot detect schema from empty candidate array');
  }

  const schema: DetectedSchema = {
    nameFields: [],
    emailFields: [],
    phoneFields: [],
    roleFields: [],
    experienceFields: [],
    skillFields: [],
    educationFields: [],
    salaryFields: [],
    locationFields: [],
    portfolioFields: [],
    unknownFields: []
  };

  // Collect all unique keys from all candidates
  const allKeys = new Set<string>();
  candidates.slice(0, Math.min(50, candidates.length)).forEach(candidate => {
    Object.keys(candidate).forEach(key => allKeys.add(key));
  });

  // Classify each field
  allKeys.forEach(key => {
    const normalizedKey = key.toLowerCase().replace(/[_\s-]/g, '');
    let classified = false;

    for (const [fieldType, patterns] of Object.entries(FIELD_PATTERNS)) {
      if (patterns.some(pattern => normalizedKey.includes(pattern.replace(/[_\s-]/g, '')))) {
        switch (fieldType) {
          case 'name':
            schema.nameFields.push(key);
            break;
          case 'email':
            schema.emailFields.push(key);
            break;
          case 'phone':
            schema.phoneFields.push(key);
            break;
          case 'role':
            schema.roleFields.push(key);
            break;
          case 'experience':
            schema.experienceFields.push(key);
            break;
          case 'skills':
            schema.skillFields.push(key);
            break;
          case 'education':
            schema.educationFields.push(key);
            break;
          case 'salary':
            schema.salaryFields.push(key);
            break;
          case 'location':
            schema.locationFields.push(key);
            break;
          case 'portfolio':
            schema.portfolioFields.push(key);
            break;
        }
        classified = true;
        break;
      }
    }

    if (!classified) {
      schema.unknownFields.push(key);
    }
  });

  return schema;
}

export function extractFieldValue(candidate: RawCandidate, fieldList: string[]): any {
  for (const field of fieldList) {
    if (candidate[field] !== undefined && candidate[field] !== null && candidate[field] !== '') {
      return candidate[field];
    }
  }
  return undefined;
}

export function extractArrayField(candidate: RawCandidate, fieldList: string[]): any[] {
  for (const field of fieldList) {
    const value = candidate[field];
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      // Try to split comma-separated values
      return value.split(',').map(v => v.trim()).filter(v => v);
    }
  }
  return [];
}
