import { Stack, router } from "expo-router";
import {
  View,
  Image,
  TouchableOpacity,
  ActionSheetIOS,
  Platform,
  Alert,
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const avatar = await AsyncStorage.getItem("avatar");
        if (avatar) setProfileAvatar(avatar);
      } catch (error) {
        console.log("Failed to load avatar:", error);
      }
    };
    loadAvatar();
  }, []);

  const openMenu = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Update Profile", "Logout", "Cancel"],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2,
          title: "Profile",
        },
        (buttonIndex) => {
          if (buttonIndex === 0) router.push("/updateprofile");
          if (buttonIndex === 1) handleLogout();
        }
      );
    } else {
      Alert.alert("Profile", "Choose an option", [
        {
          text: "Update Profile",
          onPress: () => router.push("/updateprofile"),
        },
        { text: "Logout", onPress: handleLogout, style: "destructive" },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const openProfile = () => {
    router.push("/updateprofile");
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("avatar");
      router.replace("/login");
    } catch (error) {
      console.log("Logout failed:", error);
      Alert.alert("Error", "Unable to logout. Please try again.");
    }
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#292929ff" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "ChatApp",
          headerLeft: () => (
            <Image
              source={require("../assets/images/icon.png")}
              style={{ width: 36, height: 86, marginLeft: 1, marginRight: 10, paddingTop: 10 }}
              resizeMode="contain"
            />
          ),
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 15,
              }}
            >
              <TouchableOpacity
                onPress={openProfile}
                style={{ marginRight: 15 }}
              >
                <Image
                  source={
                    profileAvatar
                      ? { uri: profileAvatar }
                      : require("../assets/images/profile.png")
                  }
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "#ffffffff",
                    borderWidth: 0.5,
                    borderColor: "#d4d4d4ff",
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout}>
                <Entypo name="log-out" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      <Stack.Screen
        name="chat/[recipientId]"
        options={{
          title: "Chat",
          headerStyle: { backgroundColor: "#18b969ff" },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="otp" options={{ headerShown: false }} />
      <Stack.Screen
        name="updateprofile"
        options={{
          title: "Update Profile",
          headerStyle: { backgroundColor: "#18b969ff" },
          headerTitleStyle: {
            fontSize: 22,
            fontWeight: "bold",
            color: "#fff",
          },
        }}
      />
      <Stack.Screen
        name="reset-password/[token]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
