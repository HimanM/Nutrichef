import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';
import { HiOutlineChatAlt2, HiX, HiPaperAirplane, HiOutlinePhotograph, HiOutlineRefresh, HiOutlineClock } from 'react-icons/hi';

const FloatingChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const chatBodyRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatWindowRef = useRef(null);
  const inputRef = useRef(null);
  const auth = useAuth();
  const { isAuthenticated, currentUser, token, loading: authLoading } = auth;
  const [open, setOpen] = useState(false);

  const fetchInstance = useCallback(async (url, options) => {
    return authenticatedFetch(url, options, auth);
  }, [auth]);

  const initialGreeting = {
    id: Date.now(),
    text: "Hello! I'm your NutriChef assistant. 🍽️ I can help you with:\n\n• **Nutrition information** for any food\n• **Recipe suggestions** based on ingredients\n• **Dietary advice** and meal planning\n• **Food classification** from images\n• **Ingredient substitutions**\n\nWhat would you like to know?",
    sender: 'bot',
    timestamp: new Date(),
  };

  useEffect(() => {
    if (open) {
      // Only add initial greeting if no messages exist
      if (messages.length === 0) {
        setMessages([initialGreeting]);
      }
      // Focus input when chat opens
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);
    } else {
      // Don't clear messages when closing, only clear input-related states
      setUserInput('');
      setSelectedImage(null);
      setImagePreviewUrl(null);
      setError('');
    }
  }, [open]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderFormattedText = (text) => {
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const boldRegex = /\*\*(.*?)\*\*/g;
    const listRegex = /^\s*•\s+(.*)/gm;

    let html = text
      .replace(linkRegex, '<a href="$2" class="text-emerald-600 hover:text-emerald-700 underline font-medium">$1</a>')
      .replace(boldRegex, '<strong class="font-semibold">$1</strong>')
      .replace(/\_(.*?)\_/g, '<em class="italic">$1</em>')
      .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em class="italic">$1</em>');

    if (listRegex.test(html)) {
      html = html.replace(listRegex, '<li class="ml-4 list-disc text-gray-700">$1</li>');
      html = `<ul class="space-y-1 mt-2">${html}</ul>`;
    }
    return { __html: html };
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB');
        return;
      }
      setSelectedImage(file);
      setImagePreviewUrl(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setImagePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!auth.isAuthenticated) {
      setMessages(prevMessages => [...prevMessages, { 
        id: Date.now(), 
        text: '🔐 Please login to use the chatbot. You can ask me about nutrition, recipes, and more once you\'re signed in!', 
        sender: 'bot', 
        timestamp: new Date() 
      }]);
      setUserInput('');
      setSelectedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!userInput.trim() && !selectedImage) return;

    setIsLoading(true);
    setError('');
    const currentInput = userInput;
    const currentImage = selectedImage;

    const userMessage = {
      id: Date.now(),
      text: currentInput,
      sender: 'user',
      timestamp: new Date(),
      imagePreview: imagePreviewUrl,
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setUserInput('');
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      const formData = new FormData();
      formData.append('text_query', currentInput);
      if (currentImage) {
        formData.append('image_file', currentImage);
      }

      const response = await fetchInstance('/api/chatbot/query', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `API request failed with status ${response.status}`);
      }
      
      const botMessage = {
        id: Date.now() + 1,
        text: responseData.response || "Sorry, I encountered an issue.",
        sender: 'bot',
        timestamp: new Date(),
        image_url: responseData.image_url || null,
        link_url: responseData.link_url || null,
        link_text: responseData.link_text || null,
        disambiguation_matches: responseData.disambiguation_matches || null,
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);

    } catch (err) {
      setError(err.message || 'An error occurred.');
      setMessages(prevMessages => [
        ...prevMessages,
        { id: Date.now() + 1, text: `❌ Error: ${err.message || 'Could not connect'}`, sender: 'bot', timestamp: new Date(), isError: true },
      ]);
    } finally {
      setIsLoading(false);
      setImagePreviewUrl(null);
    }
  };

  const handleDisambiguationChoiceClick = async (choiceText) => {
    setIsLoading(true);
    setError('');
    const userMessage = {
      id: Date.now(),
      text: `Selected: ${choiceText}`,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetchInstance('/api/chatbot/food_nutrition_direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ food_name: choiceText }),
      });
      
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `API request failed with status ${response.status}`);
      }

      const botMessage = {
        id: Date.now() + 1,
        text: responseData.response || "Sorry, I couldn't find information about that food.",
        sender: 'bot',
        timestamp: new Date(),
        image_url: responseData.image_url || null,
        link_url: responseData.link_url || null,
        link_text: responseData.link_text || null,
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (err) {
      setError(err.message || 'An error occurred.');
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, text: `❌ Error: ${err.message || 'Could not connect'}`, sender: 'bot', timestamp: new Date(), isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 transition-all duration-300 ease-out hover:scale-110 z-40 group
          
          /* Mobile positioning - bottom right, lower position */
          bottom-4 right-4 p-3
          sm:bottom-6 sm:right-6 sm:p-4
          
          /* Touch-friendly mobile sizing */
          touch-manipulation
          min-h-[56px] min-w-[56px]
          sm:min-h-[60px] sm:min-w-[60px]
        "
        aria-label="Open chatbot"
      >
        <HiOutlineChatAlt2 className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform duration-300" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
      </button>
    );
  }

  return (
    <div className="fixed z-50
      /* Mobile positioning - better spacing from edges */
      bottom-20 right-4 
      w-[calc(100vw-2rem)] h-[calc(100vh-6rem)]
      max-w-sm max-h-[500px]
      
      /* Desktop positioning */
      sm:bottom-6 sm:right-6 sm:w-96 sm:h-[600px] sm:max-w-none sm:max-h-none
    " ref={chatWindowRef}>
      <div className="bg-white/95 backdrop-blur-xl w-full h-full flex flex-col shadow-2xl rounded-3xl border border-white/20 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-t-3xl">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3 backdrop-blur-sm">
              <div className="nutrichef-logo nutrichef-logo-sm"></div>
            </div>
            <div>
              <h3 className="font-semibold text-white">NutriChef Assistant</h3>
              <p className="text-xs text-emerald-100">AI-powered nutrition help</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Close chatbot"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white" ref={chatBodyRef}>
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="max-w-xs lg:max-w-sm">
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                      : message.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-white text-gray-800 border border-gray-100 shadow-md'
                  }`}
                >
                  {message.imagePreview && (
                    <div className="mb-3">
                      <img
                        src={message.imagePreview}
                        alt="User uploaded"
                        className="w-full h-32 object-cover rounded-xl border border-gray-200"
                      />
                    </div>
                  )}
                  <div
                    dangerouslySetInnerHTML={renderFormattedText(message.text)}
                    className="text-sm leading-relaxed"
                  />
                  {message.image_url && (
                    <div className="mt-3">
                      <img
                        src={message.image_url}
                        alt="Bot response"
                        className="w-full h-32 object-cover rounded-xl border border-gray-200"
                      />
                    </div>
                  )}
                  {message.link_url && (
                    <a
                      href={message.link_url}
                      className="mt-3 text-emerald-600 hover:text-emerald-700 underline text-sm font-medium flex items-center"
                    >
                      {message.link_text || 'Learn more'} →
                    </a>
                  )}
                  {message.disambiguation_matches && (
                    <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <p className="text-xs text-emerald-700 font-medium mb-2">Did you mean:</p>
                      <div className="space-y-1">
                        {message.disambiguation_matches.map((match, index) => (
                          <button
                            key={index}
                            onClick={() => handleDisambiguationChoiceClick(match)}
                            className="block w-full text-left text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100 px-3 py-2 rounded-lg transition-colors"
                          >
                            {match}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className={`flex items-center mt-1 text-xs text-gray-400 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <HiOutlineClock className="w-3 h-3 mr-1" />
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl border border-gray-100 shadow-md">
                <div className="flex items-center space-x-2">
                  <HiOutlineRefresh className="w-4 h-4 animate-spin text-emerald-500" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 rounded-b-3xl">
          <form onSubmit={handleSubmit} className="space-y-3">
            {imagePreviewUrl && (
              <div className="relative">
                <img
                  src={imagePreviewUrl}
                  alt="Preview"
                  className="w-full h-24 object-cover rounded-xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-md"
                >
                  ×
                </button>
              </div>
            )}
            <div className="flex space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200"
                aria-label="Upload image"
              >
                <HiOutlinePhotograph className="w-5 h-5" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask me anything about nutrition..."
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || (!userInput.trim() && !selectedImage)}
                className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                aria-label="Send message"
              >
                <HiPaperAirplane className="w-5 h-5" />
              </button>
            </div>
            {error && (
              <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default FloatingChatbot;
