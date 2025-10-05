export interface RawCandidate {
  [key: string]: any;
}

export interface NormalizedCandidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  yearsOfExperience?: number;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  salary?: {
    current?: number;
    expected?: number;
    currency?: string;
  };
  location?: string;
  portfolio?: string;
  github?: string;
  linkedin?: string;
  summary?: string;
  rawData: RawCandidate;
}

export interface ExperienceItem {
  company?: string;
  role?: string;
  duration?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  technologies?: string[];
}

export interface EducationItem {
  institution?: string;
  degree?: string;
  field?: string;
  year?: string;
  gpa?: string;
}

export interface DetectedSchema {
  nameFields: string[];
  emailFields: string[];
  phoneFields: string[];
  roleFields: string[];
  experienceFields: string[];
  skillFields: string[];
  educationFields: string[];
  salaryFields: string[];
  locationFields: string[];
  portfolioFields: string[];
  unknownFields: string[];
}
