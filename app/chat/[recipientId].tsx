import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import io, { Socket } from "socket.io-client";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Message {
  _id?: string;
  text: string;
  sender: string;
  receiver?: string;
  delivered?: boolean;
  read?: boolean;
  createdAt?: string;
}

export default function ChatScreen() {
  const { recipientId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const API_URL = process.env.EXPO_PUBLIC_API_URL!;

  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.id);

      const socket = io(API_URL, { auth: { token } });
      socketRef.current = socket;

      socket.on("connect", () => console.log("✅ Connected to chat server"));

      socket.emit("messages:get", { to: recipientId });

      socket.on("messages:list", ({ to, messages }) => {
        if (to === recipientId) {
          setMessages(messages);
          setLoading(false);
        }
      });

      socket.on("message:new", (message: Message) => {
        if (
          message.sender === recipientId ||
          message.receiver === recipientId ||
          message.sender === userId
        ) {
          setMessages((prev) => [...prev, message]);
        }
      });

      socket.on("typing:start", ({ from }) => {
        if (from === recipientId) setIsTyping(true);
      });

      socket.on("typing:stop", ({ from }) => {
        if (from === recipientId) setIsTyping(false);
      });
    };

    init();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [recipientId]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !socketRef.current || !userId) return;

    socketRef.current.emit("message:send", {
      to: recipientId,
      text: input,
    });

    setInput("");
    socketRef.current.emit("typing:stop", { to: recipientId });
  };

  const handleTyping = (text: string) => {
    setInput(text);
    if (!socketRef.current) return;

    if (text.length > 0) {
      socketRef.current.emit("typing:start", { to: recipientId });
    } else {
      socketRef.current.emit("typing:stop", { to: recipientId });
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    if (!userId) return null;

    const isIncoming = item.receiver?.toString() === userId;

    return (
      <View
        style={[
          styles.messageBubble,
          isIncoming ? styles.otherMessage : styles.myMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        {!isIncoming && item.read && (
          <Text style={styles.readText}>✓✓</Text>
        )}
      </View>
    );
  };

  if (loading || !userId) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#18b969ff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        ref={flatListRef}
        data={[...messages].reverse()}
        renderItem={renderItem}
        keyExtractor={(item, index) => item._id || index.toString()}
        contentContainerStyle={{ padding: 10 }}
        inverted
      />

      {isTyping && <Text style={styles.typingIndicator}>Typing...</Text>}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={input}
          onChangeText={handleTyping}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  messageBubble: {
    padding: 12,
    borderRadius: 15,
    marginVertical: 5,
    maxWidth: "75%",
  },
  myMessage: {
    backgroundColor: "#18b969ff",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  otherMessage: {
    backgroundColor: "#e5e7eb",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  messageText: { fontSize: 16, color: "#000" },
  readText: {
    fontSize: 10,
    color: "#333",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    backgroundColor: "#fff",
    marginBottom: 40,
    paddingBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  sendButton: {
    backgroundColor: "#18b969ff",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    borderRadius: 20,
  },
  sendText: { color: "#fff", fontWeight: "600" },
  typingIndicator: {
    paddingHorizontal: 15,
    paddingBottom: 5,
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
});
