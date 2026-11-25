#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include <math.h>

#define GUESSES_PER_SECOND 10000000000.0

static const char *COMMON_WORDS[] = {
    "password", "tiger", "river", "moon", "dragon", "monkey",
    "welcome", "shadow", "sunshine", "football", "admin", "login",
    "hello", "forge"
};
#define NUM_WORDS (int)(sizeof(COMMON_WORDS) / sizeof(COMMON_WORDS[0]))

static const char *COMMON_ENDINGS[] = {"123", "1234", "2024", "2025", "2026", "!"};
#define NUM_ENDINGS (int)(sizeof(COMMON_ENDINGS) / sizeof(COMMON_ENDINGS[0]))

// Copies text into lower, converted to lowercase
static void to_lower(const char *text, char *lower) {
    int i;
    for (i = 0; text[i] != '\0'; i++) {
        lower[i] = (char)tolower((unsigned char)text[i]);
    }
    lower[i] = '\0';
}

// Stage 1: returns the first common word found, or NULL
static const char *stage_dictionary(const char *text) {
    char lower[256];
    int i;
    to_lower(text, lower);
    for (i = 0; i < NUM_WORDS; i++) {
        if (strstr(lower, COMMON_WORDS[i]) != NULL) {
            return COMMON_WORDS[i];
        }
    }
    return NULL;
}

// Stage 2: undo common tricks, then check common endings.
// Returns 1 if it broke the passphrase, and fills in reason.
static int stage_patterns(const char *text, char *reason) {
    char unleet[256];
    int i;
    size_t len, elen;
    const char *word;

    to_lower(text, unleet);
    for (i = 0; unleet[i] != '\0'; i++) {
        if (unleet[i] == '@') unleet[i] = 'a';
        else if (unleet[i] == '0') unleet[i] = 'o';
        else if (unleet[i] == '1') unleet[i] = 'i';
        else if (unleet[i] == '3') unleet[i] = 'e';
        else if (unleet[i] == '5') unleet[i] = 's';
        else if (unleet[i] == '$') unleet[i] = 's';
    }

    word = stage_dictionary(unleet);
    if (word != NULL) {
        sprintf(reason, "trick with the word %s", word);
        return 1;
    }

    len = strlen(text);
    for (i = 0; i < NUM_ENDINGS; i++) {
        elen = strlen(COMMON_ENDINGS[i]);
        if (len >= elen && strcmp(text + len - elen, COMMON_ENDINGS[i]) == 0) {
            sprintf(reason, "common ending %s", COMMON_ENDINGS[i]);
            return 1;
        }
    }
    return 0;
}

// Stage 3: estimate how many guesses a brute-force attacker needs
static void stage_brute_force(const char *text, double *guesses, double *seconds) {
    int has_lower = 0, has_upper = 0, has_digit = 0, has_symbol = 0;
    int pool = 0;
    size_t i, len;

    len = strlen(text);
    for (i = 0; i < len; i++) {
        unsigned char c = (unsigned char)text[i];
        if (islower(c)) has_lower = 1;
        else if (isupper(c)) has_upper = 1;
        else if (isdigit(c)) has_digit = 1;
        else has_symbol = 1;
    }

    if (has_lower) pool += 26;
    if (has_upper) pool += 26;
    if (has_digit) pool += 10;
    if (has_symbol) pool += 33;

    *guesses = pow((double)pool, (double)len);
    *seconds = *guesses / 2.0 / GUESSES_PER_SECOND;
}

// Runs the three stages in order.
// Returns 1, 2, or 3 for the stage that broke it, or 3 if none did.
static int run_attack(const char *text, char *reason, double *guesses, double *seconds) {
    const char *word = stage_dictionary(text);
    if (word != NULL) {
        sprintf(reason, "common word %s", word);
        return 1;
    }

    if (stage_patterns(text, reason)) {
        return 2;
    }

    strcpy(reason, "no shortcut found");
    stage_brute_force(text, guesses, seconds);
    return 3;
}

// Prints the stage 3 time as a plain sentence
static void print_time(double seconds) {
    double years = seconds / 31536000.0;
    double days = seconds / 86400.0;

    if (years >= 1000000) printf("more than a million years\n");
    else if (years >= 1) printf("about %.0f years\n", round(years));
    else if (days >= 1) printf("about %.0f days\n", round(days));
    else if (seconds >= 1) printf("about %.0f seconds\n", round(seconds));
    else printf("under a second\n");
}

int main(int argc, char *argv[]) {
    char reason[128] = "";
    double guesses = 0.0, seconds = 0.0;
    int stage;

    if (argc < 2) {
        printf("Usage: attacker.exe \"your passphrase\"\n");
        return 1;
    }

    stage = run_attack(argv[1], reason, &guesses, &seconds);

    printf("Passphrase: %s\n", argv[1]);
    if (stage < 3) {
        printf("Result: BROKEN at stage %d (%s)\n", stage, reason);
    } else {
        printf("Result: SURVIVED all stages (%s)\n", reason);
        printf("Estimated guesses: %e\n", guesses);
        printf("Estimated time: ");
        print_time(seconds);
    }
    return 0;
}