import { Link, router, useFocusEffect } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, isToday, isYesterday } from "date-fns";
import Entypo from "@expo/vector-icons/Entypo";

interface User {
  conversationId: string;
  _id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
}

export default function HomeScreen() {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/conversations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
      router.replace("/login");
    }
  };

  // 👇 This will refetch every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  function formatChatTimestamp(timestamp?: string | number | Date): string {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, "h:mm aaaa")
        .toLowerCase()
        .replace("am", "a.m.")
        .replace("pm", "p.m.");
    }
    if (isYesterday(date)) {
      return "Yesterday";
    }
    return format(date, "M/d/yyyy");
  }

  const renderItem = ({ item }: { item: User }) => (
    <Link
      href={{
        pathname: "/chat/[recipientId]",
        params: { recipientId: item._id, recipientName: item.name },
      }}
      asChild
    >
      <TouchableOpacity style={styles.userItem}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{item.name[0]}</Text>
          </View>
        )}

        <View style={styles.userInfo}>
          <View style={styles.nameTimeRow}>
            <Text style={styles.username}>{item.name}</Text>
            <Text style={styles.timestamp}>
              {formatChatTimestamp(item.timestamp)}
            </Text>
          </View>

          <View style={styles.messageRow}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage}
            </Text>
            {item.unreadCount ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.container}>
      {users.length === 0 ? (
        <View style={styles.noUsersContainer}>
          <Text style={styles.noUsersText}>No Contacts</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          keyboardShouldPersistTaps="handled"
        />
      )}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/contact")}
      >
        <Entypo name="chat" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#292929ff",
    paddingBottom: 50,
  },
  listContainer: {
    paddingHorizontal: 0,
    paddingTop: 10,
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#424242ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarInitial: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  nameTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  timestamp: {
    fontSize: 12,
    color: "#18b969ff",
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: "#aaa",
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: "#128C7E",
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  noUsersContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noUsersText: {
    color: "#aaa",
    fontSize: 18,
  },
  floatingButton: {
    position: "absolute",
    bottom: 100,
    right: 40,
    backgroundColor: "#18b969ff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
