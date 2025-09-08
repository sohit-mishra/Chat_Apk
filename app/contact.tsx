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

interface User {
  _id: string;
  name: string;
  avatar?: string;
}

export default function ContactScreen() {
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
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers(response.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
        router.replace("/login");
      }
    };

    fetchUsers();
  }, []);

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

        <Text style={styles.username}>{item.name}</Text>
      </TouchableOpacity>
    </Link>
  );

  if (users.length === 0) {
    return (
      <View style={styles.containerEmpty}>
        <Text style={styles.noContactsText}>No Contacts</Text>
      </View>
    );
  }

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
  containerEmpty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#292929ff",
  },
  noContactsText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
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
  username: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
});
