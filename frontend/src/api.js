import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchIncidents = async () => {
  const response = await api.get('/incidents');
  return response.data;
};

export const fetchIncidentById = async (id) => {
  const response = await api.get(`/incidents/${id}`);
  return response.data;
};

export const createIncident = async (data) => {
  const response = await api.post('/incidents', data);
  return response.data;
};

export const assignResponders = async (incidentId, responderIds) => {
  const response = await api.post(`/incidents/${incidentId}/assign`, {
    responderIds,
  });
  return response.data;
};

export const updateIncidentStatus = async (incidentId, status) => {
  const response = await api.put(`/incidents/${incidentId}/status`, {
    status,
  });
  return response.data;
};

export const fetchResponders = async () => {
  const response = await api.get('/responders');
  return response.data;
};

export const sendChatQuery = async (query, history) => {
  const response = await api.post('/chat', { query, history });
  return response.data;
};
