import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios, { AxiosError } from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function OtpVerificationScreen() {
  const { email } = useLocalSearchParams();
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputs = useRef<Array<TextInput | null>>([]);
  const [error, setError] = useState<string | null>(null);
  const [btn, setBtn] = useState(false);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) inputs.current[index + 1]?.focus();
    if (!text && index > 0) inputs.current[index - 1]?.focus();

    setBtn(newOtp.every((digit) => digit !== ""));
  };

  const handleVerify = async () => {
    const code = otp.join("");
    setBtn(false);

    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/verify-otp`,
        { email, otp: code }
      );

      if (response.status === 201 || response.status === 200) {
        router.push("/login");
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const message = error.response?.data?.message || "Failed to verify OTP";
      setError(message);
    } finally {
      setBtn(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to your email{" "}
        {typeof email === "string"
          ? (() => {
              const [local, domain] = email.split("@");
              const visibleChars = 4;
              const maskedLocal =
                local.length > visibleChars
                  ? local.slice(0, visibleChars) + "****"
                  : local + "****";
              return `${maskedLocal}@${domain}`;
            })()
          : ""}
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            ref={(ref) => {
              inputs.current[index] = ref;
            }}
            onChangeText={(text: string) => handleChange(text, index)}
            value={digit}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, !btn && { backgroundColor: "#a5d6a7" }]}
        onPress={handleVerify}
        disabled={!btn}
      >
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>
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
    marginBottom: 10,
    textAlign: "center",
    color: "#18b969ff",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
    color: "#868686ff",
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  otpInput: {
    backgroundColor: "#fff",
    width: 50,
    height: 55,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
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
});
