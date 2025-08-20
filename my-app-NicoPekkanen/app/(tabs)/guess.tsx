
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
    Keyboard,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const random1to100 = () => Math.floor(Math.random() * 100) + 1;

export default function GuessGameScreen() {
  const [seed, setSeed] = useState(0);
  const target = useMemo(() => random1to100(), [seed]);

  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState<string>("");
  const [attempts, setAttempts] = useState(0);

  const gameOver = feedback === "correct";

  const handleGuess = () => {
    const trimmed = guess.trim();
    const n = Number(trimmed);

    if (!trimmed || Number.isNaN(n) || !Number.isInteger(n) || n < 1 || n > 100) {
      setFeedback("Please enter a whole number between 1 and 100");
      return;
    }

    setAttempts((a) => a + 1);

    if (n === target) setFeedback("correct");
    else if (n < target) setFeedback("too low");
    else setFeedback("too high");

    setGuess("");
    Keyboard.dismiss();
  };

  const resetGame = () => {
    setSeed((s) => s + 1);
    setGuess("");
    setFeedback("");
    setAttempts(0);
  };

  const canGuess = !gameOver && guess.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Text style={styles.title}>Number Guessing Game</Text>
        <Text style={styles.subtitle}>I&apos;m thinking of a number 1–100</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your guess (1-100)"
          value={guess}
          onChangeText={setGuess}
          keyboardType="number-pad"
          inputMode="numeric"
          returnKeyType="done"
          onSubmitEditing={canGuess ? handleGuess : undefined}
          editable={!gameOver}
        />

        <Pressable
          onPress={handleGuess}
          disabled={!canGuess}
          style={({ pressed }) => [
            styles.button,
            (!canGuess || pressed) && styles.buttonDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Make guess"
        >
          <Text style={styles.buttonText}>Make guess</Text>
        </Pressable>

        <View style={styles.feedbackBox}>
          {feedback ? (
            <>
              {(feedback === "too low" || feedback === "too high" || feedback === "correct") ? (
                <Text
                  style={[
                    styles.feedbackText,
                    feedback === "correct" ? styles.correctText : undefined,
                  ]}
                >
                  {feedback}
                </Text>
              ) : (
                <Text style={styles.helperText}>{feedback}</Text>
              )}

              {feedback === "correct" && (
                <Text style={styles.resultText}>
                  You guessed the number in <Text style={styles.bold}>{attempts}</Text>{" "}
                  {attempts === 1 ? "try" : "tries"} 🎉
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.helperText}>Make a guess!</Text>
          )}
        </View>

        {gameOver && (
          <Pressable onPress={resetGame} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Play again</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 14, color: "#666" },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#1e90ff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 1,
  },
  buttonDisabled: { backgroundColor: "#a8c8f5" },
  buttonText: { color: "white", fontWeight: "700", fontSize: 16 },
  feedbackBox: { minHeight: 70, alignItems: "center", justifyContent: "center" },
  feedbackText: { fontSize: 22, fontWeight: "800", marginTop: 4 },
  correctText: { color: "#1aa34a" },
  helperText: { color: "#666" },
  resultText: { marginTop: 8, fontSize: 16 },
  bold: { fontWeight: "800" },
  secondaryButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bbb",
  },
  secondaryButtonText: { fontWeight: "700" },
});