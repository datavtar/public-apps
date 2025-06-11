import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import AuthWrapper from './components/AuthWrapper';
import { AuthProvider } from './contexts/authContext';
import GuidedTour from './components/GuidedTour';
import { TourProvider } from './components/GuidedTour';
let tourSteps: any[] = [];
try {
    tourSteps = require('./config/tourSteps').default || [];
} catch (error) {
    console.warn('Tour steps could not be loaded, using empty array:', error);
    tourSteps = [];
}

// Initialize tour completion status in localStorage if not present
if (!localStorage.getItem('tourCompleted')) {
    localStorage.setItem('tourCompleted', 'false');
}

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <AuthProvider>
            <AuthWrapper>
              <TourProvider>
                  <App />
                  <GuidedTour 
                      steps={Array.isArray(tourSteps) ? tourSteps : []} 
                      autoStart={Array.isArray(tourSteps) && tourSteps.length > 0}
                      onComplete={() => {
                          console.log('Tour completed');
                          localStorage.setItem('tourCompleted', 'true');
                      }}
                  />
              </TourProvider>
            </AuthWrapper>
        </AuthProvider>
    </React.StrictMode>
);

reportWebVitals();