import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Hello 👋", sender: "other" },
    { id: "2", text: "Hi! How are you?", sender: "me" },
    { id: "3", text: "Hello 👋", sender: "other" },
    { id: "4", text: "Hi! 4 How are you?", sender: "me" },
    { id: "5", text: "Hello 👋", sender: "other" },
    { id: "6", text: "Hi! How are you?", sender: "me" },
    { id: "7", text: "Hello 👋", sender: "other" },
    { id: "8", text: "Hi! 8 How are you?", sender: "me" },
    { id: "9", text: "Hello 👋", sender: "other" },
    { id: "10", text: "Hi! How are you?", sender: "me" },
    { id: "11", text: "Hello 👋", sender: "other" },
    { id: "12", text: "Hi! 9 How are you?", sender: "me" },
    { id: "13", text: "Hello 👋", sender: "other" },
    { id: "14", text: "Hi! Sohit?", sender: "me" },
    { id: "15", text: "Hi! How are you?", sender: "me" },
    { id: "16", text: "Hello 👋", sender: "other" },
    { id: "17", text: "Hi! 9 How are you?", sender: "me" },
    { id: "18", text: "Hello 👋", sender: "other" },
    { id: "19", text: "Hi! Sohit?", sender: "me" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "me",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: "Got it 👍", sender: "other" },
      ]);
    }, 1000);
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === "me" ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatContainer}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  chatContainer: {
    padding: 10,
  },
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
  messageText: {
    fontSize: 16,
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    marginBottom: 48,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#18b969ff",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    borderRadius: 20,
  },
  sendText: {
    color: "#fff",
    fontWeight: "600",
  },
});
