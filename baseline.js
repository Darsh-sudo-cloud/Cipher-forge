// A common, simple checker: length plus character variety, nothing else.
// It returns "accept" or "reject". It does not check for common words or patterns.
function baselineCheck(text) {
  var ok = text.length >= 12 &&
    /[a-z]/.test(text) &&
    /[A-Z]/.test(text) &&
    /[0-9]/.test(text) &&
    /[^a-zA-Z0-9]/.test(text);

  return ok ? "accept" : "reject";
}