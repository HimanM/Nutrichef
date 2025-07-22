import React from 'react';
import MobileModal from '../ui/MobileModal';
import ChatContent from './ChatContent';

const MobileChatbot = ({
  open,
  handleClose,
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
    <MobileModal
      isOpen={open}
      onClose={handleClose}
      title="NutriChef Assistant"
      dragToClose={true}
      className="max-h-[85vh]"
    >
      <div className="flex flex-col h-full -mx-6 -my-4">
        {/* Mobile-optimized content */}
        <div className="flex-1 flex flex-col bg-white">
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
    </MobileModal>
  );
};

export default MobileChatbot;
