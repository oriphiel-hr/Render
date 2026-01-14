import React, { useState, useEffect } from 'react';

const JobCard = ({ job, onViewDetails, onMakeOffer }) => {
  const [isProvider, setIsProvider] = useState(false);

  useEffect(() => {
    // Provjeri da li je korisnik PROVIDER
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setIsProvider(userData.role === 'PROVIDER' || (userData.role === 'USER' && userData.legalStatusId));
      } catch (e) {
        setIsProvider(false);
      }
    }
  }, []);
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('hr-HR', {
      style: 'currency',
      currency: 'HRK'
    }).format(amount);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'NORMAL': return 'bg-blue-100 text-blue-800';
      case 'LOW': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobSizeColor = (size) => {
    switch (size) {
      case 'SMALL': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LARGE': return 'bg-orange-100 text-orange-800';
      case 'EXTRA_LARGE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{job.title}</h3>
        <div className="flex gap-2">
          {job.urgency && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(job.urgency)}`}>
              {job.urgency}
            </span>
          )}
          {job.jobSize && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobSizeColor(job.jobSize)}`}>
              {job.jobSize}
            </span>
          )}
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{job.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {job.category?.name}
        </span>
        {job.city && (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
            📍 {job.city}
          </span>
        )}
      </div>

      {job.images && job.images.length > 0 && (
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto">
            {job.images.slice(0, 3).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${job.title} - slika ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                loading="lazy"
              />
            ))}
            {job.images.length > 3 && (
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                +{job.images.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-semibold text-green-600">
          {job.budgetMin && job.budgetMax ? (
            `${formatPrice(job.budgetMin)} - ${formatPrice(job.budgetMax)}`
          ) : job.budgetMin ? (
            `Od ${formatPrice(job.budgetMin)}`
          ) : job.budgetMax ? (
            `Do ${formatPrice(job.budgetMax)}`
          ) : (
            'Cijena po dogovoru'
          )}
        </div>
        <div className="text-sm text-gray-500">
          {job.offers?.length || 0} ponuda
        </div>
      </div>

      {job.deadline && (
        <div className="mb-4 text-sm text-gray-600">
          <span className="font-medium">Rok:</span> {new Date(job.deadline).toLocaleDateString('hr-HR')}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(job)}
          className="flex-1 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          aria-label={`Pregledaj detalje za posao: ${job.title}`}
        >
          Pregledaj detalje
        </button>
        {isProvider && job.status === 'OPEN' && (
          <button
            onClick={() => onMakeOffer(job)}
            className="flex-1 bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            aria-label={`Pošalji ponudu za posao: ${job.title}`}
          >
            Pošalji ponudu
          </button>
        )}
      </div>
    </article>
  );
};

export default JobCard;
