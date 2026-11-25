// Scores a passphrase from 0 to 100 using simple rules.
function scorePassphrase(text) {
  let score = 0;

  // Length: longer passphrases are stronger
  if (text.length >= 8) score += 20;
  if (text.length >= 12) score += 20;
  if (text.length >= 16) score += 10;

  // Character variety
  if (/[a-z]/.test(text)) score += 10;   // lowercase letter
  if (/[A-Z]/.test(text)) score += 10;   // uppercase letter
  if (/[0-9]/.test(text)) score += 10;   // digit
  if (/[^a-zA-Z0-9]/.test(text)) score += 10;  // symbol

  // Penalty for a number at the end, like "password123"
  if (/[a-zA-Z]+[0-9]+$/.test(text)) score -= 10;

  // Penalty for the same character repeated 3 or more times in a row
  if (/(.)\1\1/.test(text)) score -= 20;

  // Keep the score between 0 and 100
  if (score < 0) score = 0;
  if (score > 100) score = 100;

  return score;
}

// Returns a label for the score
function strengthLabel(score) {
  if (score < 40) return "Weak";
  if (score < 70) return "Fair";
  if (score < 90) return "Strong";
  return "Excellent";
}