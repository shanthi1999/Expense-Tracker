import { useEffect, useState } from 'react';
import { ThemeContext } from './themeContext.js';

const THEME_KEY = 'tracker-theme';

/** Theme provider with localStorage persistence — applies `dark` class on document root. */
export function ThemeProvider({ children, defaultTheme = 'light' }) {
    const [theme, setThemeState] = useState(() => {
        if (typeof window === 'undefined') return defaultTheme;
        return localStorage.getItem(THEME_KEY) || defaultTheme;
    });

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    const setTheme = (newTheme) => setThemeState(newTheme);
    const toggleTheme = () => setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
