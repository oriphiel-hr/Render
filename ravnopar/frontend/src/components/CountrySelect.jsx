import { useI18n } from '../lib/i18n/index.jsx';

export default function CountrySelect({ value, onChange, id, required = true }) {
  const { countryCodes, countryName } = useI18n();

  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} required={required}>
      {countryCodes.map((code) => (
        <option key={code} value={code}>
          {countryName(code)}
        </option>
      ))}
    </select>
  );
}
