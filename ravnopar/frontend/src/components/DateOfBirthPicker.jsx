import { useMemo } from 'react';
import { useI18n } from '../lib/i18n/index.jsx';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function daysInMonth(year, month) {
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
}

function parseValue(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { year: '', month: '', day: '' };
  }
  const [year, month, day] = value.split('-');
  return { year, month: String(Number(month)), day: String(Number(day)) };
}

function toIso(year, month, day) {
  if (!year || !month || !day) return '';
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function isAdult(isoDate) {
  if (!isoDate) return false;
  const dob = new Date(isoDate);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age >= 18;
}

export default function DateOfBirthPicker({ value, onChange, id }) {
  const { t } = useI18n();
  const { year, month, day } = parseValue(value);
  const maxYear = new Date().getFullYear() - 18;
  const minYear = maxYear - 82;

  const years = useMemo(() => {
    const list = [];
    for (let y = maxYear; y >= minYear; y -= 1) list.push(y);
    return list;
  }, [maxYear, minYear]);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const maxDay = daysInMonth(Number(year), Number(month));
  const days = useMemo(() => Array.from({ length: maxDay }, (_, i) => i + 1), [maxDay]);

  function update(part, next) {
    let nextYear = year;
    let nextMonth = month;
    let nextDay = day;
    if (part === 'year') nextYear = String(next);
    if (part === 'month') nextMonth = String(next);
    if (part === 'day') nextDay = String(next);

    const cappedDay = Math.min(Number(nextDay || 1), daysInMonth(Number(nextYear), Number(nextMonth)));
    const iso = toIso(nextYear, nextMonth, cappedDay);
    onChange(iso);
  }

  return (
    <div className="dob-picker" id={id}>
      <label className="dob-field">
        <span className="dob-label">{t('auth.day')}</span>
        <select value={day} onChange={(e) => update('day', e.target.value)} required={Boolean(year && month)}>
          <option value="">—</option>
          {days.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </label>
      <label className="dob-field">
        <span className="dob-label">{t('auth.month')}</span>
        <select value={month} onChange={(e) => update('month', e.target.value)} required>
          <option value="">—</option>
          {months.map((m) => (
            <option key={m} value={m}>{t(`months.${m - 1}`) || m}</option>
          ))}
        </select>
      </label>
      <label className="dob-field dob-field-year">
        <span className="dob-label">{t('auth.year')}</span>
        <select value={year} onChange={(e) => update('year', e.target.value)} required>
          <option value="">—</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </label>
      <input type="hidden" value={value} required readOnly aria-hidden="true" tabIndex={-1} />
      {value && !isAdult(value) && <p className="dob-hint muted">{t('auth.dobInvalid')}</p>}
    </div>
  );
}

export { isAdult as isAdultDob };
