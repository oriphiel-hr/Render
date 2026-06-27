export const ICEBREAKER_PROMPTS = [
  'Omiljena kava u tvom gradu?',
  'Idealni vikend izgleda ovako…',
  'Nešto što me odmah nasmije:',
  'Moja go-to comfort hrana:',
  'Plan za prvi susret:',
  'Trenutno me zanima:',
  'Pjesma koja me opisuje:',
  'Putovanje koje bih odmah krenuo/la:'
];

export function normalizeIcebreakers(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item.question === 'string' && typeof item.answer === 'string')
    .map((item) => ({
      question: item.question.trim().slice(0, 120),
      answer: item.answer.trim().slice(0, 200)
    }))
    .filter((item) => item.question && item.answer)
    .slice(0, 3);
}
