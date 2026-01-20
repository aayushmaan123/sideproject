import { useState, useEffect } from 'react';

interface ScrollToTopButtonProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function ScrollToTopButton({ containerRef }: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Show button when scrolled down more than 300px
      setIsVisible(container.scrollTop > 300);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  const scrollToTop = () => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title="Scroll to top"
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '40px',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        border: 'none',
        boxShadow: 'var(--shadow-lg)',
        cursor: 'pointer',
        fontSize: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all var(--transition-fast)',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease-out',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.backgroundColor = 'var(--color-primary)';
      }}
    >
      ↑
    </button>
  );
}
