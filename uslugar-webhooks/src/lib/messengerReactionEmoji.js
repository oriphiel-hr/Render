/**
 * Meta message_reactions: polje reaction.reaction je tip (like, love, …),
 * a reaction.emoji UTF-8 znak — često je emoji prazan, pa treba mapa.
 * @see https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/message-reactions
 */
const MESSENGER_REACTION_TYPE_TO_EMOJI = {
  like: '👍',
  love: '❤️',
  smile: '😊',
  angry: '😠',
  sad: '😢',
  wow: '😮',
  dislike: '👎',
  other: '💬'
};

/**
 * @param {unknown} reaction — objekt event.reaction iz webhooka
 * @returns {string} jedan emoji ili prazan string
 */
function reactionEmojiFromReactionObject(reaction) {
  if (!reaction || typeof reaction !== 'object') return '';
  const fromApi = reaction.emoji != null ? String(reaction.emoji).trim() : '';
  if (fromApi) return fromApi;
  const typeKey =
    reaction.reaction != null && typeof reaction.reaction === 'string'
      ? String(reaction.reaction).toLowerCase().trim()
      : '';
  return (typeKey && MESSENGER_REACTION_TYPE_TO_EMOJI[typeKey]) || '';
}

/**
 * @param {unknown} rawPayload — cijeli messaging event ili Graph poruka
 */
function reactionEmojiFromMessengerRaw(rawPayload) {
  if (!rawPayload || typeof rawPayload !== 'object') return '';
  if (rawPayload.reaction && typeof rawPayload.reaction === 'object') {
    return reactionEmojiFromReactionObject(rawPayload.reaction);
  }
  return '';
}

module.exports = {
  MESSENGER_REACTION_TYPE_TO_EMOJI,
  reactionEmojiFromReactionObject,
  reactionEmojiFromMessengerRaw
};
