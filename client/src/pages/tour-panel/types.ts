export interface GuideApplication {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  nationality: string;
  governorate: string;
  languages: string[];
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface SupportTicket {
  id: string;
  guideName: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'answered';
  reply?: string;
  createdAt: string;
}

export interface OfficeConfig {
  name: string;
  address: string;
  phone: string;
  workingHours: string;
  mapEmbedUrl: string;
}

export interface TripBooking {
  id: string;
  touristName: string;
  destination: string;
  date: string;
  duration: string;
  status: 'assigned' | 'accepted' | 'declined' | 'completed';
  price: string;
  notes?: string;
}
