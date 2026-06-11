import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/rootReducer.js';
import { ThemeProvider } from './providers/ThemeProvider.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <ThemeProvider defaultTheme="light">
                <App />
            </ThemeProvider>
        </Provider>
    </StrictMode>
);
