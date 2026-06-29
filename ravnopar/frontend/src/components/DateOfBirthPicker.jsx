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

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year, month) {
  if (month < 1 || month > 12) return 0;
  return new Date(year, month, 0).getDate();
}

function extractParts(raw) {
  const trimmed = raw.trim().replace(/\.$/, '');
  const dotted = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotted) {
    return {
      day: Number(dotted[1]),
      month: Number(dotted[2]),
      year: Number(dotted[3])
    };
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 8) {
    return {
      day: Number(digits.slice(0, 2)),
      month: Number(digits.slice(2, 4)),
      year: Number(digits.slice(4, 8))
    };
  }
  return null;
}

function getAllowedYearRange() {
  const maxYear = new Date().getFullYear() - 18;
  return { minYear: maxYear - 82, maxYear };
}

/** @returns {null | 'INVALID_MONTH' | 'INVALID_DAY' | 'INVALID_DAY_FOR_MONTH' | 'FEB_29_NOT_LEAP' | 'INVALID_YEAR' | 'UNDERAGE'} */
export function validateDobParts(day, month, year) {
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    return null;
  }

  if (month < 1 || month > 12) return 'INVALID_MONTH';
  if (day < 1) return 'INVALID_DAY';

  const { minYear, maxYear } = getAllowedYearRange();
  if (year < minYear || year > maxYear) return 'INVALID_YEAR';

  if (month === 2 && day === 29 && !isLeapYear(year)) {
    return 'FEB_29_NOT_LEAP';
  }

  const maxDay = daysInMonth(year, month);
  if (day > maxDay) {
    return 'INVALID_DAY_FOR_MONTH';
  }

  const iso = `${year}-${pad2(month)}-${pad2(day)}`;
  if (!isAdult(iso)) return 'UNDERAGE';

  return null;
}

function partsToIso(parts) {
  if (!parts || validateDobParts(parts.day, parts.month, parts.year)) return '';
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

function parseDobText(raw) {
  return partsToIso(extractParts(raw));
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

  const parts = extractParts(text);
  const digitCount = text.replace(/\D/g, '').length;
  const errorCode = parts ? validateDobParts(parts.day, parts.month, parts.year) : null;
  const iso = partsToIso(parts);
  const hintId = id ? `${id}-hint` : undefined;
  const showError = Boolean(errorCode && (touched || digitCount === 8));

  function errorMessage() {
    if (!errorCode || !parts) return t('auth.dobInvalid');
    switch (errorCode) {
      case 'INVALID_MONTH':
        return t('auth.dobInvalidMonth');
      case 'INVALID_DAY':
        return t('auth.dobInvalidDay');
      case 'INVALID_DAY_FOR_MONTH':
        return t('auth.dobInvalidDayForMonth', {
          day: parts.day,
          max: daysInMonth(parts.year, parts.month)
        });
      case 'FEB_29_NOT_LEAP':
        return t('auth.dobFeb29NotLeap', { year: parts.year });
      case 'INVALID_YEAR': {
        const { minYear, maxYear } = getAllowedYearRange();
        return t('auth.dobInvalidYear', { min: minYear, max: maxYear });
      }
      case 'UNDERAGE':
        return t('auth.dobUnderage');
      default:
        return t('auth.dobInvalid');
    }
  }

  return (
    <div className="dob-picker-single" id={id}>
      <input
        type="text"
        className="dob-input"
        inputMode="numeric"
        autoComplete="bday"
        placeholder={t('auth.dobPlaceholder')}
        value={text}
        onChange={handleChange}
        onBlur={() => setTouched(true)}
        required
        aria-describedby={hintId}
        aria-invalid={showError || undefined}
        maxLength={11}
      />
      <p className="dob-hint muted" id={hintId}>
        {t('auth.dobFormatHint')}
      </p>
      {iso && (
        <p className="dob-confirmed" role="status">
          {t('auth.dobSelected', { date: formatDisplayLong(iso, t) })}
        </p>
      )}
      {showError && <p className="dob-hint dob-hint-error">{errorMessage()}</p>}
    </div>
  );
}

export { isAdult as isAdultDob };
