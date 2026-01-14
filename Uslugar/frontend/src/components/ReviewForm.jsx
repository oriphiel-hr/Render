import React, { useState } from 'react';
import api from '../api';

const ReviewForm = ({ providerId, providerName, onReviewSubmitted, existingReview = null }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Molimo odaberite ocjenu');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const data = {
        toUserId: providerId,
        rating,
        comment: comment.trim()
      };

      if (existingReview) {
        // Ažuriranje postojećeg review-a
        await api.put(`/reviews/${existingReview.id}`, data);
      } else {
        // Kreiranje novog review-a
        await api.post('/reviews', data);
      }

      onReviewSubmitted?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri slanju recenzije');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setRating(star)}
        className={`text-2xl ${
          star <= rating ? 'text-yellow-400' : 'text-gray-300'
        } hover:text-yellow-400 transition-colors`}
      >
        ★
      </button>
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {existingReview ? 'Uredite recenziju' : 'Ocijenite izvođača radova'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ocjena *
          </label>
          <div className="flex space-x-1">
            {renderStars()}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {rating === 0 ? 'Odaberite ocjenu' : 
             rating === 1 ? 'Vrlo loše' :
             rating === 2 ? 'Loše' :
             rating === 3 ? 'Dobro' :
             rating === 4 ? 'Vrlo dobro' : 'Odlično'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Komentar
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Podijelite svoje iskustvo s ovim izvođačem radova..."
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => onReviewSubmitted?.()}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Odustani
          </button>
          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Šalje se...' : (existingReview ? 'Ažuriraj' : 'Pošalji recenziju')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
