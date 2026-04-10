import api from './axios';

export const getFavoriteMeals = () =>
  api.get('/api/favorite-meals').then(r => r.data);

export const saveMealAsFavorite = (mealId, name) =>
  api.post(`/api/favorite-meals?fromMealId=${mealId}&name=${encodeURIComponent(name)}`).then(r => r.data);

export const deleteFavoriteMeal = (id) =>
  api.delete(`/api/favorite-meals/${id}`).then(r => r.data);

export const quickAddMeal = (favoriteMealId, mealId) =>
  api.post(`/api/favorite-meals/${favoriteMealId}/quick-add/${mealId}`).then(r => r.data);
