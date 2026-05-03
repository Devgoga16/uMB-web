import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import '../styles/ThemeToggle.css';

/**
 * Componente para cambiar entre modo claro y oscuro
 */
function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
      title={`Modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      <div className={`theme-toggle-track ${theme}`}>
        <div className={`theme-toggle-thumb ${theme}`}>
          <div className="theme-toggle-icon">
            {theme === 'light' ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.5} />}
          </div>
        </div>
      </div>
    </button>
  );
}

export default ThemeToggle;
