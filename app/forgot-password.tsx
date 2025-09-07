import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import axios, { AxiosError } from "axios";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [btn, setBtn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setBtn(email.trim().length > 0);
  }, [email]);

  const handleReset = async () => {
    if (!email) {
      setError("Please enter your email or phone");
      return;
    }
    setError(null);
    setBtn(false);
    setSuccess(null);
    try {
      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/forgot-password`,
        { identifier : email }
      );

      setSuccess(`Password reset link sent to ${email}`);
      setEmail("");
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const message = error.response?.data?.message || "Failed to send reset link";
      setError(message);
    }finally{
      setBtn(true)
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <Text style={styles.label}>Email or Phone</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email or phone"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity
        style={[styles.button, !btn && { backgroundColor: "#a5d6a7" }]}
        onPress={handleReset}
        disabled={!btn}
      >
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>

      <Link href="/login" style={styles.link}>
        Back to Login
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#18b969ff",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#868686ff",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  button: {
    backgroundColor: "#18b969ff",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#18b969ff",
    fontSize: 14,
    fontWeight: "500",
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  success: {
    color: "#ff7b00ff",
    marginBottom: 10,
    textAlign: "center",
  },
});
