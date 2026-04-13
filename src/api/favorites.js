import api from './axios';

export const getFavorites = () =>
  api.get('/api/favorites').then(r => r.data);

export const saveFavorite = (item) =>
  api.post('/api/favorites', {
    name: item.name,
    source: item.source ?? 'USDA',
    fdcId: item.fdcId,
    calories: item.calories,
    protein: item.protein,
  }).then(r => r.data);

export const deleteFavorite = (id) =>
  api.delete(`/api/favorites/${id}`).then(r => r.data);

export const quickAdd = (favoriteId, mealId) =>
  api.post(`/api/favorites/${favoriteId}/quick-add/${mealId}`).then(r => r.data);
