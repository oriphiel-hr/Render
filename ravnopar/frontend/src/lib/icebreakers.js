export function getIcebreakerPrompts(catalog) {
  return catalog?.icebreakers?.prompts ?? [];
}

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
