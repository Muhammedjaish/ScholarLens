import apiClient from './client';

export const collectionsAPI = {
  listCollections: async () => {
    return apiClient.get('/collections/');
  },

  createCollection: async (collectionData) => {
    return apiClient.post('/collections/', collectionData);
  },

  getCollectionDetail: async (id) => {
    return apiClient.get(`/collections/${id}/`);
  },

  updateCollection: async (id, data) => {
    return apiClient.patch(`/collections/${id}/`, data);
  },

  deleteCollection: async (id) => {
    return apiClient.delete(`/collections/${id}/`);
  },

  addItem: async (collectionId, itemData) => {
    return apiClient.post(`/collections/${collectionId}/items/`, itemData);
  },

  removeItem: async (collectionId, paperId) => {
    return apiClient.delete(`/collections/${collectionId}/items/`, { data: { paper_id: paperId } });
  },
};

