export interface JobQualifications {
  title: string;
  requiredDegree?: string;
  requiredExperience: string;
  requiredCertifications: string[];
  preferredSkills: string[];
  requiredSkills: string[];
  description: string;
}

const jobPatterns: {
  pattern: RegExp;
  qualifications: Omit<JobQualifications, 'title'>;
}[] = [
  // Accounting/Finance
  {
    pattern: /accountant|accounting|cpa|finance|financial analyst|controller/i,
    qualifications: {
      requiredDegree: "Bachelor's in Accounting, Finance, or related field",
      requiredExperience: "5+ years",
      requiredCertifications: ['CPA'],
      preferredSkills: ['NetSuite', 'QuickBooks', 'Excel', 'Month-End Close', 'Financial Reporting'],
      requiredSkills: ['GAAP', 'Financial Statements', 'Reconciliation'],
      description: "We're looking for an experienced accounting professional to join our finance team.",
    },
  },
  // Software Engineering
  {
    pattern: /software engineer|developer|programmer|software developer|full.?stack|backend|frontend/i,
    qualifications: {
      requiredDegree: "Bachelor's in Computer Science, Software Engineering, or related field",
      requiredExperience: "3+ years",
      requiredCertifications: [],
      preferredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS'],
      requiredSkills: ['Software Development', 'Version Control', 'Problem Solving'],
      description: "We're looking for an experienced software engineer to join our development team.",
    },
  },
  // Data Science
  {
    pattern: /data scientist|data analyst|machine learning|ml engineer|data engineer/i,
    qualifications: {
      requiredDegree: "Bachelor's in Data Science, Statistics, Computer Science, or related field",
      requiredExperience: "3+ years",
      requiredCertifications: [],
      preferredSkills: ['Python', 'SQL', 'Machine Learning', 'TensorFlow', 'Pandas', 'Data Visualization'],
      requiredSkills: ['Data Analysis', 'Statistical Modeling', 'SQL'],
      description: "We're looking for an experienced data professional to join our analytics team.",
    },
  },
  // Product Management
  {
    pattern: /product manager|product owner|pm|product lead/i,
    qualifications: {
      requiredDegree: "Bachelor's degree (MBA preferred)",
      requiredExperience: "5+ years",
      requiredCertifications: [],
      preferredSkills: ['Product Strategy', 'Agile', 'Scrum', 'User Research', 'Data Analysis', 'Roadmapping'],
      requiredSkills: ['Product Management', 'Stakeholder Management', 'Strategic Thinking'],
      description: "We're looking for an experienced product manager to lead our product initiatives.",
    },
  },
  // Marketing
  {
    pattern: /marketing|marketer|marketing manager|digital marketing|content marketing/i,
    qualifications: {
      requiredDegree: "Bachelor's in Marketing, Communications, or related field",
      requiredExperience: "3+ years",
      requiredCertifications: [],
      preferredSkills: ['SEO', 'Content Marketing', 'Social Media', 'Analytics', 'Campaign Management'],
      requiredSkills: ['Marketing Strategy', 'Content Creation', 'Analytics'],
      description: "We're looking for an experienced marketing professional to join our marketing team.",
    },
  },
  // Sales
  {
    pattern: /sales|account executive|business development|bd|sales manager/i,
    qualifications: {
      requiredDegree: "Bachelor's degree",
      requiredExperience: "3+ years",
      requiredCertifications: [],
      preferredSkills: ['CRM', 'Negotiation', 'Relationship Building', 'Pipeline Management'],
      requiredSkills: ['Sales', 'Communication', 'Customer Relationship Management'],
      description: "We're looking for an experienced sales professional to join our sales team.",
    },
  },
  // HR/Recruiting
  {
    pattern: /hr|human resources|recruiter|talent acquisition|people ops/i,
    qualifications: {
      requiredDegree: "Bachelor's in Human Resources, Business, or related field",
      requiredExperience: "3+ years",
      requiredCertifications: ['SHRM-CP', 'PHR'],
      preferredSkills: ['ATS', 'Recruiting', 'Employee Relations', 'Talent Management'],
      requiredSkills: ['HR Management', 'Recruiting', 'Compliance'],
      description: "We're looking for an experienced HR professional to join our people team.",
    },
  },
  // Design/UX
  {
    pattern: /designer|ux|ui|user experience|product designer|graphic designer/i,
    qualifications: {
      requiredDegree: "Bachelor's in Design, HCI, or related field",
      requiredExperience: "3+ years",
      requiredCertifications: [],
      preferredSkills: ['Figma', 'Sketch', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
      requiredSkills: ['Design', 'User Experience', 'Prototyping'],
      description: "We're looking for an experienced designer to join our design team.",
    },
  },
  // Operations
  {
    pattern: /operations|ops|operations manager|operations analyst/i,
    qualifications: {
      requiredDegree: "Bachelor's in Business, Operations, or related field",
      requiredExperience: "3+ years",
      requiredCertifications: [],
      preferredSkills: ['Process Improvement', 'Project Management', 'Analytics', 'Supply Chain'],
      requiredSkills: ['Operations Management', 'Process Optimization', 'Analytics'],
      description: "We're looking for an experienced operations professional to join our operations team.",
    },
  },
  // Medical - Neurosurgeon
  {
    pattern: /neurosurgeon|neurosurgery|neuro.?surgeon/i,
    qualifications: {
      requiredDegree: "MD (Doctor of Medicine) from accredited medical school",
      requiredExperience: "7+ years (including residency and fellowship)",
      requiredCertifications: ['Board Certified in Neurological Surgery', 'State Medical License'],
      preferredSkills: ['Spinal Surgery', 'Brain Surgery', 'Minimally Invasive Techniques', 'Stereotactic Surgery', 'Neuro-oncology'],
      requiredSkills: ['Neurosurgery', 'Surgical Skills', 'Patient Care', 'Medical Diagnosis'],
      description: "We're looking for a board-certified neurosurgeon to join our neurosurgery department.",
    },
  },
  // Default/General
  {
    pattern: /./,
    qualifications: {
      requiredDegree: "Bachelor's degree",
      requiredExperience: "3+ years",
      requiredCertifications: [],
      preferredSkills: ['Communication', 'Problem Solving', 'Team Collaboration'],
      requiredSkills: ['Professional Experience', 'Communication'],
      description: "We're looking for an experienced professional to join our team.",
    },
  },
];

export function generateJobQualifications(jobTitle: string): JobQualifications {
  const normalizedTitle = jobTitle.trim();
  
  if (!normalizedTitle) {
    return {
      title: 'Senior Accountant',
      ...jobPatterns[0].qualifications,
    };
  }

  // Find matching pattern
  for (const { pattern, qualifications } of jobPatterns) {
    if (pattern.test(normalizedTitle)) {
      return {
        title: normalizedTitle,
        ...qualifications,
      };
    }
  }

  // Fallback to default
  return {
    title: normalizedTitle,
    ...jobPatterns[jobPatterns.length - 1].qualifications,
  };
}
