import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext.jsx';
import { useAuth } from '../App';
import api from '@/api';
import JourneyDiagram from '../components/JourneyDiagram';
import ProcessDiagramsSection from '../components/ProcessDiagramsSection';

export default function UserTypesFlowcharts() {
  const { isDarkMode } = useDarkMode();
  const { token } = useAuth();
  const [journeyStatus, setJourneyStatus] = useState(null);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [journeyError, setJourneyError] = useState(null);

  const textColor = isDarkMode ? '#E5E7EB' : '#1F2937';
  const bgColor = isDarkMode ? '#111827' : '#FFFFFF';

  useEffect(() => {
    if (!token) {
      setJourneyStatus(null);
      setJourneyError(null);
      return;
    }
    setJourneyLoading(true);
    setJourneyError(null);
    api.get('/users/journey-status')
      .then((r) => setJourneyStatus(r.data))
      .catch((err) => {
        setJourneyError(err?.response?.status === 401 ? 'Prijavite se za prikaz' : 'Ne mogu dohvatiti status putovanja.');
        setJourneyStatus(null);
      })
      .finally(() => setJourneyLoading(false));
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ backgroundColor: bgColor }}>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4" style={{ color: textColor }}>
          📊 Dijagrami Procesa za Tipove Korisnika
        </h1>
        <p className="text-xl mb-6" style={{ color: textColor }}>
          Vizualni prikaz cijelog procesa za različite tipove korisnika na Uslugar platformi
        </p>
      </div>

      <div className="mb-16 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
          📍 Vi ste ovdje – Vaš put kroz platformu
        </h2>
        <p className="text-sm mb-4" style={{ color: textColor, opacity: 0.8 }}>
          Dijagram se prilagođava vašem tipu korisnika i prikazuje trenutni korak te što čeka na drugog sudionika (npr. pružatelja ili klijenta).
        </p>
        {!token ? (
          <div className="flex items-center justify-center p-8 rounded-lg border border-dashed border-gray-300 dark:border-gray-600" style={{ color: textColor, opacity: 0.8 }}>
            Prijavite se da biste vidjeli gdje se nalazite u procesu.
          </div>
        ) : journeyLoading ? (
          <div className="flex items-center justify-center p-12 text-gray-500 dark:text-gray-400">
            Učitavanje...
          </div>
        ) : journeyError ? (
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200">
            {journeyError}
          </div>
        ) : journeyStatus ? (
          <JourneyDiagram
            journeyStatus={journeyStatus}
            onRefresh={() => {
              if (!token) return;
              api.get('/users/journey-status')
                .then((r) => setJourneyStatus(r.data))
                .catch((err) => setJourneyError(err?.response?.data?.message || 'Greška'));
            }}
            isDarkMode={isDarkMode}
          />
        ) : null}
      </div>

      <div className="mb-16 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
          📋 Povezani procesi
        </h2>
        <p className="text-sm mb-4" style={{ color: textColor, opacity: 0.8 }}>
          Verifikacija, pretplata, queue sustav, lead sustav, notifikacije
        </p>
        <ProcessDiagramsSection isDarkMode={isDarkMode} />
      </div>

      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold mb-3" style={{ color: isDarkMode ? '#93C5FD' : '#1E40AF' }}>
          ℹ️ O dijagramima
        </h3>
        <p className="text-sm" style={{ color: isDarkMode ? '#BFDBFE' : '#1E3A8A' }}>
          Interaktivni dijagram prikazuje vaš put kroz platformu ovisno o tipu korisnika (korisnik usluge, pružatelj, direktor, član tima).
          U sekciji Povezani procesi možete pregledati Verifikaciju, Pretplatu, Queue sustav, Lead sustav i Notifikacije.
        </p>
      </div>
    </div>
  );
}
