import { useEffect, useState } from 'react';
import {
  createOffer,
  getJobs,
  getMyOffers,
  getOffersForJob,
  validateOfferInput
} from '@uslugar/shared';

export function useJobsFlow({
  apiBaseUrl,
  token,
  user,
  setLoading,
  setMessage,
  handleApiError
}) {
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobOffers, setJobOffers] = useState([]);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerDays, setOfferDays] = useState('');

  useEffect(() => {
    if (token && user) {
      loadBaseData();
    }
  }, [token, user?.role]);

  const resetJobSelection = () => {
    setSelectedJob(null);
    setJobOffers([]);
    setOfferAmount('');
    setOfferMessage('');
    setOfferDays('');
  };

  const loadBaseData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'PROVIDER') {
        const [jobsData, offersData] = await Promise.all([
          getJobs({ apiBaseUrl, token }),
          getMyOffers({ apiBaseUrl, token })
        ]);
        setJobs(Array.isArray(jobsData) ? jobsData : []);
        setMyOffers(Array.isArray(offersData) ? offersData : []);
      } else {
        const [jobsData, mineData] = await Promise.all([
          getJobs({ apiBaseUrl, token }),
          getJobs({ apiBaseUrl, token, myJobs: true })
        ]);
        setJobs(Array.isArray(jobsData) ? jobsData : []);
        setMyJobs(Array.isArray(mineData) ? mineData : []);
      }
    } catch (error) {
      await handleApiError(error, 'Ne mogu ucitati podatke.');
    } finally {
      setLoading(false);
    }
  };

  const openJobDetails = async (job) => {
    setSelectedJob(job);
    setJobOffers([]);
    setOfferAmount('');
    setOfferMessage('');
    setOfferDays('');
    if (user?.role !== 'PROVIDER') return;
    setLoading(true);
    try {
      const response = await getOffersForJob({ apiBaseUrl, token, jobId: job.id });
      setJobOffers(Array.isArray(response?.offers) ? response.offers : []);
    } catch (error) {
      await handleApiError(error, 'Ne mogu ucitati ponude za posao.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOffer = async () => {
    if (!selectedJob) return;
    const validation = validateOfferInput({ amount: offerAmount, message: offerMessage });
    if (validation) {
      setMessage(validation);
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      await createOffer({
        apiBaseUrl,
        token,
        jobId: selectedJob.id,
        amount: Number(offerAmount),
        message: offerMessage.trim(),
        estimatedDays: offerDays ? Number(offerDays) : undefined
      });
      setMessage('Ponuda je uspjesno poslana.');
      await openJobDetails(selectedJob);
      await loadBaseData();
    } catch (error) {
      await handleApiError(error, 'Ne mogu poslati ponudu.');
    } finally {
      setLoading(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    jobs,
    myJobs,
    myOffers,
    selectedJob,
    setSelectedJob,
    jobOffers,
    offerAmount,
    setOfferAmount,
    offerMessage,
    setOfferMessage,
    offerDays,
    setOfferDays,
    resetJobSelection,
    loadBaseData,
    openJobDetails,
    handleSubmitOffer
  };
}
