
export type Language = 'en' | 'ar';

export interface Profile {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  linkedin: string;
  behance: string;
  website: string;
  avatarUrl?: string;
  externalPortfolioUrl?: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export interface Project {
  id: string;
  title: string;
  category: string;
  tags?: string[]; // Custom filters
  description: string;
  imageUrl: string;
  featured: boolean;
  visible: boolean;
  externalLink?: string;
  openInNewTab?: boolean;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  grade?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
  visible: boolean;
}

// Rename the old PortfolioData to PortfolioContent to represent one language set
export interface PortfolioContent {
  profile: Profile;
  skillCategories: SkillCategory[];
  projects: Project[];
  experiences: Experience[];
  education: Education[];
  customSections: CustomSection[];
}

// The new root data structure holding both languages
export interface PortfolioData {
  en: PortfolioContent;
  ar: PortfolioContent;
}
