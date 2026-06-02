'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { 
  FaSearch, 
  FaPaperPlane, 
  FaEllipsisV, 
  FaPaperclip, 
  FaSmile,
  FaUniversity,
  FaUserGraduate,
  FaExclamationTriangle,
  FaCheckCircle,
  FaFileAlt,
  FaDownload
} from 'react-icons/fa';

const categories = ['All', 'College', 'Student', 'Urgent'];

export default function UniversityMessages() {
  const searchParams = useSearchParams();
  // Hum 'target_email' check karenge navigation ke liye
  const targetEmailQuery = searchParams.get('target_email');

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // 1. Fetch Conversations with Duplicate Removal
  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/university/conversations/', {
        headers: { Authorization: `Token ${token}` }
      });
      
      const combinedChats = [
        ...(response.data.colleges || []), 
        ...(response.data.students || [])
      ];

      // 🛠️ FILTER DUPLICATES
      const uniqueChats = combinedChats.reduce((acc, current) => {
        const x = acc.find(item => item.email === current.email);
        if (!x) {
          return acc.concat([current]);
        } else {
          if (current.name && !x.name) {
            return acc.map(item => item.email === current.email ? current : item);
          }
          return acc;
        }
      }, []);

      setChats(uniqueChats);
      
      // Auto-select logic based on query param
      if (uniqueChats.length > 0) {
        if (targetEmailQuery) {
          const target = uniqueChats.find(c => c.email?.toLowerCase() === targetEmailQuery.toLowerCase());
          if (target) {
            setActiveChat(target);
          } else if (!activeChat) {
            setActiveChat(uniqueChats[0]);
          }
        } else if (!activeChat) {
          setActiveChat(uniqueChats[0]);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching chats:", error);
      setLoading(false);
    }
  };

  // 2. Fetch Messages for Active Chat
  const fetchMessages = async (chat) => {
    if (!chat || !chat.email) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://127.0.0.1:8000/api/university/messages/?target_email=${chat.email}`, {
        headers: { Authorization: `Token ${token}` }
      });
      
      const data = response.data.messages || response.data;
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [targetEmailQuery]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
      const interval = setInterval(() => fetchMessages(activeChat), 4000); 
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Send Message or File
  const handleSendMessage = async (file = null) => {
    if (!newMessage.trim() && !file) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('receiver_email', activeChat.email);
      
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('text', newMessage);
      }

      await axios.post('http://127.0.0.1:8000/api/university/send-message/', formData, {
        headers: { 
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setNewMessage('');
      fetchMessages(activeChat); 
    } catch (error) {
      console.error("Send Error:", error);
      alert("Message nahi bheja ja saka.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleSendMessage(file);
  };

  const filteredChats = chats.filter(chat =>
    (chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) || chat.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategory === 'All' || 
      (selectedCategory === 'Urgent' ? chat.urgent : chat.type?.toLowerCase() === selectedCategory.toLowerCase()))
  );

  const getAvatarColor = (type) => type === 'college' ? 'bg-blue-500' : 'bg-green-500';

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-lg border border-orange-200 shadow-sm">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-orange-200 flex flex-col">
        <div className="p-4 border-b border-orange-200 bg-white rounded-tl-lg">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          <div className="flex space-x-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all ${
                  selectedCategory === cat ? 'bg-orange-500 text-white shadow-md' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative mt-3">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-orange-200 rounded-lg bg-orange-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.length > 0 ? filteredChats.map((chat) => (
            <div
              key={chat.email}
              onClick={() => setActiveChat(chat)}
              className={`flex items-center space-x-3 p-4 border-b border-orange-50 cursor-pointer transition-colors ${
                activeChat?.email === chat.email ? 'bg-orange-500 text-white' : 'hover:bg-orange-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold shadow-inner ${getAvatarColor(chat.type)}`}>
                {chat.name ? chat.name[0].toUpperCase() : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold truncate">{chat.name || chat.email}</h3>
                  <span className={`text-[10px] ${activeChat?.email === chat.email ? 'text-orange-100' : 'text-gray-400'}`}>
                    {chat.time}
                  </span>
                </div>
                <p className={`text-sm truncate ${activeChat?.email === chat.email ? 'text-orange-50' : 'text-gray-500'}`}>
                  {chat.last_message || "No messages yet"}
                </p>
              </div>
            </div>
          )) : (
            <div className="p-10 text-center text-gray-400 text-sm">No chats found</div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-orange-50 rounded-tr-lg rounded-br-lg">
        {activeChat ? (
          <>
            <div className="flex items-center justify-between p-4 border-b border-orange-200 bg-white shadow-sm">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${getAvatarColor(activeChat.type)}`}>
                  {activeChat.name ? activeChat.name[0].toUpperCase() : '?'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{activeChat.name || "User"}</h3>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">
                    {activeChat.type} • {activeChat.email}
                  </p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-orange-500 p-2"><FaEllipsisV /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? messages.map((msg, index) => (
                <div key={msg.id || index} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 shadow-sm rounded-2xl ${
                    msg.is_mine 
                      ? 'bg-orange-500 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-orange-100 rounded-bl-none'
                  }`}>
                    {msg.is_file || msg.file ? (
                      <div className="flex items-center space-x-3 p-1">
                        <FaFileAlt className={`text-2xl ${msg.is_mine ? 'text-orange-100' : 'text-orange-500'}`} />
                        <div className="flex-1 truncate">
                          <p className="text-sm font-semibold">Attachment</p>
                          <a 
                            href={msg.file.startsWith('http') ? msg.file : `http://127.0.0.1:8000${msg.file}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`text-xs underline flex items-center ${msg.is_mine ? 'text-white' : 'text-blue-600'}`}
                          >
                            <FaDownload className="mr-1" /> View / Download
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.text || msg.message || msg.content}</p>
                    )}
                    <p className={`text-[9px] mt-1 text-right font-medium opacity-70`}>
                      {msg.time || msg.timestamp}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <div className="bg-orange-200 p-4 rounded-full mb-2"><FaSmile className="text-4xl text-orange-400" /></div>
                  <p className="text-sm">Start a new conversation</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-orange-200 bg-white rounded-br-lg">
              <div className="flex items-center space-x-3 bg-orange-50 p-2 rounded-xl border border-orange-100">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden />
                <button 
                  onClick={() => fileInputRef.current.click()} 
                  className="p-2 text-orange-400 hover:text-orange-600 transition-colors"
                  title="Attach File"
                >
                  <FaPaperclip size={20} />
                </button>
                
                <div className="flex-1">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Write your message here..."
                    className="w-full bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400 py-2"
                  />
                </div>
                
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!newMessage.trim()}
                  className={`p-3 rounded-lg transition-all shadow-md ${
                    newMessage.trim() 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-orange-50">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <FaUniversity className="text-3xl text-orange-300" />
            </div>
            <p className="font-medium text-gray-500">Welcome to University Chat</p>
            <p className="text-sm text-gray-400 mt-1 text-center max-w-xs px-6">
              Select a college or student from the list on the left to start communicating.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}