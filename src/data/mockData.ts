export interface Candidate {
  id: string;
  name: string;
  role: string;
  experience: string;
  skills: string[];
  status: 'qualified' | 'unqualified' | 'pending';
  score?: number;
}

export interface Metric {
  label: string;
  before: number | string;
  after: number | string;
  improvement?: string;
  unit?: string;
}

export const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Senior Software Engineer',
    experience: '8 years',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    status: 'qualified',
    score: 92,
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    role: 'Product Manager',
    experience: '6 years',
    skills: ['Product Strategy', 'Agile', 'Data Analysis'],
    status: 'qualified',
    score: 88,
  },
  {
    id: '3',
    name: 'Emily Johnson',
    role: 'UX Designer',
    experience: '5 years',
    skills: ['Figma', 'User Research', 'Prototyping'],
    status: 'qualified',
    score: 85,
  },
  {
    id: '4',
    name: 'John Smith',
    role: 'Marketing Manager',
    experience: '3 years',
    skills: ['SEO', 'Content Marketing'],
    status: 'unqualified',
    score: 45,
  },
  {
    id: '5',
    name: 'David Kim',
    role: 'Data Scientist',
    experience: '7 years',
    skills: ['Python', 'Machine Learning', 'SQL'],
    status: 'qualified',
    score: 90,
  },
];

export const mockMetrics: Metric[] = [
  {
    label: 'Time to Screen',
    before: '4 hours',
    after: '15 minutes',
    improvement: '94% faster',
  },
  {
    label: 'Qualified Candidates',
    before: '12%',
    after: '68%',
    improvement: '467% increase',
  },
  {
    label: 'Cost per Hire',
    before: '$4,200',
    after: '$1,800',
    improvement: '57% reduction',
  },
];

export const mockResumeData = {
  name: 'Sarah Chen',
  email: 'sarah.chen@email.com',
  phone: '+1 (555) 123-4567',
  experience: [
    {
      company: 'Tech Corp',
      role: 'Senior Software Engineer',
      duration: '2020 - Present',
      description: 'Led development of customer-facing React applications',
    },
  ],
  education: 'BS Computer Science, MIT',
  skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker'],
};

export const sampleResumeData = {
  name: 'Sarah Martinez',
  title: 'Senior Accountant',
  experience: '7 years in public accounting',
  skills: ['CPA', 'Month-End Close', 'NetSuite', 'Team Leadership'],
  currentCompany: 'ABC Firm',
  location: 'Denver, CO',
  yearsExperience: 7,
};

export const candidateProfile = {
  name: 'Sarah Martinez',
  currentTitle: 'Senior Accountant at ABC Firm',
  yearsExperience: 7,
  location: 'Denver, CO',
  email: 'sarah.martinez@email.com',
  phone: '+1 (720) 555-0123',
};

export const interviewKit = {
  roleSpecificQuestions: [
    "Walk me through your most complex month-end close. What challenges did you face?",
    "How do you ensure SOX compliance in your reconciliation processes?",
    "Describe a time you improved an accounting workflow using technology.",
  ],
  evaluationCriteria: [
    { name: 'Technical Competency', scale: '1-5' },
    { name: 'Process Improvement Mindset', scale: '1-5' },
    { name: 'Team Leadership', scale: '1-5' },
    { name: 'Culture Fit', scale: '1-5' },
  ],
  redFlags: [
    'Lack of specific examples',
    'Unfamiliarity with current GAAP standards',
    'Poor communication of complex concepts',
  ],
  salaryGuidance: {
    marketRange: '$85K - $110K',
    candidateExpectation: '$95K - $105K',
    recommendation: '$98K + bonus structure',
  },
};

export const emailTemplate = {
  subject: 'Interview Request - Senior Accountant Role',
  greeting: 'Hi Sarah,',
  body: `Great news! Your background is an excellent match for our Senior Accountant role.

I'd love to schedule a conversation. Please select a time that works for you:`,
  timeSlots: [
    'Tuesday, Jan 14 - 2:00 PM MT',
    'Wednesday, Jan 15 - 10:00 AM MT',
    'Thursday, Jan 16 - 3:00 PM MT',
  ],
  closing: 'Looking forward to speaking with you!\n- Hiring Team',
};

export const talentPoolCandidates = {
  qualified: [
    { name: 'Sarah Martinez', status: 'Interviewing', interviewTime: 'Tuesday 2pm' },
    { name: 'Marcus Chen', status: 'Interview scheduled' },
    { name: 'Jennifer Park', status: 'Interview scheduled' },
    { name: 'David Kim', status: 'Interview scheduled' },
  ],
  maybe: [
    { name: 'Alex Thompson', status: 'Partial match' },
    { name: 'Maria Garcia', status: 'Partial match' },
    { name: 'James Wilson', status: 'Partial match' },
  ],
  futureRoles: [
    { name: 'Emily Johnson', skills: 'Python, Django', location: 'Denver' },
    { name: 'Robert Chen', skills: 'React, TypeScript', location: 'Remote' },
    { name: 'Lisa Anderson', skills: 'Data Science, ML', location: 'Denver' },
  ],
};

export interface ScreeningQuestion {
  question: string;
  answer: string;
  score: string;
  matchType: 'strong' | 'required';
}

export const screeningQuestions: ScreeningQuestion[] = [
  {
    question: "Describe your experience with month-end close processes",
    answer: "I've led month-end close for 50+ person accounting teams, consistently closing within 5 business days. I've streamlined processes that reduced closing time by 30% while maintaining accuracy.",
    score: "✓ Strong match",
    matchType: 'strong',
  },
  {
    question: "What accounting software have you used at scale?",
    answer: "NetSuite (5 years), QuickBooks Enterprise, Sage Intacct. I'm also proficient in Excel advanced functions and Power BI for financial reporting.",
    score: "✓ Strong match",
    matchType: 'strong',
  },
  {
    question: "Are you licensed as a CPA?",
    answer: "Yes, licensed in California since 2018. I maintain my CPE credits annually and stay current with accounting standards.",
    score: "✓ Required credential met",
    matchType: 'required',
  },
  {
    question: "Have you managed accounting teams?",
    answer: "Yes, I've managed teams of 3-5 accountants for the past 4 years. I handle performance reviews, training, and workflow optimization.",
    score: "✓ Strong match",
    matchType: 'strong',
  },
  {
    question: "What's your experience with financial reporting and analysis?",
    answer: "I prepare monthly, quarterly, and annual financial statements. I also create variance analyses, budget vs actual reports, and provide insights to executive leadership.",
    score: "✓ Strong match",
    matchType: 'strong',
  },
];
