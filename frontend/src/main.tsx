import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeCometChat } from './services/cometchat.service'

// Initialize CometChat when the app starts
initializeCometChat().catch(error => {
  console.warn('Failed to initialize CometChat:', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
