
export interface Student {
  id: string;
  name: string;
  score: string;
  type: 'JEE Mains' | 'JEE Advanced' | 'NEET';
  percentile?: number;
  rank?: number;
}

export interface College {
  id: string;
  name: string;
  location: string;
  fees: string;
  phone: string;
  hostel: boolean;
  students: Student[];
  rating: number;
}

export interface VerificationResult {
  id: string;
  status: 'success' | 'malpractice' | 'error';
  message?: string;
  name?: string;
  percentile?: number;
  rank?: number;
  exam?: 'JEE Mains' | 'JEE Advanced' | 'NEET';
}

export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

export enum AppView {
  LANDING = 'landing',
  STUDENT = 'student',
  ADMIN = 'admin'
}
