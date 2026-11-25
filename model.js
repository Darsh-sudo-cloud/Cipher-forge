// Pattern Sense: a small character model learned from a list of words.
// It counts which character tends to follow which, then scores how
// expected a passphrase looks to that model.

var TRAINING_WORDS = [
  "password", "qwerty", "letmein", "welcome", "dragon", "monkey", "shadow",
  "sunshine", "football", "admin", "login", "hello", "tiger", "river", "moon",
  "ember", "velvet", "harbor", "quartz", "lantern", "meadow", "falcon", "glacier",
  "cobalt", "orbit", "saddle", "violet", "canyon", "pepper", "thunder", "mosaic",
  "ripple", "summit", "crystal"
];

// A rough count of the characters the model expects to see
var ALPHABET_SIZE = 40;

// Step 1: learn. Count how often each character is followed by each other character.
function trainModel(words) {
  var pairCounts = {};
  var rowTotals = {};

  for (var w = 0; w < words.length; w++) {
    // ^ marks the start of a word, $ marks the end
    var s = "^" + words[w].toLowerCase() + "$";

    for (var i = 0; i < s.length - 1; i++) {
      var a = s[i];
      var b = s[i + 1];

      if (!pairCounts[a]) {
        pairCounts[a] = {};
      }
      pairCounts[a][b] = (pairCounts[a][b] || 0) + 1;
      rowTotals[a] = (rowTotals[a] || 0) + 1;
    }
  }

  return { pairCounts: pairCounts, rowTotals: rowTotals };
}

var MODEL = trainModel(TRAINING_WORDS);

// Step 2: score. Average probability of each character pair, using the learned counts.
function perCharProbability(text) {
   var s = "^" + text.toLowerCase().replace(/[^a-z]/g, "") + "$";
  var logSum = 0;
  var steps = 0;

  for (var i = 0; i < s.length - 1; i++) {
    var a = s[i];
    var b = s[i + 1];
    var count = (MODEL.pairCounts[a] && MODEL.pairCounts[a][b]) || 0;
    var total = MODEL.rowTotals[a] || 0;

    // Laplace smoothing: a pair the model has never seen gets a small chance, not zero
    var prob = (count + 1) / (total + ALPHABET_SIZE);

    logSum += Math.log(prob);
    steps++;
  }

  // Geometric mean: the typical chance of one character pair
  return Math.exp(logSum / steps);
}

// Step 3: turn the number into a label
// Step 3: turn the number into a label
function senseLabel(text) {
  var p = perCharProbability(text);

  if (p >= 0.035) {
    return { label: "Familiar", note: "The model expects this. It looks like ordinary words." };
  }
  if (p >= 0.028) {
    return { label: "Somewhat familiar", note: "Parts of this look like words the model has seen." };
  }
  return { label: "Unfamiliar", note: "The model finds this surprising. It does not look like common words." };
}