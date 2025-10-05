export interface ParsedQuery {
  originalQuery: string;
  roles: RoleRequirement[];
  globalCriteria?: GlobalCriteria;
}

export interface RoleRequirement {
  title: string;
  count: number;
  seniority?: 'junior' | 'mid' | 'senior' | 'lead' | 'any';
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  minYearsExperience?: number;
  maxYearsExperience?: number;
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  location?: string;
  softCriteria: string[];
}

export interface GlobalCriteria {
  totalPositions: number;
  budget?: {
    total?: number;
    perRole?: number;
    currency?: string;
  };
  startDate?: string;
  remote?: boolean;
  cultureFit?: string[];
}

export interface FilterCriteria {
  skills?: string[];
  minExperience?: number;
  maxExperience?: number;
  salaryMax?: number;
  location?: string;
  keywords?: string[];
}
