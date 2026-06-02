export const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
  COLLEGE: 'college',
  UNIVERSITY: 'university'
};

export const REPORT_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  ESCALATED: 'escalated'
};

export const INCIDENT_TYPES = [
  'Verbal Abuse',
  'Physical Harassment',
  'Mental Harassment',
  'Cyber Bullying',
  'Financial Exploitation',
  'Academic Interference',
  'Social Boycott',
  'Other'
];

export const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low - Minor incident', color: 'green' },
  { value: 'medium', label: 'Medium - Moderate severity', color: 'yellow' },
  { value: 'high', label: 'High - Serious incident', color: 'orange' },
  { value: 'critical', label: 'Critical - Emergency situation', color: 'red' }
];

export const SAMPLE_COLLEGES = [
  { id: 1, name: 'Demo College of Engineering', students: 1200, reports: 23 },
  { id: 2, name: 'City Medical College', students: 800, reports: 15 },
  { id: 3, name: 'State Arts College', students: 1500, reports: 8 },
  { id: 4, name: 'Tech Institute of Science', students: 2000, reports: 31 }
];

export const EMERGENCY_CONTACTS = [
  { name: 'Campus Security', number: '+91-9876543210', available: '24/7' },
  { name: 'Anti-Ragging Helpline', number: '1800-123-4567', available: '24/7' },
  { name: 'College Counselor', number: '+91-9876543211', available: 'Mon-Fri, 9AM-5PM' },
  { name: 'Women\'s Cell', number: '+91-9876543212', available: '24/7' },
  { name: 'Local Police', number: '100', available: '24/7' }
];