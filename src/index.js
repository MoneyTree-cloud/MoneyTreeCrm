import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import ResizeObserver from 'resize-observer-polyfill';

// Add polyfill for ResizeObserver (you already had this)
if (!window.ResizeObserver) {
  window.ResizeObserver = ResizeObserver;
}

// Create root and render the React app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// ✅ Register Firebase service worker (for push notifications)
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker
//     .register('/firebase-messaging-sw.js')
//     .then((registration) => {
//       console.log('✅ Service Worker registered with scope:', registration.scope);
//     })
//     .catch((error) => {
//       console.error('❌ Service Worker registration failed:', error);
//     });
// }
