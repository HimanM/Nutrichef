import React from 'react';
import { HiOutlineClock, HiPaperAirplane, HiOutlinePhotograph } from 'react-icons/hi';
import { SpinnerIcon } from '../common/LoadingComponents.jsx';

const ChatContent = ({
  messages,
  isLoading,
  chatBodyRef,
  formatTime,
  renderFormattedText,
  handleDisambiguationChoiceClick,
  handleSubmit,
  imagePreviewUrl,
  setSelectedImage,
  setImagePreviewUrl,
  fileInputRef,
  handleImageChange,
  inputRef,
  userInput,
  setUserInput,
  selectedImage,
  error
}) => {
  return (
    <>
      {/* Chat Body */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white mobile-scroll" 
        ref={chatBodyRef}
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain'
        }}
      >
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
                <SpinnerIcon size="w-4 h-4" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100">
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
          <div className="flex space-x-2 items-end">
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
              className="p-3 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 touch-manipulation"
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
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm touch-manipulation"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || (!userInput.trim() && !selectedImage)}
              className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 shadow-md touch-manipulation"
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
    </>
  );
};

export default ChatContent;
