export interface User {
  id: string;
  email: string;
  is_active: boolean;
}

export interface ReportMeasurement {
  id: string;
  report_id: string;
  user_id: string;
  biomarker_name: string;
  category: string | null;
  value: number;
  unit: string | null;
  reference_low: number | null;
  reference_high: number | null;
  abnormal_flag: boolean | null;
  status: string | null;
  severity: string | null;
  delta_percent: number | null;
  created_at: string;
}

export interface ReportMetadata {
  id: string;
  status: string;
  file_size: number | null;
  page_count: number | null;
  created_at: string;
}

export interface ReportDetail extends ReportMetadata {
  measurements: ReportMeasurement[];
  patient_summary: { overall_assessment: string, key_findings: { biomarker: string, finding_summary: string, value: number, unit: string }[], follow_up_considerations: string[], disclaimer: string } | null;
}
