import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';
import { HiOutlineChatAlt2 } from 'react-icons/hi';
import MobileChatbot from './chatbot/MobileChatbot';
import DesktopChatbot from './chatbot/DesktopChatbot';

const FloatingChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const chatBodyRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatWindowRef = useRef(null);
  const inputRef = useRef(null);
  const auth = useAuth();
  const { isAuthenticated, currentUser, token, loading: authLoading } = auth;

  const fetchInstance = useCallback(async (url, options) => {
    return authenticatedFetch(url, options, auth);
  }, [auth]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      if (!isMobile && chatWindowRef.current && !chatWindowRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, isMobile]);

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

  const handleClose = useCallback(() => {
    setOpen(false);
    // Don't clear messages when closing, only clear input-related states
    setUserInput('');
    setSelectedImage(null);
    setImagePreviewUrl(null);
    setError('');
  }, []);

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
    <>
      {/* Mobile Layout */}
      {isMobile && (
        <MobileChatbot
          open={open}
          handleClose={handleClose}
          messages={messages}
          isLoading={isLoading}
          chatBodyRef={chatBodyRef}
          formatTime={formatTime}
          renderFormattedText={renderFormattedText}
          handleDisambiguationChoiceClick={handleDisambiguationChoiceClick}
          handleSubmit={handleSubmit}
          imagePreviewUrl={imagePreviewUrl}
          setSelectedImage={setSelectedImage}
          setImagePreviewUrl={setImagePreviewUrl}
          fileInputRef={fileInputRef}
          handleImageChange={handleImageChange}
          inputRef={inputRef}
          userInput={userInput}
          setUserInput={setUserInput}
          selectedImage={selectedImage}
          error={error}
        />
      )}

      {/* Desktop Layout */}
      {!isMobile && (
        <DesktopChatbot
          open={open}
          handleClose={handleClose}
          chatWindowRef={chatWindowRef}
          messages={messages}
          isLoading={isLoading}
          chatBodyRef={chatBodyRef}
          formatTime={formatTime}
          renderFormattedText={renderFormattedText}
          handleDisambiguationChoiceClick={handleDisambiguationChoiceClick}
          handleSubmit={handleSubmit}
          imagePreviewUrl={imagePreviewUrl}
          setSelectedImage={setSelectedImage}
          setImagePreviewUrl={setImagePreviewUrl}
          fileInputRef={fileInputRef}
          handleImageChange={handleImageChange}
          inputRef={inputRef}
          userInput={userInput}
          setUserInput={setUserInput}
          selectedImage={selectedImage}
          error={error}
        />
      )}
    </>
  );
};

export default FloatingChatbot;
