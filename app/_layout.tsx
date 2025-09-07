import { Stack, router } from "expo-router";
import { Image, TouchableOpacity, ActionSheetIOS, Platform, Alert } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";

export default function RootLayout() {
  const openMenu = () => {
    if (Platform.OS === "ios") {
      // ✅ iOS native ActionSheet
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Update Profile", "Logout", "Cancel"],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2,
          title: "Profile",
        },
        (buttonIndex) => {
          if (buttonIndex === 0) router.push("/updateprofile");
          if (buttonIndex === 1) router.replace("/login");
        }
      );
    } else {
      Alert.alert("Profile", "Choose an option", [
        {
          text: "Update Profile",
          onPress: () => router.push("/updateprofile"),
        },
        {
          text: "Logout",
          onPress: () => router.replace("/login"),
          style: "destructive",
        },
      ]);
    }
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#18b969ff" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Home",
          headerLeft: () => (
            <Image
              source={require("../assets/images/icon.png")}
              style={{ width: 36, height: 36, marginLeft: 15 }}
              resizeMode="contain"
            />
          ),
          headerRight: () => (
            <TouchableOpacity onPress={openMenu} style={{ marginRight: 15 }}>
              <Entypo name="dots-three-vertical" size={22} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <Stack.Screen name="+not-found" options={{ headerShown: false }} />

      <Stack.Screen
        name="details"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="chat"
        options={{
          title: "Chat",
          headerStyle: { backgroundColor: "#18b969ff" },
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

      <Stack.Screen name="reset-password/[token]" options={{ headerShown: false }} />
    </Stack>
  );
}
