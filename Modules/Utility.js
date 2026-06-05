/**
 * Validates if the card is between 1 and 13 (inclusive).
 * @param {number} card - The card number to validate.
 * @returns {boolean} - True if the card is valid, false otherwise.
 */
export function validateCard(card) {
	return card >= 1 && card <= 13;
}
