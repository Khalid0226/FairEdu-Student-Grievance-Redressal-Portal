'use client';
import { useState } from 'react';
import ChatInterface from '@/components/shared/ChatInterface';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentChat({ conversations: initialConversations }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { user } = useAuth();

  const handleSendMessage = (messageText) => {
    if (!selectedConversation) return;

    const newMessage = {
      id: Date.now(),
      sender: user.role,
      text: messageText,
      timestamp: new Date().toISOString()
    };

    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id
        ? { ...conv, messages: [...conv.messages, newMessage] }
        : conv
    ));

    setSelectedConversation(prev => 
      prev ? { ...prev, messages: [...prev.messages, newMessage] } : null
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Conversations List */}
      <div className="lg:col-span-1">
        <div className="card">
          <h3 className="font-semibold text-black dark:text-white mb-4">Conversations</h3>
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full text-left p-3 rounded-lg border transition-colors duration-200 ${
                  selectedConversation?.id === conversation.id
                    ? 'border-primary-orange-500 bg-orange-50 dark:bg-orange-900'
                    : 'border-gray-200 dark:border-gray-800 hover:border-primary-orange-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-black dark:text-white">
                      {conversation.with}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  {conversation.unread && (
                    <div className="w-2 h-2 bg-primary-orange-500 rounded-full"></div>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {conversation.timestamp}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="lg:col-span-2">
        <ChatInterface
          conversation={selectedConversation}
          onSendMessage={handleSendMessage}
          currentUser={user}
        />
      </div>
    </div>
  );
}