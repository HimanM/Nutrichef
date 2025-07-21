import React from 'react';
import { HiX } from 'react-icons/hi';
import ChatContent from './ChatContent';

const DesktopChatbot = ({
  open,
  handleClose,
  chatWindowRef,
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
  if (!open) return null;

  return (
    <div className="fixed z-50 bottom-6 right-6 w-96 h-[600px]" ref={chatWindowRef}>
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
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Close chatbot"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>
        
        <ChatContent
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
      </div>
    </div>
  );
};

export default DesktopChatbot;
