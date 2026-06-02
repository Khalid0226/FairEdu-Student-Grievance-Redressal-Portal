'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { FaSearch, FaPaperPlane, FaEllipsisV, FaPaperclip, FaSmile, FaFileAlt } from 'react-icons/fa';
import axios from 'axios';
import Linkify from 'react-linkify';
import { useSearchParams } from 'next/navigation';

function CollegeMessagesContent() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const searchParams = useSearchParams();
  const targetId = searchParams.get('id'); // URL se ?id=... uthayega

  // --- 0. Helper to Format Time ---
  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return "";
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) {
        return typeof timeStr === 'string' && timeStr.includes('M') ? timeStr : "";
      }
      return date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true,
        timeZone: 'Asia/Kolkata' 
      });
    } catch (e) {
      return "";
    }
  };

  // --- 1. Fetch Chat List ---
  const fetchChatList = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://127.0.0.1:8000/api/college/chat-list/', {
        headers: { Authorization: `Token ${token}` }
      });
      const fetchedChats = res.data.chats || [];
      setChats(fetchedChats);

      // 🔥 FIXED: Selection Logic - Priority to URL ID
      if (fetchedChats.length > 0) {
        if (targetId) {
          const found = fetchedChats.find(c => 
            String(c.id) === String(targetId) || c.email === targetId
          );
          setActiveChat(found || fetchedChats[0]);
        } else if (!activeChat) {
          setActiveChat(fetchedChats[0]);
        }
      }
    } catch (err) {
      console.error("Chat list error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Fetch Messages ---
  const fetchMessages = async (chat) => {
    if (!chat) return;
    try {
      const token = localStorage.getItem('token');
      const identifier = chat.id; 
      const res = await axios.get(`http://127.0.0.1:8000/api/college/messages/${identifier}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setMessages(res.data.messages);
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  };

  // Run on mount and whenever URL ID changes
  useEffect(() => {
    fetchChatList();
  }, [targetId]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
      const interval = setInterval(() => fetchMessages(activeChat), 5000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- 3. Send Message Logic ---
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('receiver_email', activeChat.email);
      formData.append('receiver_type', activeChat.type);
      formData.append('text', newMessage);

      const res = await axios.post('http://127.0.0.1:8000/api/college/send-message/', formData, {
        headers: { 
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.status === 'success') {
        const myNewMsg = {
          id: Date.now(),
          sender: 'official',
          text: newMessage,
          time_formatted: new Date().toISOString(), 
          is_mine: true
        };
        setMessages(prev => [...prev, myNewMsg]);
        setNewMessage('');
      }
    } catch (err) {
      console.error("Send error:", err);
      alert("Failed to send message");
    }
  };

  // --- 4. File Upload Logic ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('receiver_email', activeChat.email);
    formData.append('receiver_type', activeChat.type);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://127.0.0.1:8000/api/college/send-message/', formData, {
        headers: { 
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.status === 'success') {
        fetchMessages(activeChat); 
      }
    } catch (err) {
      console.error("File upload error:", err);
      alert("Failed to upload file");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getAvatarColor = (type) => {
    if (type === 'university') return 'bg-blue-500';
    if (type === 'student') return 'bg-green-500';
    return 'bg-purple-500';
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center">Loading Chats...</div>;

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-black dark:text-white">Messages</h2>
          <div className="relative mt-3">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`flex items-center space-x-3 p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors ${
                activeChat?.id === chat.id ? 'bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(chat.type)}`}>
                {chat.avatar || chat.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-black dark:text-white truncate">{chat.name}</h3>
                  <span className="text-xs text-gray-500">{formatDisplayTime(chat.time || chat.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{chat.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(activeChat.type)}`}>
                  {activeChat.avatar || activeChat.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-black dark:text-white">{activeChat.name}</h3>
                  <p className="text-sm text-gray-500">{activeChat.type === 'university' ? 'University Admin' : 'Student'}</p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600"><FaEllipsisV /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                    message.is_mine ? 'bg-orange-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-bl-none'
                  }`}>
                    {message.file_url ? (
                      <a href={message.file_url} target="_blank" rel="noreferrer" className="flex items-center space-x-2 hover:underline">
                        <FaFileAlt /> <span>📎 View Attachment</span>
                      </a>
                    ) : (
                      <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
                        <a href={decoratedHref} key={key} target="_blank" rel="noopener noreferrer" className={`underline font-bold ${message.is_mine ? 'text-white' : 'text-blue-500'}`}>
                          {decoratedText}
                        </a>
                      )}>
                        <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
                      </Linkify>
                    )}
                    <p className={`text-[10px] mt-1 opacity-70 ${message.is_mine ? 'text-right' : 'text-left'}`}>
                      {formatDisplayTime(message.time_formatted || message.timestamp || message.time)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                <button onClick={() => fileInputRef.current.click()} className="p-2 text-gray-400 hover:text-gray-600"><FaPaperclip /></button>
                <button className="p-2 text-gray-400 hover:text-gray-600"><FaSmile /></button>
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">Select a conversation to start chatting</div>
        )}
      </div>
    </div>
  );
}

// 📦 Wrapper for Next.js Suspense (Required when using useSearchParams)
export default function CollegeMessages() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <CollegeMessagesContent />
    </Suspense>
  );
}