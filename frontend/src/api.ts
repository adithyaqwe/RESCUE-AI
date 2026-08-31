import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Responder {
  _id: string;
  unitId: string;
  type: 'Ambulance' | 'Police' | 'Fire' | 'Medical';
  status: 'AVAILABLE' | 'EN_ROUTE' | 'ON_SCENE' | 'UNAVAILABLE';
  currentLocation: Coordinates;
  contactInfo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DispatchRecommendation {
  responder: Responder;
  distance: number;
  eta: number;
  reason: string;
}

export interface Incident {
  _id: string;
  incidentId: string;
  type: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  priorityScore: number;
  location: {
    address: string;
    coordinates?: Coordinates;
  };
  victimsCount: number;
  description: string;
  requiredServices: string[];
  status: 'REPORTED' | 'ANALYZED' | 'DISPATCHED' | 'EN_ROUTE' | 'ARRIVED' | 'RESOLVED';
  aiAnalysis?: {
    type: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    victimsCount: number;
    immediateAction: string;
    recommendedResponseTime: string;
    requiredServices: string[];
    recommendations: DispatchRecommendation[];
  };
  assignedResponders: Responder[];
  estimatedArrival?: number;
  responseTimeMs?: number;
  aiConfidence?: number;
  createdAt: string;
  updatedAt: string;
}

export const fetchIncidents = async (): Promise<Incident[]> => {
  const response = await api.get<Incident[]>('/incidents');
  return response.data;
};

export const fetchIncidentById = async (id: string): Promise<Incident> => {
  const response = await api.get<Incident>(`/incidents/${id}`);
  return response.data;
};

export const createIncident = async (data: {
  description: string;
  locationAddress: string;
  victimsCount?: number;
  coordinates?: Coordinates;
}): Promise<Incident> => {
  const response = await api.post<Incident>('/incidents', data);
  return response.data;
};

export const assignResponders = async (
  incidentId: string,
  responderIds: string[]
): Promise<Incident> => {
  const response = await api.post<Incident>(`/incidents/${incidentId}/assign`, {
    responderIds,
  });
  return response.data;
};

export const updateIncidentStatus = async (
  incidentId: string,
  status: 'DISPATCHED' | 'EN_ROUTE' | 'ARRIVED' | 'RESOLVED'
): Promise<Incident> => {
  const response = await api.put<Incident>(`/incidents/${incidentId}/status`, {
    status,
  });
  return response.data;
};

export const fetchResponders = async (): Promise<Responder[]> => {
  const response = await api.get<Responder[]>('/responders');
  return response.data;
};

export const sendChatQuery = async (
  query: string,
  history?: { sender: 'user' | 'bot'; text: string }[]
): Promise<{ response: string }> => {
  const response = await api.post<{ response: string }>('/chat', { query, history });
  return response.data;
};
