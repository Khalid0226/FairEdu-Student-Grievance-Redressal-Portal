'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation'; // 🆕 URL params ke liye added
import Link from 'next/link';
import { io } from 'socket.io-client';
import Linkify from 'react-linkify'; 

const SOCKET_SERVER_URL = "http://localhost:4000";
const DJANGO_API_BASE = "http://localhost:8000/api/student"; 

export default function StudentMessages() {
  const searchParams = useSearchParams(); // 🆕 Search params hook
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const [conversations, setConversations] = useState([]);

  // --- NEW: Time Formatter Function ---
  const formatTime = (timeStr) => {
    if (!timeStr || timeStr === "Just now") return timeStr;
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr; 
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return timeStr;
    }
  };

  // 1️⃣ Fetch Profile & Set Direct Channels
  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${DJANGO_API_BASE}/profile/`, {
          headers: { 
            'Authorization': `Token ${token}`,
            'Accept': 'application/json'
          }
        });

        const data = await res.json();

        if (res.ok && data.status === 'success') {
          const p = data.profile;
          const initialConversations = [
            {
              id: 'college', 
              with: p.college || "College Authority",
              role: 'College Level',
              status: 'Online',
              lastMessage: 'Direct chat enabled',
              messages: [] 
            },
            {
              id: 'university',
              with: p.university || "University Grievance Cell",
              role: 'University Level',
              status: 'Secure',
              lastMessage: 'Official channel',
              messages: []
            }
          ];
          setConversations(initialConversations);

          // 🆕 Redirect Logic: Agar URL mein ?selected= hai toh wo chat auto-open hogi
          const selectedId = searchParams.get('selected');
          if (selectedId) {
            const autoSelect = initialConversations.find(c => c.id === selectedId);
            if (autoSelect) setSelectedChat(autoSelect);
          }
        }
      } catch (err) {
        console.error("Profile fetch failed:", err);
      }
    };

    fetchStudentProfile();
  }, [searchParams]); // 🆕 dependency mein searchParams add kiya

  // 2️⃣ Socket Initialization
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    newSocket.on("receive_message", (data) => {
      handleIncomingMessage(data);
    });

    newSocket.on("display_typing", (data) => {
      if (data.sender !== 'student' && data.chatId === selectedChat?.id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    return () => newSocket.close();
  }, [selectedChat?.id]);

  useEffect(() => {
    if (selectedChat?.id && socket) {
      socket.emit("join_chat", selectedChat.id);
    }
  }, [selectedChat?.id, socket]);

  // 3️⃣ Fetch History
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!selectedChat?.id) return;
      
      try {
        const token = localStorage.getItem('token'); 
        if (!token) return;

        const res = await fetch(`${DJANGO_API_BASE}/messages/${selectedChat.id}/`, {
          headers: { 'Authorization': `Token ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          const history = Array.isArray(data) ? data : (data.messages || []);
          
          setConversations(prev => prev.map(c => 
            c.id === selectedChat.id ? { ...c, messages: history } : c
          ));
          setSelectedChat(prev => (prev?.id === selectedChat.id ? { ...prev, messages: history } : prev));
        }
      } catch (err) {
        console.log("History fetch failed...");
      }
    };

    fetchChatHistory();
  }, [selectedChat?.id]);

  // 4️⃣ Handle Incoming Messages
  const handleIncomingMessage = (data) => {
    const chatId = data.receiver_type || data.chatId;
    
    const formattedMsg = {
      ...data,
      is_mine: data.is_mine || data.sender === 'student' || data.sender_type === 'student'
    };

    setConversations(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return { 
          ...chat, 
          messages: [...(chat.messages || []), formattedMsg],
          lastMessage: data.is_file ? "📎 Attachment" : (data.text || "New Message")
        };
      }
      return chat;
    }));

    setSelectedChat(prev => {
        if (prev && prev.id === chatId) {
            return { ...prev, messages: [...(prev.messages || []), formattedMsg] };
        }
        return prev;
    });
  };

  // 5️⃣ File Upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat) return;

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const formData = new FormData();
    formData.append('receiver_type', selectedChat.id);
    formData.append('file', file);
    formData.append('text', file.name);
    if(user.email) formData.append('sender_email', user.email);

    try {
      const res = await fetch(`${DJANGO_API_BASE}/messages/send/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Token ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        const messageData = {
          chatId: selectedChat.id,
          sender: 'student',
          sender_type: 'student',
          text: file.name,
          file: data.file_url, 
          is_file: true,
          time: data.time || new Date().toISOString(),
          is_mine: true
        };
        
        if (socket) socket.emit("send_message", messageData);
        handleIncomingMessage(messageData);
      }
    } catch (err) {
      console.error("File upload failed");
    }
  };

  // 6️⃣ Send Text Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tempText = newMessage;
    setNewMessage(""); 

    try {
      const res = await fetch(`${DJANGO_API_BASE}/messages/send/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          receiver_type: selectedChat.id,
          text: tempText,
          sender_email: user.email 
        })
      });

      if (res.ok) {
        const data = await res.json();
        const messageData = {
          chatId: selectedChat.id,
          sender: 'student',
          sender_type: 'student',
          text: tempText,
          time: data.time || new Date().toISOString(),
          is_file: false,
          is_mine: true
        };

        if (socket) socket.emit("send_message", messageData);
        handleIncomingMessage(messageData);
      }
    } catch (err) {
      console.error("Message send failed");
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChat?.messages, isTyping]);

  return (
    <div className="flex h-[85vh] gap-6 p-4 bg-[#f8fafc]">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 pb-4">
            <h1 className="text-2xl font-black text-gray-900 italic tracking-tight uppercase">Support</h1>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">Direct Authority Line</p>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {conversations.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`w-full p-6 rounded-[2rem] transition-all text-left border ${
                selectedChat?.id === chat.id ? 'bg-orange-50 border-orange-100 shadow-sm' : 'bg-white border-transparent hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-[9px] font-black uppercase tracking-widest ${selectedChat?.id === chat.id ? 'text-orange-600' : 'text-gray-400'}`}>
                  {chat.role}
                </span>
                <span className="text-[8px] text-gray-400 font-bold">{formatTime(chat.messages?.[chat.messages.length - 1]?.time)}</span>
              </div>
              <h3 className="font-bold text-gray-800 text-sm truncate mt-1">{chat.with}</h3>
              <p className="text-[11px] text-gray-400 italic line-clamp-1 mt-1">"{chat.lastMessage}"</p>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CHAT */}
      <div className="hidden md:flex flex-1 flex-col bg-white rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
        {selectedChat ? (
          <>
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center font-black text-xl italic">
                  {selectedChat.with.charAt(0)}
                </div>
                <div>
                  <h2 className="font-black text-gray-900 tracking-tight leading-none uppercase">{selectedChat.with}</h2>
                  <div className="text-[10px] font-bold text-gray-400 uppercase mt-2 tracking-widest flex items-center gap-2">
                    {isTyping ? <span className="text-orange-500 italic animate-pulse">Official is typing...</span> : `Secure Connection • ${selectedChat.status}`}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-6 bg-gray-50/30 scrollbar-hide">
              {(selectedChat.messages || []).map((msg, index) => {
                const isMine = msg.is_mine || msg.sender === 'student' || msg.sender_type === 'student';

                return (
                  <div key={index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-6 py-4 rounded-[2rem] text-[13px] font-medium shadow-sm max-w-[70%] ${
                      isMine ? 'bg-black text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    }`}>
                      <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
                        <a href={decoratedHref} key={key} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline font-bold">
                          {decoratedText}
                        </a>
                      )}>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                      </Linkify>

                      {msg.file && (
                         <a 
                          href={msg.file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`block mt-2 pt-2 border-t text-[10px] underline font-bold uppercase ${isMine ? 'border-white/10 text-orange-400' : 'border-black/5 text-orange-500'}`}
                         >
                          📎 View Attachment
                         </a>
                      )}
                      <div className="text-[8px] mt-2 font-bold opacity-30 text-right uppercase tracking-tighter">
                        {formatTime(msg.time)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            <div className="p-8 bg-white">
              <form onSubmit={handleSendMessage} className="bg-gray-100 p-2 rounded-full flex items-center gap-2 border border-transparent focus-within:border-orange-200">
                <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-12 h-12 bg-white rounded-full font-bold shadow-sm hover:scale-105 active:scale-90 transition-all text-xl text-gray-400">+</button>
                <input
                  className="flex-1 bg-transparent px-4 outline-none text-sm font-medium"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    if (socket) socket.emit("typing", { chatId: selectedChat.id, sender: 'student' });
                  }}
                  placeholder="Send a secure message to authority..."
                />
                <button type="submit" className="bg-orange-500 text-white px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Send</button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20 grayscale">
            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Select Channel</h3>
          </div>
        )}
      </div>
    </div>
  );
}