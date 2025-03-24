import React, { useState, useEffect } from "react";
import PubNub from "pubnub";
import { PubNubProvider, usePubNub } from "pubnub-react";

const pubnub = new PubNub({
  publishKey: "pub-c-2155660e-2e29-418f-b9c6-5f7008376641",
  subscribeKey: "sub-c-5d6d7634-65b1-401b-b8d6-57adb7a2be19",
  uuid: "user-" + Math.random().toString(36).substr(2, 9), // Unique user ID
});
const Chat = () => {
  const pubnub = usePubNub();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username] = useState(pubnub.getUUID()); // User-1 or User-2
  const channel = "chat-channel";

  useEffect(() => {
    pubnub.subscribe({ channels: [channel] });

    pubnub.addListener({
      message: (msgEvent) => {
        setMessages((prev) => {
          const newMsg = msgEvent.message;
          return prev.some((msg) => msg.id === newMsg.id) ? prev : [...prev, newMsg]; // Prevent duplicates
        });
      },
    });

    return () => {
      pubnub.unsubscribeAll();
    };
  }, [pubnub]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const messageObject = { id: Date.now(), user: username, text: input };
    pubnub.publish({ channel, message: messageObject });

    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div style={styles.container}>
      <h2>Sammy Chat App</h2>
      <p>You are <b>{username}</b></p>

      <div style={styles.chatBox}>
        {messages.map((msg) => (
          <div key={msg.id} style={msg.user === username ? styles.myMessage : styles.otherMessage}>
            <b>{msg.user}: </b>{msg.text}
          </div>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown} // Handle "Enter" key
        placeholder="Type a message..."
        style={styles.input}
      />
      <button onClick={sendMessage} style={styles.button}>Send</button>
    </div>
  );
};

export default function App() {
  return (
    <PubNubProvider client={pubnub}>
      <Chat />
    </PubNubProvider>
  );
}

const styles = {
  container: { textAlign: "center", padding: "20px", fontFamily: "Arial, sans-serif" },
  chatBox: { 
    border: "1px solid #ddd", 
    padding: "10px", 
    minHeight: "200px", 
    maxWidth: "400px", 
    margin: "10px auto", 
    backgroundColor: "#f9f9f9", 
    overflowY: "auto"
  },
  myMessage: { textAlign: "right", padding: "5px", background: "#d1ffd1", borderRadius: "5px", margin: "5px 0" },
  otherMessage: { textAlign: "left", padding: "5px", background: "#f1f1f1", borderRadius: "5px", margin: "5px 0" },
  input: { padding: "10px", width: "80%", marginTop: "10px" },
  button: { padding: "10px 15px", marginLeft: "10px", cursor: "pointer" }
};