import { Link, router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, isToday, isYesterday } from "date-fns";

interface User {
  _id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
}

export default function HomeScreen() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/users`,
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
    fetchUsers();
  }, []);

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
            {item.unreadCount && item.unreadCount > 0 ? (
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
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        keyboardShouldPersistTaps="handled"
      />
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
    paddingBottom: 20, // spacing so last item isn't cut off
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
});
