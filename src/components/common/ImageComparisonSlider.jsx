import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Columns, SplitSquareVertical } from 'lucide-react';

export default function ImageComparisonSlider({
  originalUrl,
  processedUrl,
  originalLabel = 'Original',
  processedLabel = 'Processed',
  isTransparent = false,
}) {
  const [sliderPos, setSliderPos] = useState(50); // percentage (0 - 100)
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'side-by-side'
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  }, [handleMove]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPos((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPos((prev) => Math.min(100, prev + 5));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSliderPos(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSliderPos(100);
    }
  };

  const checkerboardStyle = isTransparent ? {
    backgroundImage: `
      linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
      linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
      linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)
    `,
    backgroundSize: '16px 16px',
    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
    backgroundColor: '#ffffff'
  } : {
    backgroundColor: '#f8fafc'
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* View mode toggle header */}
      <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
        <span className="font-medium">
          {viewMode === 'split' ? 'Drag slider or use arrow keys to compare' : 'Side-by-side preview'}
        </span>
        <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'split'
                ? 'bg-white text-blue-600 shadow-xs border border-zinc-200/80'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
            aria-pressed={viewMode === 'split'}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Split Slider</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-white text-blue-600 shadow-xs border border-zinc-200/80'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
            aria-pressed={viewMode === 'side-by-side'}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {viewMode === 'side-by-side' ? (
        /* Side by side layout */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">{originalLabel}</span>
            <div className="relative rounded-xl border border-zinc-200 overflow-hidden bg-zinc-100 flex items-center justify-center min-h-[260px] max-h-[420px] p-2">
              <img
                src={originalUrl}
                alt={originalLabel}
                className="max-h-[380px] w-auto max-w-full object-contain rounded-lg shadow-xs"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{processedLabel}</span>
            <div
              className="relative rounded-xl border border-blue-200 overflow-hidden flex items-center justify-center min-h-[260px] max-h-[420px] p-2"
              style={checkerboardStyle}
            >
              <img
                src={processedUrl}
                alt={processedLabel}
                className="max-h-[380px] w-auto max-w-full object-contain rounded-lg shadow-xs"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Interactive Split Slider layout */
        <div
          ref={containerRef}
          role="slider"
          aria-label="Image comparison slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(sliderPos)}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseDown={(e) => {
            setIsDragging(true);
            handleMove(e.clientX);
          }}
          onTouchStart={(e) => {
            setIsDragging(true);
            if (e.touches && e.touches[0]) handleMove(e.touches[0].clientX);
          }}
          className="relative w-full rounded-2xl border border-zinc-200 overflow-hidden select-none cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          style={{
            minHeight: '280px',
            maxHeight: '480px',
            height: '420px',
            ...checkerboardStyle
          }}
        >
          {/* Background Layer: Processed Image (Result) */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <img
              src={processedUrl}
              alt={processedLabel}
              className="max-h-full max-w-full w-auto h-auto object-contain pointer-events-none"
              style={{ maxHeight: '380px' }}
            />
            {/* Processed Label Badge */}
            <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-blue-600/90 text-white backdrop-blur-xs shadow-xs pointer-events-none">
              {processedLabel}
            </span>
          </div>

          {/* Foreground Layer: Original Image (Clipped) */}
          <div
            className="absolute inset-0 overflow-hidden bg-slate-900/5 backdrop-blur-[0.5px]"
            style={{
              clipPath: `polygon(0% 0%, ${sliderPos}% 0%, ${sliderPos}% 100%, 0% 100%)`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <img
                src={originalUrl}
                alt={originalLabel}
                className="max-h-full max-w-full w-auto h-auto object-contain pointer-events-none"
                style={{ maxHeight: '380px' }}
              />
              {/* Original Label Badge */}
              <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-zinc-900/80 text-white backdrop-blur-xs shadow-xs pointer-events-none">
                {originalLabel}
              </span>
            </div>
          </div>

          {/* Slider Divider Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.4)] pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            {/* Center Grabber Handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-blue-600 shadow-md flex items-center justify-center text-blue-600 transition-transform hover:scale-110 active:scale-95"
              aria-hidden="true"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
                <polyline points="9 18 3 12 9 6"></polyline>
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
