import { useEffect, useState } from 'react';
import { useI18n } from '../lib/i18n/index.jsx';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function isoToDisplay(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}.`;
}

function formatWhileTyping(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

function isValidCalendarDate(year, month, day) {
  if (!year || !month || !day) return false;
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (m < 1 || m > 12 || d < 1) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function parseDobText(raw) {
  const trimmed = raw.trim().replace(/\.$/, '');
  const dotted = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotted) {
    const [, d, m, y] = dotted;
    if (!isValidCalendarDate(y, m, d)) return '';
    return `${y}-${pad2(m)}-${pad2(d)}`;
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 8) {
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);
    if (!isValidCalendarDate(year, month, day)) return '';
    return `${year}-${month}-${day}`;
  }
  return '';
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

function formatDisplayLong(iso, t) {
  const [year, month, day] = iso.split('-');
  const monthName = t(`months.${Number(month) - 1}`) || month;
  return `${Number(day)}. ${monthName} ${year}.`;
}

export default function DateOfBirthPicker({ value, onChange, id }) {
  const { t } = useI18n();
  const [text, setText] = useState(() => isoToDisplay(value));
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      setText(isoToDisplay(value));
    } else if (!value) {
      setText('');
    }
  }, [value]);

  function handleChange(event) {
    const next = formatWhileTyping(event.target.value);
    setText(next);
    onChange(parseDobText(next));
  }

  const iso = parseDobText(text);
  const hintId = id ? `${id}-hint` : undefined;
  const showInvalid = touched && text.length >= 8 && !iso;
  const showUnderage = Boolean(iso && !isAdult(iso));

  return (
    <div className="dob-picker dob-picker-single" id={id}>
      <input
        type="text"
        className="input dob-input"
        inputMode="numeric"
        autoComplete="bday"
        placeholder={t('auth.dobPlaceholder')}
        value={text}
        onChange={handleChange}
        onBlur={() => setTouched(true)}
        required
        aria-describedby={hintId}
        maxLength={11}
      />
      <p className="dob-hint muted" id={hintId}>
        {t('auth.dobFormatHint')}
      </p>
      {iso && isAdult(iso) && (
        <p className="dob-confirmed" role="status">
          {t('auth.dobSelected', { date: formatDisplayLong(iso, t) })}
        </p>
      )}
      {(showInvalid || showUnderage) && (
        <p className="dob-hint dob-hint-error">{t('auth.dobInvalid')}</p>
      )}
    </div>
  );
}

export { isAdult as isAdultDob };
