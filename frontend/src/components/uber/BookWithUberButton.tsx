import React from 'react';

interface BookWithUberButtonProps {
  uberLink: string;
  webLink: string;
}

const BookWithUberButton: React.FC<BookWithUberButtonProps> = ({ uberLink, webLink }) => {
  const handleBookRide = () => {
    if (!uberLink) {
      alert('Please set both pickup and drop locations to generate Uber link.');
      return;
    }

    // Check if we're on a mobile device
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Try to open the Uber app
      window.location.href = uberLink;
      
      // Fallback to web if app doesn't open within 1 second
      setTimeout(() => {
        window.open(webLink, '_blank');
      }, 1000);
    } else {
      // On desktop, open the web version
      window.open(webLink, '_blank');
    }
  };

  return (
    <button
      onClick={handleBookRide}
      className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center"
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.75 15.875c-.125.125-.375.125-.5 0l-1.5-1.5c-.125-.125-.125-.375 0-.5l.75-.75c.125-.125.125-.375 0-.5l-4.5-4.5c-.125-.125-.375-.125-.5 0l-3 3c-.125.125-.375.125-.5 0l-1.5-1.5c-.125-.125-.125-.375 0-.5l3.75-3.75c.125-.125.375-.125.5 0l4.5 4.5c.125.125.375.125.5 0l2.25-2.25c.125-.125.375-.125.5 0l3.75 3.75c.125.125.125.375 0 .5l-5.25 5.25z"/>
      </svg>
      Book with Uber
    </button>
  );
};

export default BookWithUberButton;