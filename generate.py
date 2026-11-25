import random

# Load the words from the file, removing blank lines and extra spaces
with open("wordlist.txt") as f:
    words = [line.strip() for line in f if line.strip()]

# Pick three different words at random
picked = random.sample(words, 3)

# Add a random two-digit number and a symbol to strengthen it
number = random.randint(10, 99)
symbol = random.choice(["#", "%", "&", "*"])

passphrase = "-".join(picked) + "-" + str(number) + symbol

print("Suggested passphrase:", passphrase)