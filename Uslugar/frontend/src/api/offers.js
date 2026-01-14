// Offers API Client
import api from '../api';

// ============================================================
// OFFERS
// ============================================================

export const createOffer = (jobId, amount, message, isNegotiable = true, estimatedDays = null) => {
  return api.post('/offers', {
    jobId,
    amount: parseInt(amount),
    message: message || '',
    isNegotiable,
    estimatedDays: estimatedDays ? parseInt(estimatedDays) : null
  });
};

export const getMyOffers = () => {
  return api.get('/offers/my-offers');
};

export const getJobOffers = (jobId) => {
  return api.get(`/offers/job/${jobId}`);
};

export const acceptOffer = (offerId) => {
  return api.patch(`/offers/${offerId}/accept`);
};

export const rejectOffer = (offerId) => {
  return api.patch(`/offers/${offerId}/reject`);
};

export const canSendOffer = () => {
  return api.get('/subscriptions/can-send-offer');
};

