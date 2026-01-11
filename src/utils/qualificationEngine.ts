import { ParsedResume } from './resumeParser';
import { JobQualifications } from './jobQualificationGenerator';

export interface ScoreBreakdown {
  category: string;
  points: number;
  maxPoints: number;
  details: string[];
}

export interface QualificationResult {
  isQualified: boolean;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  talentPool: string;
  scoreBreakdown: ScoreBreakdown[];
}

// Default job requirements (fallback)
const DEFAULT_JOB_REQUIREMENTS = {
  requiredSkills: ['CPA', 'Month-End Close', 'NetSuite', 'Financial Reporting', 'Excel'],
  preferredSkills: ['QuickBooks', 'SAP', 'Team Leadership', 'Budgeting', 'Accounting'],
  minExperience: 5,
  requiredTitleKeywords: ['accountant', 'accounting', 'finance', 'financial', 'cpa'],
};

function extractYearsFromExperience(experience: string): number {
  const match = experience.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function extractMinExperience(requiredExperience: string): number {
  const match = requiredExperience.match(/(\d+)/);
  return match ? parseInt(match[1]) : 3;
}

export function qualifyCandidate(resume: ParsedResume, jobQualifications?: JobQualifications): QualificationResult {
  // Use provided job qualifications or fallback to defaults
  const requirements = jobQualifications ? {
    requiredSkills: jobQualifications.requiredSkills,
    preferredSkills: jobQualifications.preferredSkills,
    minExperience: extractMinExperience(jobQualifications.requiredExperience),
    requiredTitleKeywords: jobQualifications.title.toLowerCase().split(/\s+/),
    requiredCertifications: jobQualifications.requiredCertifications,
  } : DEFAULT_JOB_REQUIREMENTS;
  let score = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const scoreBreakdown: ScoreBreakdown[] = [];
  
  const resumeText = resume.rawText.toLowerCase();
  const resumeSkills = resume.skills.map(s => s.toLowerCase());
  const resumeTitle = resume.title.toLowerCase();
  
  // Check for required skills (max 80 points - increased from 60)
  let requiredSkillsFound = 0;
  const foundRequiredSkills: string[] = [];
  const missingRequiredSkills: string[] = [];
  
  for (const skill of requirements.requiredSkills) {
    // Check for exact match or keyword match
    const skillLower = skill.toLowerCase();
    const hasExactMatch = resumeText.includes(skillLower) || resumeSkills.includes(skillLower);
    
    // Also check for partial keyword matches (e.g., "NetSuite" matches "netsuite", "net suite", etc.)
    const skillWords = skillLower.split(/[\s-]+/);
    const hasKeywordMatch = skillWords.some(word => 
      word.length > 2 && (resumeText.includes(word) || resumeSkills.some(s => s.toLowerCase().includes(word)))
    );
    
    if (hasExactMatch || hasKeywordMatch) {
      requiredSkillsFound++;
      foundRequiredSkills.push(skill);
      strengths.push(`Has ${skill} experience`);
    } else {
      missingRequiredSkills.push(skill);
    }
  }
  
  // Award more points for keyword matches - 15 points per skill (increased from 12)
  const pointsPerSkill = 15;
  const requiredSkillsPoints = requiredSkillsFound * pointsPerSkill;
  score += requiredSkillsPoints;
  scoreBreakdown.push({
    category: 'Required Skills',
    points: Math.round(requiredSkillsPoints),
    maxPoints: requirements.requiredSkills.length * pointsPerSkill,
    details: foundRequiredSkills.length > 0 
      ? [`Found ${foundRequiredSkills.length}/${requirements.requiredSkills.length}: ${foundRequiredSkills.join(', ')}`]
      : [`Missing all required skills: ${requirements.requiredSkills.join(', ')}`],
  });
  
  if (requiredSkillsFound === 0) {
    weaknesses.push(`Missing required skills: ${requirements.requiredSkills.slice(0, 3).join(', ')}`);
  }
  
  // Check for preferred skills (max 30 points - increased from 25)
  let preferredSkillsFound = 0;
  const foundPreferredSkills: string[] = [];
  
  for (const skill of requirements.preferredSkills) {
    const skillLower = skill.toLowerCase();
    const hasExactMatch = resumeText.includes(skillLower) || resumeSkills.includes(skillLower);
    
    // Check for keyword matches
    const skillWords = skillLower.split(/[\s-]+/);
    const hasKeywordMatch = skillWords.some(word => 
      word.length > 2 && (resumeText.includes(word) || resumeSkills.some(s => s.toLowerCase().includes(word)))
    );
    
    if (hasExactMatch || hasKeywordMatch) {
      preferredSkillsFound++;
      foundPreferredSkills.push(skill);
      if (!strengths.some(s => s.includes(skill))) {
        strengths.push(`Has ${skill} experience`);
      }
    }
  }
  
  // Award 3 points per preferred skill (increased from proportional)
  const pointsPerPreferredSkill = 3;
  const preferredSkillsPoints = preferredSkillsFound * pointsPerPreferredSkill;
  score += preferredSkillsPoints;
  scoreBreakdown.push({
    category: 'Preferred Skills',
    points: Math.round(preferredSkillsPoints),
    maxPoints: Math.min(30, requirements.preferredSkills.length * pointsPerPreferredSkill),
    details: foundPreferredSkills.length > 0 
      ? [`Found ${foundPreferredSkills.length}: ${foundPreferredSkills.slice(0, 4).join(', ')}${foundPreferredSkills.length > 4 ? '...' : ''}`]
      : ['No preferred skills found'],
  });
  
  // Check experience level (max 15 points)
  const years = extractYearsFromExperience(resume.experience);
  let experiencePoints = 0;
  let experienceDetails: string[] = [];
  
  if (years > 0) {
    if (years >= requirements.minExperience) {
      experiencePoints = 15;
      strengths.push(`${years} years of experience`);
      experienceDetails = [`${years} years meets requirement (${requirements.minExperience}+)`];
    } else {
      experiencePoints = Math.max(0, (years / requirements.minExperience) * 15);
      weaknesses.push(`Only ${years} years of experience (requires ${requirements.minExperience}+)`);
      experienceDetails = [`${years} years is below requirement (${requirements.minExperience}+)`];
    }
  } else {
    weaknesses.push('Experience level unclear');
    experienceDetails = ['Experience level not found in resume'];
  }
  score += experiencePoints;
  scoreBreakdown.push({
    category: 'Experience',
    points: Math.round(experiencePoints),
    maxPoints: 15,
    details: experienceDetails,
  });
  
  // Check certifications if required (max 20 points per cert, or -20 penalty - increased from 15)
  let certPoints = 0;
  let certDetails: string[] = [];
  
  if (jobQualifications && jobQualifications.requiredCertifications.length > 0) {
    let certsFound = 0;
    const foundCerts: string[] = [];
    
    for (const cert of jobQualifications.requiredCertifications) {
      const certLower = cert.toLowerCase();
      const hasExactMatch = resumeText.includes(certLower) || resumeSkills.includes(certLower);
      
      // Also check for keyword matches (e.g., "CPA" matches "certified public accountant")
      const certWords = certLower.split(/[\s-]+/);
      const hasKeywordMatch = certWords.some(word => 
        word.length > 2 && (resumeText.includes(word) || resumeSkills.some(s => s.toLowerCase().includes(word)))
      );
      
      if (hasExactMatch || hasKeywordMatch) {
        certsFound++;
        foundCerts.push(cert);
        strengths.push(`Has ${cert} certification`);
      }
    }
    
    if (certsFound === 0) {
      weaknesses.push(`Missing required certification: ${jobQualifications.requiredCertifications.join(', ')}`);
      certPoints = -20; // Penalty
      certDetails = [`Missing required: ${jobQualifications.requiredCertifications.join(', ')}`];
    } else {
      // Award 20 points per certification found (increased from proportional)
      certPoints = certsFound * 20;
      certDetails = [`Found ${certsFound}/${jobQualifications.requiredCertifications.length}: ${foundCerts.join(', ')}`];
    }
    score += certPoints;
    scoreBreakdown.push({
      category: 'Certifications',
      points: Math.round(certPoints),
      maxPoints: jobQualifications.requiredCertifications.length > 0 ? jobQualifications.requiredCertifications.length * 20 : 0,
      details: certDetails,
    });
  }
  
  // Check title relevance (max 15 points - increased from 10)
  let titlePoints = 0;
  let titleDetails: string[] = [];
  let matchedKeywords: string[] = [];
  
  for (const keyword of requirements.requiredTitleKeywords) {
    const keywordLower = keyword.toLowerCase();
    if (resumeTitle.includes(keywordLower) || resumeText.includes(keywordLower)) {
      matchedKeywords.push(keyword);
    }
  }
  
  if (matchedKeywords.length > 0) {
    // Award points based on number of keyword matches
    titlePoints = Math.min(15, matchedKeywords.length * 5);
    strengths.push('Relevant job title');
    titleDetails = [`Title matches ${matchedKeywords.length} job keyword(s): ${matchedKeywords.join(', ')}`];
  } else if (resume.title.toLowerCase() !== 'professional') {
    // Partial match for related fields - check for word matches
    const jobTitleLower = jobQualifications?.title.toLowerCase() || '';
    const titleWords = jobTitleLower.split(/\s+/).filter(w => w.length > 3);
    const partialMatches: string[] = [];
    
    for (const word of titleWords) {
      if (resumeText.includes(word) || resumeTitle.includes(word)) {
        partialMatches.push(word);
      }
    }
    
    if (partialMatches.length > 0) {
      titlePoints = Math.min(10, partialMatches.length * 3);
      titleDetails = [`Partial title match: ${partialMatches.join(', ')}`];
    }
  }
  
  if (titlePoints === 0) {
    titleDetails = ['Title does not match job requirements'];
  }
  
  score += titlePoints;
  scoreBreakdown.push({
    category: 'Title Relevance',
    points: Math.round(titlePoints),
    maxPoints: 15,
    details: titleDetails,
  });
  
  // Check for contact info (max 4 points)
  let contactPoints = 0;
  const contactDetails: string[] = [];
  
  if (resume.email) {
    contactPoints += 2;
    contactDetails.push('Email provided');
  }
  if (resume.phone) {
    contactPoints += 2;
    contactDetails.push('Phone provided');
  }
  
  if (contactPoints === 0) {
    contactDetails.push('No contact information found');
  }
  
  score += contactPoints;
  scoreBreakdown.push({
    category: 'Contact Info',
    points: contactPoints,
    maxPoints: 4,
    details: contactDetails,
  });
  
  // Ensure score is between 0-100
  score = Math.min(100, Math.max(0, Math.round(score)));
  
  // Determine qualification (threshold: 60/100)
  const isQualified = score >= 60;
  
  // Generate recommendation
  const jobTitle = jobQualifications?.title || 'Position';
  let recommendation: string;
  let talentPool: string;
  
  if (isQualified) {
    if (score >= 85) {
      recommendation = 'Move to interview stage immediately';
      talentPool = `${jobTitle} - Highly Qualified`;
    } else if (score >= 70) {
      recommendation = 'Move to interview stage';
      talentPool = `${jobTitle} - Qualified`;
    } else {
      recommendation = 'Consider for interview, review experience';
      talentPool = `${jobTitle} - Conditional`;
    }
  } else {
    if (score >= 40) {
      recommendation = 'Not qualified - missing key requirements';
      talentPool = 'Do Not Contact';
    } else {
      recommendation = 'Not qualified - insufficient experience/skills';
      talentPool = 'Do Not Contact';
    }
  }
  
  // Add default strengths/weaknesses if none found
  if (strengths.length === 0) {
    weaknesses.push('Limited relevant experience');
  }
  
  return {
    isQualified,
    score,
    strengths: strengths.length > 0 ? strengths : ['Professional background'],
    weaknesses,
    recommendation,
    talentPool,
    scoreBreakdown,
  };
}
