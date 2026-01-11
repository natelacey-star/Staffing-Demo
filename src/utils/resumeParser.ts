import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set worker source for pdfjs - using CDN for compatibility
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface ParsedResume {
  name: string;
  title: string;
  experience: string;
  skills: string[];
  email?: string;
  phone?: string;
  location?: string;
  rawText: string;
}

// Extract name from text (simple heuristic)
function extractName(text: string): string {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // Check if first line looks like a name (2-4 words, capitalized)
    if (firstLine.split(/\s+/).length <= 4 && /^[A-Z]/.test(firstLine)) {
      return firstLine;
    }
  }
  return 'Candidate';
}

// Extract title/role
function extractTitle(text: string): string {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const keywords = ['engineer', 'developer', 'manager', 'analyst', 'specialist', 'director', 'accountant', 'designer'];
  
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].toLowerCase();
    for (const keyword of keywords) {
      if (line.includes(keyword)) {
        return lines[i].trim();
      }
    }
  }
  return 'Professional';
}

// Extract experience
function extractExperience(text: string): string {
  const experiencePatterns = [
    /(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/i,
    /experience[:\s]+(\d+)\s*(?:years?|yrs?)/i,
    /(\d+)\+?\s*(?:years?|yrs?)/i,
  ];
  
  for (const pattern of experiencePatterns) {
    const match = text.match(pattern);
    if (match) {
      const years = match[1];
      return `${years} years of experience`;
    }
  }
  return 'Experienced professional';
}

// Extract skills
function extractSkills(text: string): string[] {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'Agile', 'Scrum',
    'CPA', 'Excel', 'QuickBooks', 'NetSuite', 'SAP',
    'Figma', 'Adobe', 'Photoshop', 'Illustrator',
    'Project Management', 'Leadership', 'Communication',
    'Month-End Close', 'Financial Reporting', 'Budgeting',
  ];
  
  const textLower = text.toLowerCase();
  const foundSkills: string[] = [];
  
  for (const skill of commonSkills) {
    if (textLower.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
      if (foundSkills.length >= 6) break;
    }
  }
  
  // If no skills found, return some defaults
  if (foundSkills.length === 0) {
    return ['Professional Skills', 'Industry Experience'];
  }
  
  return foundSkills;
}

// Extract email
function extractEmail(text: string): string | undefined {
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const match = text.match(emailPattern);
  return match ? match[0] : undefined;
}

// Extract phone
function extractPhone(text: string): string | undefined {
  const phonePatterns = [
    /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
    /\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/,
  ];
  
  for (const pattern of phonePatterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return undefined;
}

// Extract location
function extractLocation(text: string): string | undefined {
  // Common patterns: "City, State" or "City, ST" or "City State"
  const locationPatterns = [
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2}|[A-Z][a-z]+)/, // "Denver, CO" or "New York, NY"
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+([A-Z]{2})\b/, // "Denver CO"
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/, // "San Francisco, California"
  ];
  
  // Also check for common city names near the top of the resume
  const lines = text.split('\n').slice(0, 10); // Check first 10 lines
  for (const line of lines) {
    for (const pattern of locationPatterns) {
      const match = line.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }
  }
  
  return undefined;
}

export async function parsePDF(file: File): Promise<ParsedResume> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }
  
  return {
    name: extractName(fullText),
    title: extractTitle(fullText),
    experience: extractExperience(fullText),
    skills: extractSkills(fullText),
    email: extractEmail(fullText),
    phone: extractPhone(fullText),
    location: extractLocation(fullText),
    rawText: fullText,
  };
}

export async function parseWordDoc(file: File): Promise<ParsedResume> {
  const arrayBuffer = await file.arrayBuffer();
  
  try {
    // Convert .docx to text using mammoth
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;
    
    return {
      name: extractName(text),
      title: extractTitle(text),
      experience: extractExperience(text),
      skills: extractSkills(text),
      email: extractEmail(text),
      phone: extractPhone(text),
      rawText: text,
    };
  } catch (error) {
    // If mammoth fails, try as plain text (for .doc files or corrupted .docx)
    console.warn('Failed to parse Word document with mammoth, trying as text:', error);
    const text = await file.text();
    
    return {
      name: extractName(text),
      title: extractTitle(text),
      experience: extractExperience(text),
      skills: extractSkills(text),
      email: extractEmail(text),
      phone: extractPhone(text),
      rawText: text,
    };
  }
}

export async function parseTextFile(file: File): Promise<ParsedResume> {
  const text = await file.text();
  
  return {
    name: extractName(text),
    title: extractTitle(text),
    experience: extractExperience(text),
    skills: extractSkills(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    location: extractLocation(text),
    rawText: text,
  };
}

export async function parseResume(file: File): Promise<ParsedResume> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return parsePDF(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    // .docx files (modern Word format)
    return parseWordDoc(file);
  } else if (
    fileType.includes('text') ||
    fileName.endsWith('.txt')
  ) {
    return parseTextFile(file);
  } else if (fileName.endsWith('.doc')) {
    // Older .doc format - try Word parser first, fallback to text
    try {
      return await parseWordDoc(file);
    } catch {
      return parseTextFile(file);
    }
  } else {
    // Fallback: try to read as text
    return parseTextFile(file);
  }
}
