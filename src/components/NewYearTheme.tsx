import { useEffect, useState } from 'react';
import API_ENDPOINTS from '@/config/api';
import './NewYearTheme.css';

export const NewYearTheme = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const checkTheme = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.SITE_SETTINGS}?key=new_year_theme`);
        if (response.ok) {
          const data = await response.json();
          setEnabled(data.value === 'true');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    checkTheme();
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div className="snowflakes" aria-hidden="true">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i} 
            className="snowflake"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 5}s`,
              fontSize: `${Math.random() * 10 + 10}px`,
              opacity: Math.random() * 0.6 + 0.4
            }}
          >
            ❄
          </div>
        ))}
      </div>
      
      <style>{`
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05), transparent 50%);
          pointer-events: none;
          z-index: 0;
        }
      `}</style>
    </>
  );
};
