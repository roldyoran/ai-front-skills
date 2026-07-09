import { useState, useRef, useCallback, useEffect } from 'react';

interface ImageComparisonProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  width?: number;
  height?: number;
}

export function ImageComparison({
  beforeSrc,
  afterSrc,
  beforeAlt = 'Before',
  afterAlt = 'After',
  width = 800,
  height = 500,
}: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden border border-border cursor-col-resize select-none"
      style={{ aspectRatio: `${width}/${height}` }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* After Image (Background) */}
      <img
        src={afterSrc}
        alt={afterAlt}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {/* Before Image (Clipped) */}
      <div
        className="absolute inset-0 h-full overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeSrc}
          alt={beforeAlt}
          className="h-full w-full object-cover"
          style={{ width: `${(100 / sliderPosition) * 100}%`, maxWidth: 'none' }}
          draggable={false}
        />
      </div>

      {/* Slider Line */}
      <div
        className="absolute top-0 h-full w-0.5 bg-text"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* Slider Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center border-2 border-text bg-bg/80 backdrop-blur-sm">
          <svg
            className="h-5 w-5 text-text"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute left-4 top-4 bg-bg/80 px-2 py-1 text-xs text-text-muted backdrop-blur-sm border border-border">
        Before
      </div>
      <div className="absolute right-4 top-4 bg-bg/80 px-2 py-1 text-xs text-text-muted backdrop-blur-sm border border-border">
        After
      </div>
    </div>
  );
}
