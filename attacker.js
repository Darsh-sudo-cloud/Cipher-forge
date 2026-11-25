// Words an attacker tries first. Step 4 will move this list into a file.
var COMMON_WORDS = ["password", "tiger", "river", "moon", "dragon", "monkey",
  "welcome", "shadow", "sunshine", "football", "admin", "login", "hello", "forge"];

// Endings attackers add to words
var COMMON_ENDINGS = ["123", "1234", "2024", "2025", "2026", "!"];

// A rough guess for a fast attacker. This is an assumption, not a measurement.
var GUESSES_PER_SECOND = 10000000000;

// Stage 1: is a common word anywhere in the passphrase?
function stageDictionary(text) {
  var lower = text.toLowerCase();
  for (var i = 0; i < COMMON_WORDS.length; i++) {
    if (lower.indexOf(COMMON_WORDS[i]) !== -1) {
      return COMMON_WORDS[i];
    }
  }
  return null;
}

// Stage 2: undo common tricks like p@55w0rd, then check common endings
function stagePatterns(text) {
  var unleet = text.toLowerCase()
    .replace(/@/g, "a")
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/5/g, "s")
    .replace(/\$/g, "s");

  var word = stageDictionary(unleet);
  if (word) {
    return "trick with the word " + word;
  }

  for (var j = 0; j < COMMON_ENDINGS.length; j++) {
    if (text.endsWith(COMMON_ENDINGS[j])) {
      return "common ending " + COMMON_ENDINGS[j];
    }
  }
  return null;
}

// Stage 3: estimate how many guesses a brute-force attacker needs
function stageBruteForce(text) {
  var pool = 0;
  if (/[a-z]/.test(text)) pool += 26;
  if (/[A-Z]/.test(text)) pool += 26;
  if (/[0-9]/.test(text)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(text)) pool += 33;

  var guesses = Math.pow(pool, text.length);
  var seconds = guesses / 2 / GUESSES_PER_SECOND;
  return { guesses: guesses, seconds: seconds };
}

// Runs the three stages in order and stops at the first one that breaks the passphrase
function runAttack(text) {
  var word = stageDictionary(text);
  if (word) {
    return { broken: true, stage: 1, reason: "common word " + word };
  }

  var pattern = stagePatterns(text);
  if (pattern) {
    return { broken: true, stage: 2, reason: pattern };
  }

  var brute = stageBruteForce(text);
  return {
    broken: false,
    stage: 3,
    reason: "no shortcut found",
    guesses: brute.guesses,
    seconds: brute.seconds
  };
}

// Turns the stage 3 time into a plain sentence
function describeTime(seconds) {
  var years = seconds / 31536000;
  if (years >= 1000000) return "more than a million years";
  if (years >= 1) return "about " + Math.round(years) + " years";
  var days = seconds / 86400;
  if (days >= 1) return "about " + Math.round(days) + " days";
  if (seconds >= 1) return "about " + Math.round(seconds) + " seconds";
  return "under a second";
}
// Three assumed attack speeds. These are assumptions, not measurements.
var ATTACK_SCENARIOS = [
  { name: "Online login attempts", rate: 100, note: "about 100 tries per second, limited by the website" },
  { name: "Stolen password file, one computer", rate: 1000000000, note: "about 1 billion tries per second" },
  { name: "Stolen password file, GPU rig", rate: 10000000000, note: "about 10 billion tries per second" }
];

// Returns the time estimate for each scenario, or a broken result
function crackTimes(text) {
  var result = runAttack(text);

  if (result.broken) {
    return { broken: true, reason: result.reason, lines: [] };
  }

  // On average an attacker finds the answer halfway through the search
  var average = result.guesses / 2;
  var lines = [];

  for (var i = 0; i < ATTACK_SCENARIOS.length; i++) {
    var s = ATTACK_SCENARIOS[i];
    lines.push({
      name: s.name,
      note: s.note,
      time: describeTime(average / s.rate)
    });
  }

  return { broken: false, reason: "", lines: lines };
}