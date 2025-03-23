import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { getChatHistory, sendChatMessage } from '../services/api';
import '../styles/Chat.css';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Check authentication first
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      console.log("Found authentication token");
    } else {
      console.warn("No authentication token found");
    }
    setLoading(false);
  }, []);

  // Fetch messages when component mounts
  useEffect(() => {
    // We'll fetch messages regardless of authentication for testing
    // if (!isAuthenticated) return;

    const fetchMessages = async () => {
      try {
        const data = await getChatHistory();
        setMessages(data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setError("Failed to load chat history. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, []);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;
    
    // Clear any previous errors
    setError(null);
    
    try {
      setSendingMessage(true);
      
      // Add user message to state
      const userMessage = {
        id: `user-${Date.now()}`,
        content: newMessage,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setNewMessage('');
      
      // Add a temporary "thinking" message
      const thinkingId = `thinking-${Date.now()}`;
      setMessages(prevMessages => [
        ...prevMessages, 
        {
          id: thinkingId,
          content: "Thinking...",
          sender: 'system',
          timestamp: new Date().toISOString(),
          isThinking: true
        }
      ]);
      
      // Send to backend and get response
      const botResponse = await sendChatMessage(newMessage);
      
      // Remove thinking message and add actual response
      setMessages(prevMessages => {
        const filteredMessages = prevMessages.filter(msg => msg.id !== thinkingId);
        return [
          ...filteredMessages,
          {
            id: `bot-${Date.now()}`,
            ...botResponse
          }
        ];
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      
      // Remove thinking message if it exists
      setMessages(prevMessages => {
        const filteredMessages = prevMessages.filter(msg => !msg.isThinking);
        return [
          ...filteredMessages,
          {
            id: `error-${Date.now()}`,
            content: "Sorry, there was an error processing your request. Please try again.",
            sender: 'system',
            timestamp: new Date().toISOString()
          }
        ];
      });
      
      // Display authentication error if that's the issue
      if (error.message && error.message.includes("401")) {
        setError("Authentication failed. Please log in again.");
      } else {
        setError("Failed to send message. Please try again.");
      }
    } finally {
      setSendingMessage(false);
    }
  };
  
  if (loading) {
    return <div className="loading-spinner">Loading chat...</div>;
  }

  // For testing, we'll show the chat even without authentication
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" />;
  // }
  
  return (
    <div className="chat-container">
      <div className="flex flex-col justify-center items-center bg-gray-100">
        {/* Introduction Section */}
        <section className="w-full max-w-4xl text-center mb-12 p-6 bg-green-50 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-green-600 mb-4">Welcome to FarmSphere.AI</h2>
          <p className="text-lg text-gray-700">
            FarmSphere.AI is your trusted farming assistant, providing solutions tailored for modern agriculture. Ask us anything, and we'll help you make informed decisions for your farm.
          </p>
          
          {/* Auth status indicator for debugging */}
          <div className="mt-2 text-sm">
            <span className={`inline-block px-2 py-1 rounded ${isAuthenticated ? 'bg-green-200' : 'bg-red-200'}`}>
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </div>
          
          {/* Error message display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              {error}
            </div>
          )}
        </section>

        {/* Chatbox Section */}
        <section className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-green-600 mb-4">Ask Your Farming Questions</h3>
          
          {/* Chat messages */}
          <div className="chat-messages mb-4 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No messages yet. Start by asking a question about farming or plant varieties.
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`message ${msg.sender}-message my-2 p-3 rounded-lg ${
                    msg.sender === 'user' ? 'bg-green-100 ml-auto' : 
                    msg.sender === 'bot' ? 'bg-white border border-green-200' : 
                    msg.isThinking ? 'bg-yellow-50 border border-yellow-200 text-yellow-700' :
                    'bg-red-100'
                  } max-w-3/4`}
                >
                  <p>{msg.content}</p>
                  <small className="text-xs text-gray-500 mt-1 block">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </small>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form id="query-form" className="space-y-4" onSubmit={handleSendMessage}>
            <textarea 
              id="message" 
              name="message" 
              className="w-full p-4 border-2 border-gray-300 rounded-lg shadow-sm text-lg" 
              placeholder="Type your farming question here..." 
              required 
              rows="3"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sendingMessage}
            />
            <button 
              type="submit" 
              id="askAI"
              className={`w-full py-3 rounded-lg text-lg font-semibold transition ${
                sendingMessage 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              disabled={sendingMessage}
            >
              {sendingMessage ? 'Sending...' : 'Ask'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Chat;