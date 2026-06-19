'use client';
import React from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{ url: string; alt: string }>;
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export default function ImageLightbox({ isOpen, onClose, images, currentIndex, onNavigate }: ImageLightboxProps) {
  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white hover:text-slate-300 transition-colors"
      >
        <X className="h-8 w-8" />
      </button>

      {images.length > 1 && currentIndex > 0 && (
        <button 
          onClick={() => onNavigate(currentIndex - 1)} 
          className="absolute left-4 text-white hover:text-slate-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      )}

      {images.length > 1 && currentIndex < images.length - 1 && (
        <button 
          onClick={() => onNavigate(currentIndex + 1)} 
          className="absolute right-16 text-white hover:text-slate-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      )}

      <div className="max-w-5xl max-h-[90vh]">
        <img 
          src={currentImage.url} 
          alt={currentImage.alt} 
          className="max-h-[85vh] w-auto object-contain rounded-lg" 
        />
        {images.length > 1 && (
          <p className="text-center text-white mt-4 text-sm">
            {currentIndex + 1} of {images.length}
          </p>
        )}
      </div>
    </div>
  );
}
