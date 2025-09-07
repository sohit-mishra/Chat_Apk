import { Link } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>

      <Link href="/login" style={styles.link}>Login</Link>
      <Link href="/signup" style={styles.link}>Sign Up</Link>
      <Link href="/forgot-password" style={styles.link}>Forgot Password</Link>
      <Link href="/reset-password/[token]" style={styles.link}>Reset Password</Link>
      <Link href="/otp" style={styles.link}>OTP Page</Link>
      <Link href="/updateprofile" style={styles.link}>Update Profile</Link>
      <Link href="/chat" style={styles.link}>Chat </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#18b969ff',
  },
  link: {
    fontSize: 16,
    color: '#3b82f6',
    marginVertical: 8,
    fontWeight: '500',
  },
});
