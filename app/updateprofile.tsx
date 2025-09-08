import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";



export default function UpdateProfileScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          navigation.replace("login");
          return;
        }

        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/users/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const user = response.data;
        setName(user.name);
        setEmail(user.email);
        setPhone(user.phone);
        setAvatar(user.avatar);
      } catch (error) {
        const err = error as AxiosError;
        console.log("Fetch user error:", err.response?.data || err.message);
        Alert.alert("Error", "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

const pickImage = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const imageUri = result.assets[0].uri;
    setAvatar(imageUri);

    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Error", "You are not logged in");
      return;
    }

    const filename = imageUri.split("/").pop() || `avatar_${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1].toLowerCase()}` : `image/jpeg`;

    if (type === "image/jpg") type = "image/jpeg";

    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      name: filename,
      type,
    } as unknown as Blob);

   const response = await axios.put(
      `${process.env.EXPO_PUBLIC_API_URL}/users/update/profile`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    await AsyncStorage.setItem("avatar", response.data.user.avatar);
    Alert.alert("Success", "Profile photo updated!");
  } catch (error) {
    const err = error as AxiosError;
    console.log("Upload error:", err.response?.data || err.message);
    const message = (err.response?.data as any)?.message || "Something went wrong";
    Alert.alert("Upload Failed", message);
  }
};

  const handleSave = async () => {
    if (!name || !phone) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    setSaving(true);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "You are not logged in");
        navigation.replace("login");
        return;
      }

      const formData = {
        name,
        phone,
      };

      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/users/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
    } catch (error) {
      const err = error as AxiosError;
      console.log(err.response?.data || err.message);
      const message =
        (err.response?.data as any)?.message || "Something went wrong";
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#18b969ff" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingVertical: 30 }}
    >
      <View style={styles.card}>
        <View style={styles.avatarContainer}>
          <Image source={avatar ? { uri: avatar } : require("../assets/images/profile.png")} style={styles.avatar} />
          <TouchableOpacity style={styles.changePhotoBtn} onPress={pickImage}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          editable={false}
          placeholder="Enter your email"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter your phone"
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    marginHorizontal: 10,
    padding: 25,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  changePhotoBtn: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  changePhotoText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f9fafb",
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
});
