import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';
import { HiOutlineChatAlt2, HiX, HiPaperAirplane, HiOutlinePhotograph, HiOutlineRefresh } from 'react-icons/hi';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const chatBodyRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatWindowRef = useRef(null);
  const auth = useAuth();
  const { isAuthenticated, currentUser, token, loading: authLoading } = auth;

  const fetchInstance = useCallback(async (url, options) => {
    return authenticatedFetch(url, options, auth);
  }, [auth]);


  const initialGreeting = {
    id: Date.now(),
    text: "Hello! I'm your NutriChef assistant. How can I help you today?",
    sender: 'bot',
    timestamp: new Date(),
  };

  useEffect(() => {
    if (isOpen) {
      setMessages([initialGreeting]);
    } else {
      setMessages([]);
      setUserInput('');
      setSelectedImage(null);
      setImagePreviewUrl(null);
      setError('');
    }
  }, [isOpen]);


  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const renderFormattedText = (text) => {
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const boldRegex = /\*\*(.*?)\*\*/g;
    const listRegex = /^\s*-\s+(.*)/gm;

    let html = text
      .replace(linkRegex, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600 underline">$1</a>')
      .replace(boldRegex, '<strong>$1</strong>')
      .replace(/\_(.*?)\_/g, '<em>$1</em>')
      .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

    if (listRegex.test(html)) {
      html = html.replace(listRegex, '<li class="ml-4 list-disc">$1</li>');
      html = `<ul>${html}</ul>`;
    }
    return { __html: html };
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
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
        text: 'Please login to use the chatbot.', 
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
        { id: Date.now() + 1, text: `Error: ${err.message || 'Could not connect'}`, sender: 'bot', timestamp: new Date(), isError: true },
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
        throw new Error(responseData.error || `Disambiguation choice failed with status ${response.status}`);
      }

      const botMessage = {
        id: Date.now() + 1,
        text: responseData.response || "Could not fetch details for that choice.",
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
        { id: Date.now() + 1, text: `Error: ${err.message}`, sender: 'bot', timestamp: new Date(), isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && isAuthenticated && !authLoading && (
        <button
          id="chatbot-fab"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform duration-150 ease-in-out hover:scale-110 z-40"
          aria-label="Open Chatbot"
        >
          <HiOutlineChatAlt2 className="w-6 h-6" />
        </button>
      )}

      {isOpen && isAuthenticated && (
        <div
          ref={chatWindowRef}
          className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 w-[calc(100%-2.5rem)] max-w-md h-[75vh] sm:h-[calc(100vh-4rem)] max-h-[600px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-300 z-50"
        >
          <div className="p-3 gradient-box flex justify-between items-center">
            <h6 className="text-lg font-semibold text-blue">NutriChef Assistant</h6>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full"
              aria-label="Close Chatbot"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          <div ref={chatBodyRef} className="flex-grow p-3 space-y-3 overflow-y-auto grey-blue-box">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-2.5 rounded-lg shadow ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : (msg.isError ? 'bg-red-100 text-red-700 rounded-bl-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none')
                }`}>
                  {msg.sender === 'bot' && !msg.isError && (
                     <p className="text-xs text-gray-500 mb-0.5">NutriChef Assistant</p>
                  )}
                  {msg.imagePreview && <img src={msg.imagePreview} alt="Preview" className="max-w-xs max-h-40 rounded-md my-1"/>}
                  {msg.imageUrl && <img src={msg.imageUrl} alt="Chatbot content" className="max-w-xs max-h-40 rounded-md my-1"/>}

                  {msg.text && <div className="text-sm" dangerouslySetInnerHTML={renderFormattedText(msg.text)} />}

                  {msg.disambiguation_matches && Array.isArray(msg.disambiguation_matches) && (
                    <div className="mt-2 space-y-1">
                      {msg.disambiguation_matches.map((matchString, index) => (
                        <button
                          key={index}
                          onClick={() => handleDisambiguationChoiceClick(matchString)}
                          className="block w-full text-left text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-md border border-blue-200"
                        >
                          {matchString}
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.sender === 'bot' && msg.link_url && msg.link_text && (
                    <div className="mt-2">
                      <a
                        href={msg.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-3 py-1.5 text-white text-xs font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition ease-in-out duration-150"
                      >
                        {msg.link_text}
                      </a>
                    </div>
                  )}

                  {msg.sourceLinks && msg.sourceLinks.length > 0 && (
                    <div className="mt-2 pt-1 border-t border-gray-300">
                      <p className="text-xs font-semibold text-gray-600">Sources:</p>
                      <ul className="list-none pl-0 space-y-0.5">
                        {msg.sourceLinks.map((link, index) => (
                          <li key={index}>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:text-blue-700 underline truncate block">
                              {link.title || link.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs mt-1 opacity-75 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && messages.length > 0 && messages[messages.length -1].sender === 'user' && (
                 <div className="flex justify-start">
                    <div className="max-w-[80%] p-2.5 rounded-lg shadow bg-white text-gray-800 border border-gray-200 rounded-bl-none">
                        <p className="text-xs text-gray-500 mb-0.5">NutriChef Assistant</p>
                        <div className="flex items-center">
                            <HiOutlineRefresh className="animate-spin h-5 w-5 text-blue-500" /> <span className="ml-2 text-sm text-gray-500">Thinking...</span>
                        </div>
                    </div>
                </div>
            )}
          </div>

          {error && !isLoading && (
            <div className="p-2 border-t border-gray-200 bg-red-50">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <div className="p-2 border-t border-gray-200 gradient-box">
            {imagePreviewUrl && (
              <div className="p-2 border-b border-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img src={imagePreviewUrl} alt="Selected preview" className="h-12 w-12 object-cover rounded border border-gray-300" />
                  <span className="text-xs text-gray-600 truncate max-w-[150px]">{selectedImage?.name || 'Image'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreviewUrl(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = null;
                    }
                  }}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full text-xs"
                  aria-label="Remove selected image"
                >
                  <HiX className="w-4 h-4" />
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
                id="chatbot-image-upload"
              />
              <label htmlFor="chatbot-image-upload" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer">
                <HiOutlinePhotograph className="w-5 h-5" />
              </label>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-black"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || (!userInput.trim() && !selectedImage)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center"
              >
                {isLoading ? <HiOutlineRefresh className="animate-spin h-5 w-5" /> : <HiPaperAirplane className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;
