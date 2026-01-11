import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from './MetricCard';
import { 
  sampleResumeData, screeningQuestions, candidateProfile, interviewKit, 
  emailTemplate, talentPoolCandidates 
} from '../data/mockData';
import { parseResume, ParsedResume } from '../utils/resumeParser';
import { qualifyCandidate, QualificationResult } from '../utils/qualificationEngine';
import { generateJobQualifications, JobQualifications } from '../utils/jobQualificationGenerator';
import { 
  Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, Clock, Users, XCircle, 
  Loader2, Calendar, ClipboardCheck, Search, TrendingUp, DollarSign, Target, 
  ArrowLeft, ArrowDown, Mail, User, MapPin, Briefcase, Award, ChevronDown, ChevronRight
} from 'lucide-react';

type WorkflowStep = 
  | 'hero' 
  | 'apply' 
  | 'screening' 
  | 'scheduling' 
  | 'interview-prep' 
  | 'talent-pool' 
  | 'results';

type ScreeningStep = 'idle' | 'extracting' | 'generating' | 'calculating' | 'complete';

export default function WorkflowDemo() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<WorkflowStep>('hero');
  const [resumeLoaded, setResumeLoaded] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [qualificationResult, setQualificationResult] = useState<QualificationResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [screeningStep, setScreeningStep] = useState<ScreeningStep>('idle');
  const [currentProgress, setCurrentProgress] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [jobTitle, setJobTitle] = useState('Senior Accountant');
  const [jobQualifications, setJobQualifications] = useState<JobQualifications>(
    generateJobQualifications('Senior Accountant')
  );
  const [expandedAccordion, setExpandedAccordion] = useState<string>('resume-questions');
  
  const stepRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const workflowSteps = [
    { id: 'apply', label: 'Candidate Applies', number: 1 },
    { id: 'screening', label: 'AI Pre-Screening', number: 2 },
    { id: 'scheduling', label: 'Auto-Scheduling', number: 3 },
    { id: 'interview-prep', label: 'Interview Preparation', number: 4 },
    { id: 'talent-pool', label: 'Talent Pool Management', number: 5 },
    { id: 'results', label: 'Results & ROI', number: 6 },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsParsing(true);
      setUploadedFileName(file.name);
      
      try {
        const parsed = await parseResume(file);
        setParsedResume(parsed);
        const qualification = qualifyCandidate(parsed, jobQualifications);
        setQualificationResult(qualification);
        setResumeLoaded(true);
        setIsParsing(false);
        setTimeout(() => {
          scrollToStep('screening');
          startScreening();
        }, 500);
      } catch (error) {
        console.error('Error parsing resume:', error);
        const fallbackResume = {
          name: extractNameFromFileName(file.name),
          title: 'Professional',
          experience: 'Experienced professional',
          skills: ['Professional Skills', 'Industry Experience'],
          rawText: '',
        };
        setParsedResume(fallbackResume);
        const qualification = qualifyCandidate(fallbackResume, jobQualifications);
        setQualificationResult(qualification);
        setResumeLoaded(true);
        setIsParsing(false);
        setTimeout(() => {
          scrollToStep('screening');
          startScreening();
        }, 500);
      }
    }
  };

  const extractNameFromFileName = (fileName: string): string => {
    const namePart = fileName.replace(/\.(pdf|doc|docx)$/i, '').replace(/[_-]/g, ' ');
    return namePart || 'Candidate';
  };

  const extractYearsFromExperience = (experience: string): number => {
    const match = experience.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const extractMinExperience = (requiredExperience: string): number => {
    const match = requiredExperience.match(/(\d+)/);
    return match ? parseInt(match[1]) : 3;
  };

  // Helper function to determine if job is medical
  const isMedicalRole = (): boolean => {
    const titleLower = jobQualifications.title.toLowerCase();
    return titleLower.includes('surgeon') || titleLower.includes('doctor') || 
           titleLower.includes('physician') || titleLower.includes('medical') ||
           titleLower.includes('neurosurgeon');
  };

  // Generate dynamic interview questions based on candidate
  const generateInterviewQuestions = () => {
    if (!parsedResume) return [];
    const years = extractYearsFromExperience(parsedResume.experience);
    const location = parsedResume.location || 'your location';
    const topSkills = parsedResume.skills.slice(0, 3);
    const certs = jobQualifications.requiredCertifications;
    const isMedical = isMedicalRole();
    
    const questions = [];
    
    if (isMedical) {
      questions.push({
        question: `I see you have ${years} years of experience${years >= 7 ? ' including residency and fellowship' : ''}. Can you walk me through the most complex ${topSkills[0] || 'surgical'} case you handled${years >= 7 ? ' during your fellowship' : ' in your career'}?`,
        references: [`${years} years experience`]
      });
      
      if (topSkills.length > 0) {
        questions.push({
          question: `Your profile mentions expertise in ${topSkills[0]}. How have you implemented these approaches in your ${location} practice, and what outcomes have you seen?`,
          references: [`${topSkills[0]} + ${location} location`]
        });
      }
      
      if (certs.length > 0) {
        questions.push({
          question: `You're ${certs[0].toLowerCase()}. Tell me about a time when you had to make a split-second decision during a ${topSkills[1] || 'surgical procedure'} that wasn't covered in standard protocols.`,
          references: [certs[0]]
        });
      }
      
      if (topSkills.length >= 2) {
        questions.push({
          question: `I noticed you have experience with ${topSkills[0]} and ${topSkills[1]}. How do you approach cases where these specialties intersect?`,
          references: [`${topSkills[0]} + ${topSkills[1]} skills`]
        });
      }
      
      questions.push({
        question: `Your background shows leadership experience. Can you describe how you've mentored junior ${isMedical ? 'surgeons or residents' : 'team members'} in your current practice?`,
        references: ['Leadership badge']
      });
    } else {
      // Accounting/Finance questions
      questions.push({
        question: `I see you have ${years} years of experience in ${parsedResume.title || 'accounting'}. Can you walk me through your most complex ${topSkills[0] || 'month-end close'} process?`,
        references: [`${years} years experience`]
      });
      
      if (topSkills.length > 0) {
        questions.push({
          question: `Your profile mentions expertise with ${topSkills[0]}. How have you used this in your ${location} role, and what improvements have you made?`,
          references: [`${topSkills[0]} + ${location} location`]
        });
      }
      
      if (certs.length > 0) {
        questions.push({
          question: `You're ${certs[0]}. Tell me about a time when you had to make a critical accounting decision that required deep technical knowledge.`,
          references: [certs[0]]
        });
      }
      
      if (topSkills.length >= 2) {
        questions.push({
          question: `I noticed you have experience with ${topSkills[0]} and ${topSkills[1]}. How do these systems work together in your workflow?`,
          references: [`${topSkills[0]} + ${topSkills[1]} skills`]
        });
      }
      
      questions.push({
        question: `Your background shows leadership experience. Can you describe how you've managed accounting teams or mentored junior accountants?`,
        references: ['Leadership badge']
      });
    }
    
    return questions;
  };

  // Generate salary guidance based on role type
  const getSalaryGuidance = () => {
    const isMedical = isMedicalRole();
    const years = parsedResume ? extractYearsFromExperience(parsedResume.experience) : 7;
    const location = parsedResume?.location || 'Denver';
    
    if (isMedical) {
      const baseRange = years >= 10 ? '625K - 750K' : years >= 7 ? '500K - 650K' : '400K - 550K';
      const expectation = years >= 10 ? '675K - 700K' : years >= 7 ? '550K - 600K' : '450K - 500K';
      const recommendation = years >= 10 ? '$685K + productivity bonus' : years >= 7 ? '$575K + bonus' : '$475K + bonus';
      
      return {
        marketRange: `$${baseRange} base`,
        candidateExpectation: `$${expectation}`,
        recommendation: recommendation,
        note: `${location} cost of living is 15% below coastal markets - competitive advantage`
      };
    } else {
      const baseRange = years >= 7 ? '85K - 110K' : years >= 5 ? '75K - 95K' : '65K - 85K';
      const expectation = years >= 7 ? '95K - 105K' : years >= 5 ? '85K - 95K' : '75K - 85K';
      const recommendation = years >= 7 ? '$98K + bonus structure' : years >= 5 ? '$90K + bonus' : '$80K + bonus';
      
      return {
        marketRange: `$${baseRange}`,
        candidateExpectation: `$${expectation}`,
        recommendation: recommendation,
        note: `Based on ${location} market + ${years} years experience`
      };
    }
  };

  const handleSampleCandidate = () => {
    const sampleResume = {
      name: sampleResumeData.name,
      title: sampleResumeData.title,
      experience: sampleResumeData.experience,
      skills: sampleResumeData.skills,
      rawText: 'Sarah Martinez\nSenior Accountant\n7 years in public accounting\nCPA licensed\nMonth-End Close\nNetSuite\nTeam Leadership',
    };
    setParsedResume(sampleResume);
    const qualification = qualifyCandidate(sampleResume, jobQualifications);
    setQualificationResult(qualification);
    setResumeLoaded(true);
    setUploadedFileName(null);
    setTimeout(() => {
      scrollToStep('screening');
      startScreening();
    }, 500);
  };

  const startScreening = () => {
    setScreeningStep('extracting');
    setCurrentProgress(0);
  };

  useEffect(() => {
    if (screeningStep === 'idle' || screeningStep === 'complete') return;

    const interval = setInterval(() => {
      setCurrentProgress((prev) => {
        if (prev >= 100) {
          if (screeningStep === 'extracting') {
            setScreeningStep('generating');
            return 0;
          } else if (screeningStep === 'generating') {
            setScreeningStep('calculating');
            return 0;
          } else if (screeningStep === 'calculating') {
            setScreeningStep('complete');
            return 100;
          }
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [screeningStep]);

  // Typing animation for answers
  useEffect(() => {
    if (screeningStep === 'generating' && currentProgress > 30) {
      const questions = screeningQuestions.slice(0, 3);
      const currentQ = Math.floor((currentProgress - 30) / 25);
      if (currentQ < questions.length) {
        const q = questions[currentQ];
        const charsToShow = Math.floor(((currentProgress - 30 - currentQ * 25) / 25) * q.answer.length);
        setTypingText(q.answer.substring(0, charsToShow));
      }
    }
  }, [screeningStep, currentProgress]);

  const scrollToStep = (step: WorkflowStep) => {
    const element = stepRefs.current[step];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveStep(step);
    }
  };

  const handleTimeSlotSelect = (slot: string) => {
    setSelectedTimeSlot(slot);
    setTimeout(() => {
      setEmailSent(true);
      setTimeout(() => {
        scrollToStep('interview-prep');
      }, 1500);
    }, 500);
  };

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepId = entry.target.getAttribute('data-step') as WorkflowStep;
            if (stepId) setActiveStep(stepId);
          }
        });
      },
      { threshold: 0.3 }
    );

    Object.values(stepRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Fixed Progress Tracker */}
      <div className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 z-40">
        <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="space-y-4">
            {workflowSteps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => scrollToStep(step.id as WorkflowStep)}
                className={`flex items-center gap-3 w-full text-left transition-all ${
                  activeStep === step.id ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  activeStep === step.id 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.number}
                </div>
                <div className="flex-1">
                  <div className={`text-xs font-semibold ${activeStep === step.id ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.label}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Progress Tracker */}
      <div className="lg:hidden bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between overflow-x-auto">
            {workflowSteps.map((step) => (
              <button
                key={step.id}
                onClick={() => scrollToStep(step.id as WorkflowStep)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-2 ${
                  activeStep === step.id ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeStep === step.id 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.number}
                </div>
                <span className="text-xs whitespace-nowrap">{step.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 lg:top-0 z-30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Choose Different Pain Point</span>
            </button>
            <h1 className="text-xl lg:text-2xl font-bold gradient-text">Custom Recruiting Automation</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 lg:pl-48">
        {/* HERO SECTION */}
        <div 
          ref={(el) => (stepRefs.current['hero'] = el)}
          data-step="hero"
          className="text-center py-16 mb-12"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Custom Recruiting Automation - Built For Your Workflow
          </h2>
          <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
            This demo shows what's possible when we build AI automation tailored to your specific recruiting process. Every solution is custom-designed to work with your existing tools and solve your unique bottlenecks.
          </p>

          {/* Callout Box */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8 max-w-3xl mx-auto">
            <div className="text-left">
              <div className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                What you're about to see:
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>This is an example workflow we'd build custom for you</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Works with whatever ATS/tools you currently use</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Designed around YOUR specific pain points</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Built in 2-3 weeks, not months</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>No off-the-shelf software to adopt</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Job Title Input */}
          <div className="max-w-md mx-auto mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What position are you looking to fill?
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => {
                const newTitle = e.target.value;
                setJobTitle(newTitle);
                // Generate qualifications immediately when job title changes
                if (newTitle.trim()) {
                  setJobQualifications(generateJobQualifications(newTitle));
                }
              }}
              placeholder="e.g., Senior Accountant, Software Engineer, Product Manager"
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
            />
          </div>

          {/* Text above Step 1 */}
          <div className="text-gray-600 text-lg mb-4">
            👇 Watch how we'd automate your recruiting process from application to hire
          </div>
        </div>

        {/* STEP 1: CANDIDATE APPLIES */}
        <div 
          ref={(el) => (stepRefs.current['apply'] = el)}
          data-step="apply"
          className="mb-24 scroll-mt-24"
        >
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Step 1: Candidate Applies</h3>
                <p className="text-gray-600 mt-1">Day 1, 9:00 AM</p>
              </div>
            </div>

            {/* Job Posting Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h4 className="text-xl font-bold text-gray-900 mb-3">{jobQualifications.title}</h4>
              <p className="text-gray-700 mb-4">
                {jobQualifications.description}
              </p>
              
              {/* Qualifications Display */}
              <div className="space-y-3 mb-4">
                {jobQualifications.requiredDegree && (
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-800">✓</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Required Education:</div>
                      <div className="text-sm text-gray-700">{jobQualifications.requiredDegree}</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-800">✓</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Required Experience:</div>
                    <div className="text-sm text-gray-700">{jobQualifications.requiredExperience}</div>
                  </div>
                </div>

                {jobQualifications.requiredCertifications.length > 0 && (
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-800">✓</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Required Certifications:</div>
                      <div className="text-sm text-gray-700">{jobQualifications.requiredCertifications.join(', ')}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Skills Tags */}
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-900">Required Skills:</div>
                <div className="flex gap-2 flex-wrap">
                  {jobQualifications.requiredSkills.map((skill, idx) => (
                    <span key={idx} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="text-sm font-semibold text-gray-900 mt-2">Preferred Skills:</div>
                <div className="flex gap-2 flex-wrap">
                  {jobQualifications.preferredSkills.map((skill, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Upload Options */}
            {!resumeLoaded && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all">
                    <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <div className="font-semibold text-gray-900 mb-2">Upload Resume</div>
                    <div className="text-sm text-gray-600">PDF, DOC, DOCX, or TXT</div>
                  </div>
                </label>
                <button
                  onClick={handleSampleCandidate}
                  className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  <FileText className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <div className="font-semibold text-gray-900 mb-2">Use Sample Candidate</div>
                  <div className="text-sm text-gray-600">Load demo candidate</div>
                </button>
              </div>
            )}

            {/* Parsing Indicator */}
            {isParsing && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <div className="text-lg font-semibold text-gray-900">Processing resume...</div>
              </div>
            )}

            {/* Candidate Card */}
            {resumeLoaded && parsedResume && !isParsing && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {parsedResume.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{parsedResume.name}</h4>
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{parsedResume.title || 'Professional'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {extractYearsFromExperience(parsedResume.experience) > 0 
                          ? `${extractYearsFromExperience(parsedResume.experience)} years experience`
                          : parsedResume.experience || 'Experienced professional'}
                      </div>
                      {parsedResume.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {parsedResume.location}
                        </div>
                      )}
                      {parsedResume.phone && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs">📞</span>
                          {parsedResume.phone}
                        </div>
                      )}
                      {parsedResume.email && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Mail className="w-4 h-4" />
                          {parsedResume.email}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4 flex-wrap">
                      {parsedResume.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    {uploadedFileName && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        {uploadedFileName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Transition Arrow */}
            {resumeLoaded && (
              <div className="flex justify-center mt-8">
                <ArrowDown className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* STEP 2: AI PRE-SCREENING */}
        {resumeLoaded && (
          <div 
            ref={(el) => (stepRefs.current['screening'] = el)}
            data-step="screening"
            className="mb-24 scroll-mt-24"
          >
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Step 2: AI Pre-Screening</h3>
                <p className="text-gray-600 mt-1">Day 1, 9:02 AM (2 minutes later)</p>
              </div>

              {/* Screening Progress */}
              {screeningStep !== 'complete' && (
                <div className="space-y-6 mb-8">
                  {/* Extracting */}
                  <div className={`transition-opacity duration-300 ${screeningStep === 'extracting' ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Extracting candidate data...</span>
                      {screeningStep === 'extracting' && currentProgress >= 100 && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="gradient-bg h-3 rounded-full transition-all duration-300"
                        style={{ width: `${screeningStep === 'extracting' ? currentProgress : screeningStep !== 'idle' ? 100 : 0}%` }}
                      />
                    </div>
                    {screeningStep !== 'idle' && (
                      <div className="mt-2 flex gap-4 text-sm text-gray-600 flex-wrap">
                        {/* Show first 2-3 required skills/certifications */}
                        {jobQualifications.requiredCertifications.length > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            {jobQualifications.requiredCertifications[0]} ✓
                          </span>
                        )}
                        {jobQualifications.requiredSkills.length > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            {jobQualifications.requiredSkills[0]} ✓
                          </span>
                        )}
                        {jobQualifications.requiredSkills.length > 1 && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            {jobQualifications.requiredSkills[1]} ✓
                          </span>
                        )}
                        {parsedResume && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            {extractYearsFromExperience(parsedResume.experience) || candidateProfile.yearsExperience} years ✓
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Generating Questions */}
                  <div className={`transition-opacity duration-300 ${screeningStep === 'generating' ? 'opacity-100' : screeningStep === 'calculating' || screeningStep === 'complete' ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Generating screening questions...</span>
                      {(screeningStep === 'generating' && currentProgress >= 100) || screeningStep === 'calculating' || screeningStep === 'complete' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : null}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="gradient-bg h-3 rounded-full transition-all duration-300"
                        style={{ width: `${screeningStep === 'generating' ? currentProgress : screeningStep === 'calculating' || screeningStep === 'complete' ? 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Calculating */}
                  <div className={`transition-opacity duration-300 ${screeningStep === 'calculating' ? 'opacity-100' : screeningStep === 'complete' ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Calculating overall fit...</span>
                      {screeningStep === 'complete' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="gradient-bg h-3 rounded-full transition-all duration-300"
                        style={{ width: `${screeningStep === 'calculating' ? currentProgress : screeningStep === 'complete' ? 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Screening Questions */}
              {screeningStep === 'generating' && currentProgress > 30 && (
                <div className="space-y-6 mb-8">
                  {screeningQuestions.slice(0, 3).map((q, idx) => {
                    const showAnswer = currentProgress > 30 + idx * 25;
                    return (
                      <div key={idx} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-blue-600">{idx + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 mb-2">{q.question}</div>
                            {showAnswer && (
                              <>
                                <div className="text-gray-700 text-sm leading-relaxed mb-3">
                                  {idx === Math.floor((currentProgress - 30) / 25) && typingText ? typingText : q.answer}
                                </div>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                                  q.matchType === 'required' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  <CheckCircle2 className="w-4 h-4" />
                                  {q.score}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Qualification Result */}
              {screeningStep === 'complete' && qualificationResult && (
                <>
                  <div className={`rounded-lg p-8 shadow-lg mb-6 border-2 ${
                    qualificationResult.score >= 75
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                      : qualificationResult.score >= 60
                      ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300'
                      : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-300'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                        qualificationResult.score >= 75
                          ? 'bg-green-500'
                          : qualificationResult.score >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}>
                        {qualificationResult.score >= 75 ? (
                          <CheckCircle2 className="w-10 h-10 text-white" />
                        ) : qualificationResult.score >= 60 ? (
                          <AlertCircle className="w-10 h-10 text-white" />
                        ) : (
                          <XCircle className="w-10 h-10 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`text-3xl font-bold mb-2 ${
                          qualificationResult.score >= 75
                            ? 'text-green-800'
                            : qualificationResult.score >= 60
                            ? 'text-yellow-800'
                            : 'text-red-800'
                        }`}>
                          {qualificationResult.score >= 75 
                            ? `✓ QUALIFIED FOR ${jobQualifications.title.toUpperCase()}`
                            : qualificationResult.score >= 60
                            ? `⚠ REVIEW REQUIRED FOR ${jobQualifications.title.toUpperCase()}`
                            : `✗ NOT QUALIFIED FOR ${jobQualifications.title.toUpperCase()}`
                          }
                        </div>
                        <div className="text-4xl font-bold gradient-text mb-4">{qualificationResult.score}/100</div>
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-semibold text-gray-700 mb-2">Match Breakdown:</div>
                            <div className="space-y-2 text-gray-800">
                              {/* Required Certifications */}
                              {jobQualifications.requiredCertifications.length > 0 && (
                                <div className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium">Required Certifications:</span>{' '}
                                    {qualificationResult.strengths.some(s => jobQualifications.requiredCertifications.some(cert => s.includes(cert)))
                                      ? `✓ ${jobQualifications.requiredCertifications.join(', ')} - Met`
                                      : `Missing: ${jobQualifications.requiredCertifications.join(', ')}`}
                                  </div>
                                </div>
                              )}
                              
                              {/* Required Skills Match */}
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-medium">Required Skills:</span>{' '}
                                  {qualificationResult.strengths.filter(s => 
                                    jobQualifications.requiredSkills.some(skill => s.toLowerCase().includes(skill.toLowerCase()))
                                  ).length > 0 
                                    ? `✓ Strong match on ${jobQualifications.requiredSkills.slice(0, 2).join(', ')}`
                                    : `Partial match - reviewing additional skills`}
                                </div>
                              </div>
                              
                              {/* Experience Level */}
                              {parsedResume && (
                                <div className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium">Experience:</span>{' '}
                                    {extractYearsFromExperience(parsedResume.experience) || candidateProfile.yearsExperience} years
                                    {extractYearsFromExperience(parsedResume.experience) >= extractMinExperience(jobQualifications.requiredExperience)
                                      ? ` ✓ Meets requirement (${jobQualifications.requiredExperience})`
                                      : ` - Below requirement (${jobQualifications.requiredExperience})`}
                                  </div>
                                </div>
                              )}
                              
                              {/* Education if required */}
                              {jobQualifications.requiredDegree && (
                                <div className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium">Education:</span>{' '}
                                    {qualificationResult.strengths.some(s => s.toLowerCase().includes('degree') || s.toLowerCase().includes('education'))
                                      ? `✓ ${jobQualifications.requiredDegree.split('(')[0].trim()} - Verified`
                                      : `Reviewing: ${jobQualifications.requiredDegree.split('(')[0].trim()}`}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-700 mb-1">Auto-action:</div>
                            <div className="text-gray-800 font-medium">{qualificationResult.recommendation}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Score Breakdown */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Detailed Score Breakdown</h4>
                    <div className="space-y-4">
                      {qualificationResult.scoreBreakdown.map((breakdown, idx) => {
                        const percentage = breakdown.maxPoints > 0 
                          ? Math.max(0, Math.min(100, (breakdown.points / breakdown.maxPoints) * 100))
                          : 0;
                        const isPositive = breakdown.points >= 0;
                        
                        return (
                          <div key={idx} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">{breakdown.category}</span>
                                {isPositive ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-600" />
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`text-lg font-bold ${
                                  isPositive ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {breakdown.points > 0 ? '+' : ''}{breakdown.points}
                                </span>
                                <span className="text-sm text-gray-500">/ {breakdown.maxPoints}</span>
                              </div>
                            </div>
                            
                            {/* Progress Bar */}
                            {breakdown.maxPoints > 0 && (
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    isPositive ? 'bg-green-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.abs(percentage)}%` }}
                                />
                              </div>
                            )}
                            
                            {/* Details */}
                            <div className="text-sm text-gray-600 space-y-1">
                              {breakdown.details.map((detail, detailIdx) => (
                                <div key={detailIdx} className="flex items-start gap-2">
                                  <span className={isPositive ? 'text-green-600' : 'text-red-600'}>•</span>
                                  <span>{detail}</span>
                                </div>
                              ))}
                            </div>
                            
                            {/* Explanation */}
                            {breakdown.maxPoints > 0 && (
                              <div className="mt-2 text-xs text-gray-500">
                                {isPositive 
                                  ? `Earned ${Math.round(percentage)}% of available points for this category`
                                  : `Penalty applied: Missing required ${breakdown.category.toLowerCase()}`
                                }
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Score Summary */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total Score</span>
                        <div className="text-right">
                          <span className={`text-3xl font-bold ${
                            qualificationResult.score >= 75 ? 'text-green-600' : 
                            qualificationResult.score >= 60 ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            {qualificationResult.score}/100
                          </span>
                          <div className="text-sm text-gray-500 mt-1">
                            {qualificationResult.score >= 75 
                              ? '✓ Exceeds threshold - Auto-proceed to scheduling'
                              : qualificationResult.score >= 60
                              ? '✓ Meets minimum - Flagged for review'
                              : '✗ Below threshold - Requires manual review'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">100 candidates screened in 30 min</div>
                      <div className="text-gray-600">vs 8 hours manual</div>
                    </div>
                  </div>

                  {/* Only show next steps arrow if score is 75+ */}
                  {qualificationResult.score >= 75 && (
                    <div className="flex justify-center">
                      <ArrowDown className="w-8 h-8 text-blue-600 animate-pulse" />
                    </div>
                  )}
                  
                  {/* Show message if score is below 75 */}
                  {qualificationResult.score < 75 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900 mb-2">Candidate needs additional review</div>
                        <div className="text-gray-700">
                          Score of {qualificationResult.score}/100 is below the 75 threshold for automatic progression. 
                          This candidate will be flagged for manual review before moving to scheduling.
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: AUTO-SCHEDULING */}
        {screeningStep === 'complete' && qualificationResult && qualificationResult.score >= 75 && (
          <div 
            ref={(el) => (stepRefs.current['scheduling'] = el)}
            data-step="scheduling"
            className="mb-24 scroll-mt-24"
          >
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Step 3: Instant Interview Scheduling</h3>
                <p className="text-gray-600 mt-1">Day 1, 9:03 AM (1 minute later)</p>
              </div>

              {/* Email Preview */}
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 mb-6 font-mono text-sm">
                <div className="mb-4">
                  <div className="text-gray-500 mb-1">To: {candidateProfile.email}</div>
                  <div className="text-gray-500 mb-1">Subject: {emailTemplate.subject}</div>
                </div>
                <div className="bg-white rounded p-4 border border-gray-200">
                  <div className="mb-4">{emailTemplate.greeting}</div>
                  <div className="mb-4">{emailTemplate.body}</div>
                  <div className="space-y-2 mb-4">
                    {emailTemplate.timeSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTimeSlotSelect(slot)}
                        disabled={selectedTimeSlot !== null}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          selectedTimeSlot === slot
                            ? 'border-green-500 bg-green-50'
                            : selectedTimeSlot === null
                            ? 'border-blue-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                            : 'border-gray-200 bg-gray-50 opacity-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{slot}</span>
                          {selectedTimeSlot === slot && (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mb-4">
                    <button
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      disabled={!selectedTimeSlot}
                    >
                      Book Time
                    </button>
                  </div>
                  <div className="mb-4">
                    <div className="text-gray-600 text-sm italic mb-2">
                      If none of these times work for you, please feel free to email us about times that work better for your schedule.
                    </div>
                    <button
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                      onClick={() => window.location.href = `mailto:hiring@company.com?subject=Alternative Interview Times - ${jobQualifications.title}&body=Hi, I'd like to schedule an interview for the ${jobQualifications.title} position. Here are some times that work better for me:`}
                    >
                      <Mail className="w-4 h-4" />
                      Email Us About Alternative Times
                    </button>
                  </div>
                  <div className="text-gray-600 whitespace-pre-line">{emailTemplate.closing}</div>
                </div>
              </div>

              {/* Email Sent Animation */}
              {emailSent && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Email sent successfully!</div>
                      <div className="text-sm text-gray-600">Sarah selected: {selectedTimeSlot}</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Calendar invite auto-created
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Automated reminders scheduled:
                      <ul className="ml-4 list-disc">
                        <li>24 hours before: Email reminder</li>
                        <li>1 hour before: SMS reminder</li>
                        <li>Post-interview: Thank you + next steps</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">87% show-up rate</div>
                  <div className="text-gray-600">vs 52% industry average</div>
                </div>
              </div>

              {emailSent && (
                <div className="flex justify-center mt-8">
                  <ArrowDown className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: INTERVIEW PREP */}
        {emailSent && qualificationResult && qualificationResult.score >= 75 && parsedResume && (
          <div 
            ref={(el) => (stepRefs.current['interview-prep'] = el)}
            data-step="interview-prep"
            className="mb-24 scroll-mt-24"
          >
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Step 4: Custom Interview Kit Generated</h3>
                <p className="text-gray-600 mt-1">Day 1, 9:05 AM (2 minutes later)</p>
                <p className="text-gray-700 mt-2 italic">
                  Interview guide tailored specifically to {parsedResume.name}'s background
                </p>
              </div>

              {/* Progress Animation */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="font-medium text-gray-900">
                    Analyzing {parsedResume.name.split(' ')[0]}'s {extractYearsFromExperience(parsedResume.experience)} years of experience...
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="gradient-bg h-2 rounded-full w-full transition-all duration-1000" />
                </div>
                
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">
                    Cross-referencing {parsedResume.skills[0] || 'key'} expertise...
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="gradient-bg h-2 rounded-full w-full transition-all duration-1000" />
                </div>
                
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">
                    Generating custom questions based on {parsedResume.location || 'their'} practice...
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="gradient-bg h-2 rounded-full w-full transition-all duration-1000" />
                </div>
              </div>

              {/* Visual Indicator Box */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="font-semibold text-gray-900">Questions generated from resume analysis:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-7">
                  <li>{extractYearsFromExperience(parsedResume.experience)} years experience noted</li>
                  <li>{parsedResume.skills.length} specialized skills identified ({parsedResume.skills.slice(0, 3).join(', ')}{parsedResume.skills.length > 3 ? '...' : ''})</li>
                  {parsedResume.location && <li>{parsedResume.location} location considered</li>}
                  {jobQualifications.requiredCertifications.length > 0 && (
                    <li>Board certifications verified ({jobQualifications.requiredCertifications.join(', ')})</li>
                  )}
                  <li>Leadership experience identified</li>
                </ul>
              </div>

              {/* Interview Kit Content - Accordion Style */}
              <div className="space-y-4">
                {/* Accordion 1: Resume-Specific Questions */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedAccordion(expandedAccordion === 'resume-questions' ? '' : 'resume-questions')}
                    className="w-full flex items-center justify-between p-6 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5 text-blue-600" />
                      Resume-Specific Questions
                    </h4>
                    <ChevronRight className={`w-5 h-5 text-gray-600 transition-transform ${expandedAccordion === 'resume-questions' ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedAccordion === 'resume-questions' && (
                    <div className="p-6 space-y-4">
                      {generateInterviewQuestions().map((q, idx) => (
                        <div key={idx} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex items-start gap-3 mb-2">
                            <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold text-blue-600">
                              {idx + 1}
                            </span>
                            <span className="text-gray-700 flex-1">{q.question}</span>
                          </div>
                          <div className="ml-9 flex gap-2 flex-wrap">
                            {q.references.map((ref, refIdx) => (
                              <span key={refIdx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                Referenced: {ref}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Accordion 2: Evaluation Scorecard */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedAccordion(expandedAccordion === 'scorecard' ? '' : 'scorecard')}
                    className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      Evaluation Scorecard
                    </h4>
                    <ChevronRight className={`w-5 h-5 text-gray-600 transition-transform ${expandedAccordion === 'scorecard' ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedAccordion === 'scorecard' && (
                    <div className="p-6">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-semibold text-gray-900">Criteria</th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-900">Rating (1-5)</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-900">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr>
                              <td className="py-3 px-4 text-gray-700">
                                {isMedicalRole() ? 'Technical Expertise (Neurosurgery)' : 'Technical Expertise'}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex gap-1 justify-center">
                                  {[1, 2, 3, 4, 5].map(n => (
                                    <input key={n} type="radio" name="tech" className="w-4 h-4" />
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-600 text-sm">
                                Focus on {parsedResume.skills[0] || 'key skills'}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3 px-4 text-gray-700">
                                {isMedicalRole() ? 'Patient Communication' : 'Stakeholder Communication'}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex gap-1 justify-center">
                                  {[1, 2, 3, 4, 5].map(n => (
                                    <input key={n} type="radio" name="comm" className="w-4 h-4" />
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-600 text-sm">
                                {isMedicalRole() ? 'Critical for high-risk procedures' : 'Important for financial reporting'}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3 px-4 text-gray-700">Team Leadership</td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex gap-1 justify-center">
                                  {[1, 2, 3, 4, 5].map(n => (
                                    <input key={n} type="radio" name="lead" className="w-4 h-4" />
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-600 text-sm">Based on leadership badge</td>
                            </tr>
                            <tr>
                              <td className="py-3 px-4 text-gray-700">
                                {isMedicalRole() ? 'Problem-Solving Under Pressure' : 'Problem-Solving'}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex gap-1 justify-center">
                                  {[1, 2, 3, 4, 5].map(n => (
                                    <input key={n} type="radio" name="prob" className="w-4 h-4" />
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-600 text-sm">
                                {isMedicalRole() ? 'OR decision-making' : 'Complex accounting scenarios'}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3 px-4 text-gray-700">Cultural Fit</td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex gap-1 justify-center">
                                  {[1, 2, 3, 4, 5].map(n => (
                                    <input key={n} type="radio" name="cult" className="w-4 h-4" />
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-600 text-sm">
                                {parsedResume.location ? `${parsedResume.location} practice integration` : 'Team integration'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 3: Red Flags */}
                <div className="border border-red-200 rounded-lg overflow-hidden bg-red-50">
                  <button
                    onClick={() => setExpandedAccordion(expandedAccordion === 'red-flags' ? '' : 'red-flags')}
                    className="w-full flex items-center justify-between p-6 hover:bg-red-100 transition-colors"
                  >
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Resume-Based Red Flags
                    </h4>
                    <ChevronRight className={`w-5 h-5 text-gray-600 transition-transform ${expandedAccordion === 'red-flags' ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedAccordion === 'red-flags' && (
                    <div className="p-6 space-y-2">
                      {isMedicalRole() ? (
                        <>
                          <div className="flex items-start gap-2 text-gray-700">
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>Vague answers about specific {parsedResume.skills[0] || 'minimally invasive'} procedures {parsedResume.name.split(' ')[0]} claims expertise in</span>
                          </div>
                          <div className="flex items-start gap-2 text-gray-700">
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>Cannot provide concrete examples from {extractYearsFromExperience(parsedResume.experience)}-year career in {jobQualifications.title.toLowerCase()}</span>
                          </div>
                          <div className="flex items-start gap-2 text-gray-700">
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>Lack of recent continuing education (given long tenure and board certification requirements)</span>
                          </div>
                          <div className="flex items-start gap-2 text-gray-700">
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>Doesn't mention collaboration with other {parsedResume.location || 'area'}-based specialists or hospital affiliations</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-2 text-gray-700">
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>Vague answers about {parsedResume.skills[0] || 'accounting'} processes they claim expertise in</span>
                          </div>
                          <div className="flex items-start gap-2 text-gray-700">
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>Cannot provide concrete examples from {extractYearsFromExperience(parsedResume.experience)}-year career</span>
                          </div>
                          <div className="flex items-start gap-2 text-gray-700">
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>Lack of familiarity with current {jobQualifications.requiredSkills[0] || 'accounting'} standards</span>
                          </div>
                          <div className="flex items-start gap-2 text-gray-700">
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>Poor communication of complex {isMedicalRole() ? 'medical' : 'financial'} concepts</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Accordion 4: Compensation Guidance */}
                <div className="border border-green-200 rounded-lg overflow-hidden bg-green-50">
                  <button
                    onClick={() => setExpandedAccordion(expandedAccordion === 'salary' ? '' : 'salary')}
                    className="w-full flex items-center justify-between p-6 hover:bg-green-100 transition-colors"
                  >
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      Compensation Guidance
                    </h4>
                    <ChevronRight className={`w-5 h-5 text-gray-600 transition-transform ${expandedAccordion === 'salary' ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedAccordion === 'salary' && (
                    <div className="p-6 space-y-3">
                      {(() => {
                        const salary = getSalaryGuidance();
                        return (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Market Range for {jobQualifications.title} ({extractYearsFromExperience(parsedResume.experience)}+ years):</span>
                              <span className="font-semibold text-gray-900">{salary.marketRange}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">{parsedResume.name.split(' ')[0]}'s Likely Expectation:</span>
                              <span className="font-semibold text-gray-900">{salary.candidateExpectation}</span>
                            </div>
                            <div className="text-xs text-gray-600 italic">
                              (Based on: {parsedResume.location || 'market'} + {extractYearsFromExperience(parsedResume.experience)} years experience + multiple specializations)
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-green-300">
                              <span className="text-gray-900 font-semibold">Recommendation:</span>
                              <span className="font-bold text-green-700">{salary.recommendation}</span>
                            </div>
                            {salary.note && (
                              <div className="text-xs text-gray-600 italic pt-2">
                                Location Note: {salary.note}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Callout Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <div className="font-semibold text-gray-900 mb-2">Why this matters:</div>
                    <div className="text-gray-700 text-sm">
                      Generic interview questions get generic answers. By referencing {parsedResume.name.split(' ')[0]}'s actual experience with {parsedResume.skills[0] || 'their skills'}, {parsedResume.name.split(' ')[0]}'s {extractYearsFromExperience(parsedResume.experience)}-year track record, and {parsedResume.name.split(' ')[0]}'s {parsedResume.location || 'practice'}, you'll get specific, authentic responses that help you evaluate true fit.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    Interview questions customized to each candidate's unique background - no more one-size-fits-all interviews
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <ArrowDown className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: TALENT POOL */}
        {emailSent && qualificationResult && qualificationResult.score >= 75 && parsedResume && (
          <div 
            ref={(el) => (stepRefs.current['talent-pool'] = el)}
            data-step="talent-pool"
            className="mb-24 scroll-mt-24"
          >
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Step 5: Organized Talent Pipeline</h3>
                <p className="text-gray-600 mt-1">Ongoing</p>
                <p className="text-gray-700 mt-2 italic">
                  {parsedResume.name} automatically added to relevant talent pools based on {parsedResume.name.split(' ')[0]}'s specializations
                </p>
              </div>

              {/* Kanban Board */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Qualified Column */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">{jobQualifications.title.toUpperCase()} - QUALIFIED</h4>
                    <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      12 candidates
                    </span>
                  </div>
                  <div className="space-y-3">
                    {/* Current Candidate - Highlighted */}
                    <div className="bg-white rounded-lg p-4 border-2 border-green-500 shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-900">{parsedResume.name}</div>
                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          Active Interview
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        {extractYearsFromExperience(parsedResume.experience)} yrs exp • {parsedResume.location || 'Location'} • {parsedResume.skills.slice(0, 2).join(' + ')}
                      </div>
                      <div className="text-xs text-green-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Interview scheduled {selectedTimeSlot || 'Tuesday 2pm'}
                      </div>
                    </div>
                    
                    {/* Other Qualified Candidates */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="font-semibold text-gray-900 mb-1">Dr. Sarah Chen</div>
                      <div className="text-xs text-gray-600 mb-1">8 yrs exp • Boulder • {isMedicalRole() ? 'Brain Surgery + Neuro-oncology' : 'NetSuite + Financial Reporting'}</div>
                      <div className="text-xs text-gray-500">Second interview stage</div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="font-semibold text-gray-900 mb-1">Dr. Michael Torres</div>
                      <div className="text-xs text-gray-600 mb-1">15 yrs exp • Colorado Springs • {parsedResume.skills[2] || 'Specialized'}</div>
                      <div className="text-xs text-gray-500">Offer stage - {isMedicalRole() ? '$695K' : '$98K'}</div>
                    </div>
                    
                    <div className="text-sm text-gray-500 text-center">+9 more cards</div>
                  </div>
                  <div className="mt-4 text-xs text-gray-600 italic">
                    Pool criteria: "{jobQualifications.requiredCertifications.length > 0 ? jobQualifications.requiredCertifications.join(', ') : jobQualifications.title}, {extractMinExperience(jobQualifications.requiredExperience)}+ years, {parsedResume.location || 'region'}"
                  </div>
                </div>

                {/* Nurture Pipeline Column */}
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">NURTURE PIPELINE</h4>
                    <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                      23 candidates
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="font-semibold text-gray-900 mb-1">Dr. Lisa Park</div>
                      <div className="text-xs text-gray-600 mb-1">10 yrs exp • Seattle • {isMedicalRole() ? 'Pediatric neurosurgery' : 'Tax specialist'}</div>
                      <div className="text-xs text-yellow-600 mb-1">Strong fit, relocation timing issue</div>
                      <div className="text-xs text-gray-500">Auto-action: Quarterly check-ins automated</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="font-semibold text-gray-900 mb-1">Dr. James Wilson</div>
                      <div className="text-xs text-gray-600 mb-1">{extractMinExperience(jobQualifications.requiredExperience) - 1} yrs exp • {parsedResume.location || 'Denver'} • {isMedicalRole() ? 'Spine specialist' : 'Junior accountant'}</div>
                      <div className="text-xs text-yellow-600 mb-1">1 year short of requirements</div>
                      <div className="text-xs text-gray-500">Auto-action: Re-engage in Q3 2026</div>
                    </div>
                    <div className="text-sm text-gray-500 text-center">+21 more cards</div>
                    <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-yellow-300">
                      <div>• Auto-nurture emails sent quarterly with relevant opportunities</div>
                    </div>
                  </div>
                </div>

                {/* Future Specialties Column */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">FUTURE SPECIALTIES</h4>
                    <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      47 candidates
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="font-semibold text-gray-900 mb-1">Dr. Amanda Foster</div>
                      <div className="text-xs text-gray-600 mb-1">9 yrs exp • {parsedResume.location || 'Denver'} • {isMedicalRole() ? 'Pediatric neurosurgeon' : 'Audit specialist'}</div>
                      <div className="text-xs text-blue-600">Perfect for {isMedicalRole() ? 'pediatric opening' : 'audit role'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="font-semibold text-gray-900 mb-1">Dr. Robert Kim</div>
                      <div className="text-xs text-gray-600 mb-1">11 yrs exp • Boulder • {isMedicalRole() ? 'Spine + Pain management' : 'Tax + Consulting'}</div>
                      <div className="text-xs text-blue-600">Matches upcoming {isMedicalRole() ? 'spine clinic expansion' : 'consulting division'}</div>
                    </div>
                    <div className="text-sm text-gray-500 text-center">+45 more cards</div>
                    <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-blue-300">
                      <div>• Tagged for relevant openings - proactive outreach when roles open</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Candidate-Specific Tagging Box */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  {parsedResume.name} auto-tagged for:
                </h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {jobQualifications.title} - General (primary pool)
                  </span>
                  {parsedResume.skills.slice(0, 2).map((skill, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {skill} (specialty filter)
                    </span>
                  ))}
                  {parsedResume.location && (
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {parsedResume.location}/Colorado region (location filter)
                    </span>
                  )}
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Senior level ({extractYearsFromExperience(parsedResume.experience)}+ years filter)
                  </span>
                  <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Leadership potential (management track)
                  </span>
                </div>
                <div className="text-sm text-gray-700 italic">
                  When you open a "{isMedicalRole() ? 'Chief of Neurosurgery' : 'Senior Accounting Manager'}" role, {parsedResume.name.split(' ')[0]} will automatically surface in search results
                </div>
              </div>

              {/* Boolean Search Generator */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Search className="w-5 h-5 text-purple-600" />
                  Need more candidates like {parsedResume.name.split(' ')[0]}?
                </h4>
                <div className="text-sm text-gray-700 mb-3">Auto-generated search based on {parsedResume.name.split(' ')[0]}'s profile:</div>
                <div className="bg-white rounded p-4 mb-3 font-mono text-sm border border-purple-300">
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {`(${jobQualifications.title.toLowerCase()} OR "${jobQualifications.title.toLowerCase().split(' ')[0]}")`}
                    {parsedResume.skills.length > 0 && `\nAND ("${parsedResume.skills[0]}" OR "${parsedResume.skills[1] || parsedResume.skills[0]}")`}
                    {jobQualifications.requiredCertifications.length > 0 && `\nAND ("${jobQualifications.requiredCertifications[0]}" OR ${jobQualifications.requiredCertifications[0].split(' ')[0]})`}
                    {parsedResume.location && `\nAND (${parsedResume.location.split(',')[0]} OR Boulder OR "Colorado Springs" OR Colorado)`}
                    {`\nAND (${extractYearsFromExperience(parsedResume.experience)}..${extractYearsFromExperience(parsedResume.experience) + 5} years OR senior OR experienced)`}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">
                    Run Search on LinkedIn
                  </button>
                  <div className="text-gray-700 text-sm">
                    <strong>~47 passive candidates</strong> match {parsedResume.name.split(' ')[0]}'s profile
                  </div>
                </div>
              </div>

              {/* Smart Matching Callout */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <div className="font-semibold text-gray-900 mb-2">
                      {parsedResume.name.split(' ')[0]}'s profile identified 3 similar candidates already in your pipeline:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-5">
                      <li>Dr. Chen (similar {parsedResume.skills[0] || 'background'})</li>
                      <li>Dr. Torres (similar years + {parsedResume.skills[2] || 'specialization'} overlap)</li>
                      <li>Dr. Wilson ({parsedResume.location || 'Denver'}-based, {parsedResume.skills[1] || 'related'} focus)</li>
                    </ul>
                    <div className="text-sm text-gray-700 mt-2 italic">
                      Auto-suggestion: Consider batch-interviewing for efficiency
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    Pipeline of 82 qualified {isMedicalRole() ? 'medical professionals' : 'accounting professionals'} built BEFORE you post your next role - no more starting from zero
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <ArrowDown className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: RESULTS & ROI */}
        {emailSent && qualificationResult && qualificationResult.score >= 75 && parsedResume && (
          <div 
            ref={(el) => (stepRefs.current['results'] = el)}
            data-step="results"
            className="mb-24 scroll-mt-24"
          >
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900">The Complete Picture: Speed + Cost Control</h3>
                <p className="text-gray-600 mt-1">
                  Results after filling {parsedResume.name.split(' ')[0]}'s {jobQualifications.title.toLowerCase()} position
                </p>
              </div>

              {/* Candidate-Specific Results Callout */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <div className="font-semibold text-gray-900 mb-2">
                      {parsedResume.name}'s Hiring Journey:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      <li>Day 1: Applied & screened (2 minutes)</li>
                      <li>Day 1: Interview scheduled (1 minute)</li>
                      <li>Day 3: Interviewed with custom kit</li>
                      <li>Day 8: Offer extended at {(() => {
                        const salary = getSalaryGuidance();
                        return salary.recommendation.split(' ')[0];
                      })()}</li>
                      <li>Day 18: Offer accepted</li>
                    </ul>
                    <div className="text-sm font-semibold text-gray-900 mt-2">
                      Total time: 18 days vs {isMedicalRole() ? '45-60' : '45'} days typical for {isMedicalRole() ? 'senior medical' : 'senior'} roles
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                  label="Time-to-Fill"
                  beforeValue={isMedicalRole() ? "45-60 days" : "45 days"}
                  afterValue="18 days"
                  improvement={isMedicalRole() ? "67% faster" : "-60%"}
                />
                <MetricCard
                  label="Cost Per Hire"
                  beforeValue={isMedicalRole() ? "$145,400" : "$10,800"}
                  afterValue={isMedicalRole() ? "$1,775" : "$1,000"}
                  improvement={isMedicalRole() ? "86% reduction" : "-91%"}
                />
                <MetricCard
                  label="Team Capacity"
                  beforeValue="2 recruiters"
                  afterValue="Handles 3x more roles"
                  improvement="200% increase"
                />
                <MetricCard
                  label="Quality Score"
                  beforeValue={isMedicalRole() ? "68% retention" : "72% retention"}
                  afterValue="94% retention"
                  improvement={isMedicalRole() ? "+26pts" : "90-day retention"}
                />
              </div>

              {/* Cost Breakdown */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  Cost Analysis: Hiring {parsedResume.name} ({jobQualifications.title})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="border-2 border-red-200 rounded-lg p-6 bg-red-50/30">
                    <h5 className="text-lg font-semibold text-gray-900 mb-4">
                      {isMedicalRole() ? 'Traditional Medical Recruiting' : 'Manual Recruiting Process'}
                    </h5>
                    <div className="space-y-2">
                      {isMedicalRole() ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Executive search firm fee (20% of {(() => {
                              const salary = getSalaryGuidance();
                              return salary.recommendation.split(' ')[0];
                            })()} salary):</span>
                            <span className="font-semibold">${(() => {
                              const salary = getSalaryGuidance();
                              const salaryStr = salary.recommendation.split(' ')[0];
                              // Extract number and handle K suffix (e.g., $685K = 685000)
                              let salaryNum = 0;
                              if (salaryStr.includes('K')) {
                                const numPart = salaryStr.replace(/[^0-9]/g, '');
                                salaryNum = parseInt(numPart) * 1000;
                              } else {
                                salaryNum = parseInt(salaryStr.replace(/[^0-9]/g, ''));
                              }
                              return Math.round(salaryNum * 0.2).toLocaleString();
                            })()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">OR internal recruiter time (60 hours @ $65/hr):</span>
                            <span className="font-semibold">$3,900</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Premium job board listings (Doximity, NEJM):</span>
                            <span className="font-semibold">$2,500</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Credentialing verification delays:</span>
                            <span className="font-semibold">$1,200</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Scheduling coordinator time:</span>
                            <span className="font-semibold">$800</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Agency fees</span>
                            <span className="font-semibold">$8,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Internal recruiter time (40hrs):</span>
                            <span className="font-semibold">$2,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Job board premium:</span>
                            <span className="font-semibold">$500</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Scheduling coordination:</span>
                            <span className="font-semibold">$300</span>
                          </div>
                        </>
                      )}
                      <div className="border-t-2 border-red-300 pt-3 mt-4">
                        <div className="flex justify-between">
                          <span className="font-bold text-lg">Total</span>
                          <span className="text-2xl font-bold text-red-600">
                            ${isMedicalRole() ? '145,400' : '10,800'}/hire
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50/30">
                    <h5 className="text-lg font-semibold text-gray-900 mb-4">
                      {isMedicalRole() ? 'Automated Medical Recruiting' : 'With Automation'}
                    </h5>
                    <div className="space-y-2">
                      {isMedicalRole() ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Platform cost (monthly):</span>
                            <span className="font-semibold">$800</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Reduced recruiter time (15 hours @ $65/hr):</span>
                            <span className="font-semibold">$975</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">AI credential verification:</span>
                            <span className="font-semibold text-green-600">Included</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">AI screening:</span>
                            <span className="font-semibold text-green-600">Included</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Auto-scheduling:</span>
                            <span className="font-semibold text-green-600">Included</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Custom interview kit:</span>
                            <span className="font-semibold text-green-600">Included</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Platform fee:</span>
                            <span className="font-semibold">$400</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Reduced recruiter time (12hrs):</span>
                            <span className="font-semibold">$600</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">AI screening:</span>
                            <span className="font-semibold text-green-600">Included</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Auto-scheduling:</span>
                            <span className="font-semibold text-green-600">Included</span>
                          </div>
                        </>
                      )}
                      <div className="border-t-2 border-green-300 pt-3 mt-4">
                        <div className="flex justify-between">
                          <span className="font-bold text-lg">Total</span>
                          <span className="text-2xl font-bold text-green-600">
                            ${isMedicalRole() ? '1,775' : '1,000'}/hire
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Savings Callout */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-8 mt-8 text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    ${isMedicalRole() ? '143,625' : '9,800'} saved on {parsedResume.name.split(' ')[0]}'s hire alone
                  </div>
                  <div className="text-lg text-gray-700">
                    That's {isMedicalRole() ? '20.9%' : '90.7%'} of {isMedicalRole() ? 'their annual salary' : 'the hiring cost'} saved in recruiting costs
                  </div>
                </div>
              </div>

              {/* Candidate-Specific Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="text-sm text-gray-700 italic">
                  {parsedResume.name.split(' ')[0]}'s experience: Received interview invitation 2 minutes after applying, selected interview time immediately, received custom interview questions addressing {parsedResume.name.split(' ')[0]}'s specific background, offer extended same week as interview
                </div>
              </div>

              {/* Timeline Comparison */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-6">Timeline Comparison</h4>
                <div className="space-y-8">
                  {/* Manual Timeline */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-red-600" />
                      <h5 className="font-semibold text-gray-900">
                        {isMedicalRole() ? 'Manual Medical Recruiting (45-60 days)' : 'Manual Process (45 days)'}
                      </h5>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      {['Post', 'Screen 100', 'Schedule 15', '8 no-shows', 'Reschedule', 'Interviews', 'Offer', 'Accept'].map((step, idx) => (
                        <div key={idx} className="flex items-center">
                          <div className="bg-red-100 border-2 border-red-300 rounded-lg px-4 py-2 min-w-[100px] text-center">
                            <div className="text-sm font-semibold text-gray-900">{step}</div>
                          </div>
                          {idx < 7 && <ArrowRight className="w-4 h-4 text-red-400 mx-1" />}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Automated Timeline */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-green-600" />
                      <h5 className="font-semibold text-gray-900">Automated Process (18 days)</h5>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      {['Post', 'AI screens 100 in 2hrs', '12 auto-scheduled', '11 show up', 'Structured interviews', 'Offer', 'Accept'].map((step, idx) => (
                        <div key={idx} className="flex items-center">
                          <div className="bg-green-100 border-2 border-green-300 rounded-lg px-4 py-2 min-w-[100px] text-center">
                            <div className="text-sm font-semibold text-gray-900">{step}</div>
                          </div>
                          {idx < 6 && <ArrowRight className="w-4 h-4 text-green-400 mx-1" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ROI Calculator */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 border border-blue-200 mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  ROI Calculator
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Critical roles/year
                    </label>
                    <input
                      type="number"
                      defaultValue={10}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Avg agency fee
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        defaultValue={8000}
                        className="w-full pl-8 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-sm text-gray-600 mb-2">Annual Savings</div>
                    <div className="text-3xl font-bold text-green-600">$98,000</div>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-sm text-gray-600 mb-2">Time Saved</div>
                    <div className="text-3xl font-bold gradient-text">270 days</div>
                    <div className="text-xs text-gray-500 mt-1">of work</div>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-sm text-gray-600 mb-2">Additional Capacity</div>
                    <div className="text-3xl font-bold gradient-text">15 more roles</div>
                    <div className="text-xs text-gray-500 mt-1">per year</div>
                  </div>
                </div>
              </div>

              {/* Final CTA */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-12 text-center text-white">
                <h4 className="text-3xl font-bold mb-4">Let's Build This For Your Team</h4>
                <p className="text-xl mb-8 opacity-90">
                  Transform your hiring process with complete recruiting automation
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                  <button className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    Book a 15-min call to discuss your specific workflow
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="bg-transparent border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
                  >
                    Explore More Features
                  </button>
                </div>
                <p className="text-sm opacity-75 italic">
                  Custom automation built for your tools, your process, your team. Typical build time: 2-3 weeks.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
