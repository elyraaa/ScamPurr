export type RiskLabel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AnalysisType = 'listing' | 'url' | 'combined';

export interface Explanation {
  id: string;
  factor: string;
  weight: number;
  description: string;
  is_red_flag: boolean;
  category: string;
  order: number;
}

export interface RiskScore {
  id: string;
  analysis_id: string;
  listing_score: number | null;
  url_score: number | null;
  combined_score: number;
  risk_label: RiskLabel;
  explanations: Explanation[];
  created_at: string;
}

export interface FullAnalysisResponse {
  analysis_id: string;
  type: AnalysisType;
  input_text: string | null;
  input_url: string | null;
  created_at: string;
  risk_score: RiskScore;
}

export interface HistoryItem {
  analysis_id: string;
  type: AnalysisType;
  input_text: string | null;
  input_url: string | null;
  combined_score: number;
  risk_label: RiskLabel;
  created_at: string;
}

export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  demoLogin: () => Promise<void>;
}
