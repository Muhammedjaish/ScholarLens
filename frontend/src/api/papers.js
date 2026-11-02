import apiClient from './client';

export const papersAPI = {
  searchPapers: async (query = '', source = 'all') => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (source) params.append('source', source);
    return apiClient.get(`/papers/search/?${params.toString()}`);
  },

  getPaperDetail: async (arxivId) => {
    return apiClient.get(`/papers/${arxivId}/`);
  },

  generateSummary: async (arxivId) => {
    return apiClient.post(`/papers/${arxivId}/summarize/`);
  },

  votePaper: async (arxivId, value) => {
    return apiClient.post(`/papers/${arxivId}/vote/`, { value });
  },

  getBibtex: async (arxivId) => {
    return apiClient.get(`/papers/${arxivId}/bibtex/`);
  },

  getReadingHistory: async () => {
    return apiClient.get('/history/');
  },
};

