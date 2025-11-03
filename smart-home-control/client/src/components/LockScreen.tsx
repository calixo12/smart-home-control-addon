import { useState, useEffect, useRef } from "react";
import { ChevronRight, Shield } from "lucide-react";
import { playUnlockClick } from "@/lib/sounds";

interface LockScreenProps {
  onUnlock: () => void;
  backgroundStyle: any;
  roomName?: string;
  onSecurityOpen?: () => void;
}

export default function LockScreen({ onUnlock, backgroundStyle, roomName = "Room", onSecurityOpen }: LockScreenProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [slidePosition, setSlidePosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (slidePosition >= 100 && !isUnlocking) {
      playUnlockClick();
      setIsUnlocking(true);
      // Wait for exit animation to complete before unlocking
      setTimeout(() => {
        onUnlock();
      }, 400);
    }
  }, [slidePosition, onUnlock, isUnlocking]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // Ultra-fast sliding - direct 1:1 mapping
    const percentage = Math.max(0, Math.min(100, ((x - 20) / (rect.width - 40)) * 100));
    setSlidePosition(percentage);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    // Ultra-fast sliding - direct 1:1 mapping
    const percentage = Math.max(0, Math.min(100, ((x - 20) / (rect.width - 40)) * 100));
    setSlidePosition(percentage);
  };

  const handleMouseUp = () => {
    if (slidePosition < 100) {
      setSlidePosition(0);
    }
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, slidePosition]);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return {
      time: `${displayHours}:${minutes.toString().padStart(2, '0')}`,
      ampm
    };
  };

  const formatDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  const { time, ampm } = formatTime(currentTime);
  const dateString = formatDate(currentTime);

  const handleClick = (e: React.MouseEvent) => {
    // Click-to-unlock for testing automation
    if (!isUnlocking) {
      playUnlockClick();
      setIsUnlocking(true);
      setTimeout(() => {
        onUnlock();
      }, 400);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col cursor-pointer"
      style={{
        ...backgroundStyle,
        animation: isUnlocking ? 'fadeOut 0.4s ease-out' : 'fadeIn 0.3s ease-in',
        opacity: isUnlocking ? 0 : 1,
      }}
      onClick={handleClick}
      data-testid="lockscreen-container"
    >
      {/* Top Status Bar - Skeuomorphic iPad Style */}
      <div 
        className="h-7 flex items-center justify-between px-4 text-white text-xs"
        style={{
          background: `
            linear-gradient(180deg, rgba(80,80,80,0.95) 0%, rgba(50,50,50,0.95) 100%)
          `,
          borderBottom: '1px solid rgba(0,0,0,0.8)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 3px rgba(0,0,0,0.5)',
          animation: isUnlocking ? 'flyUp 0.4s ease-out' : 'none',
          opacity: isUnlocking ? 0 : 1,
        }}
      >
        <div className="flex items-center gap-1">
          <span style={{ fontSize: '11px', fontWeight: 600, textShadow: '0 -1px 0 rgba(0,0,0,0.5)' }}>iPad</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '11px', fontWeight: 600, textShadow: '0 -1px 0 rgba(0,0,0,0.5)' }}>{roomName}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Time Display - Exact iPad 1 Style */}
        <div 
          className="text-center" 
          style={{ 
            marginBottom: '280px',
            animation: isUnlocking ? 'flyUp 0.4s ease-out' : 'none',
            transform: isUnlocking ? 'translateY(-100px)' : 'translateY(0)',
            opacity: isUnlocking ? 0 : 1,
          }}
        >
          <div 
            style={{
              fontSize: '140px',
              color: 'white',
              textShadow: '0 3px 8px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.3)',
              fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 200,
              letterSpacing: '-0.01em',
            }}
          >
            {time}
          </div>
          <div 
            className="font-normal"
            style={{
              fontSize: '20px',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.2)',
              fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 400,
              marginTop: '-8px',
            }}
          >
            {dateString}
          </div>
        </div>
      </div>

      {/* Bottom Bar with Slider - Skeuomorphic */}
      <div 
        className="h-28 flex items-center justify-between px-6"
        style={{
          background: `
            linear-gradient(180deg, rgba(50,50,50,0.95) 0%, rgba(80,80,80,0.95) 100%)
          `,
          borderTop: '1px solid rgba(0,0,0,0.8)',
          boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.15), 0 -1px 3px rgba(0,0,0,0.5)',
          animation: isUnlocking ? 'flyDown 0.4s ease-out' : 'none',
          opacity: isUnlocking ? 0 : 1,
        }}
      >
        {/* Empty space for balance */}
        <div className="w-14"></div>

        {/* Swipe to Unlock - Skeuomorphic Metal Track */}
        <div className="w-full max-w-lg px-6">
          <div
            ref={sliderRef}
            className="relative h-12 overflow-visible cursor-pointer select-none"
            style={{
              background: `
                linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 40%, #000000 60%, #0d0d0d 100%)
              `,
              border: '1px solid #000',
              borderRadius: '10px',
              boxShadow: `
                0 1px 0 rgba(255,255,255,0.1),
                inset 0 2px 4px rgba(0,0,0,0.9),
                inset 0 -1px 1px rgba(255,255,255,0.05)
              `,
            }}
          >
            {/* Slide Text - Gliding with bright white glow */}
            <div
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
              style={{
                opacity: Math.max(0, 1 - slidePosition / 100),
              }}
            >
              <style>{`
                @keyframes slideGlow {
                  0% {
                    background-position: -100% 0;
                  }
                  100% {
                    background-position: 100% 0;
                  }
                }
              `}</style>
              <div
                className="absolute inset-0 flex items-center justify-center text-white font-normal"
                style={{
                  fontSize: '22px',
                  fontFamily: 'Helvetica Neue, -apple-system, sans-serif',
                  letterSpacing: '0.02em',
                  fontWeight: 300,
                  transform: `translateX(${slidePosition * 2}px)`,
                  transition: 'transform 0.05s linear',
                  background: `
                    linear-gradient(
                      90deg,
                      rgba(255,255,255,0.3) 0%,
                      rgba(255,255,255,0.5) 30%,
                      rgba(255,255,255,1) 50%,
                      rgba(255,255,255,0.5) 70%,
                      rgba(255,255,255,0.3) 100%
                    )
                  `,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200% 100%',
                  animation: 'slideGlow 3s linear infinite',
                  filter: `
                    drop-shadow(0 0 20px rgba(255,255,255,0.9))
                    drop-shadow(0 0 10px rgba(255,255,255,0.8))
                    drop-shadow(0 0 5px rgba(255,255,255,0.6))
                    drop-shadow(0 1px 3px rgba(0,0,0,0.9))
                  `,
                }}
              >
                slide to unlock
              </div>
            </div>

            {/* Slider Button - Skeuomorphic Chrome Metal */}
            <div
              className="absolute left-0 top-0 h-full transition-none"
              style={{
                width: '60px',
                transform: `translateX(${slidePosition}%)`,
                pointerEvents: isDragging ? 'none' : 'auto',
                padding: '2px',
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              data-testid="unlock-slider"
            >
              <div
                className="w-full h-full rounded-lg flex items-center justify-center"
                style={{
                  background: `
                    linear-gradient(180deg, #ffffff 0%, #f5f5f5 20%, #e0e0e0 50%, #d0d0d0 80%, #c0c0c0 100%)
                  `,
                  boxShadow: `
                    0 3px 6px rgba(0,0,0,0.6),
                    0 1px 2px rgba(0,0,0,0.4),
                    inset 0 1px 0 rgba(255,255,255,1),
                    inset 0 -1px 2px rgba(0,0,0,0.25)
                  `,
                  border: '1px solid rgba(0,0,0,0.4)',
                }}
              >
                <ChevronRight className="w-6 h-6" style={{ color: '#444' }} strokeWidth={3.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Shield Button - Exact Same as Slider Bar */}
        <button
          className="h-12 px-4 rounded-xl flex items-center justify-center"
          style={{
            background: `
              linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 40%, #000000 60%, #0d0d0d 100%)
            `,
            border: '1px solid #000',
            borderRadius: '10px',
            boxShadow: `
              0 1px 0 rgba(255,255,255,0.1),
              inset 0 2px 4px rgba(0,0,0,0.9),
              inset 0 -1px 1px rgba(255,255,255,0.05)
            `,
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onSecurityOpen) {
              playUnlockClick();
              setIsUnlocking(true);
              setTimeout(() => {
                onUnlock();
                onSecurityOpen();
              }, 400);
            }
          }}
          data-testid="button-shield"
        >
          <Shield className="w-6 h-6 text-white" strokeWidth={2} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }} />
        </button>
      </div>
    </div>
  );
}
