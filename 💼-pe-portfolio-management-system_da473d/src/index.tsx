import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import AuthWrapper from './components/AuthWrapper';
import { AuthProvider } from './contexts/authContext';
import GuidedTour from './components/GuidedTour';
import { TourProvider } from './components/GuidedTour';
import tourSteps from './config/tourSteps';

// Tour Error Boundary wrapper
const SafeTourWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  try {
    return (
      <TourProvider>
        {children}
        <GuidedTour 
          steps={tourSteps || []} 
          autoStart={true}
          onComplete={() => {
            console.log('Tour completed');
          }}
        />
      </TourProvider>
    );
  } catch (error) {
    console.warn('Tour failed to initialize, continuing without tour:', error);
    return <>{children}</>;
  }
};

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <AuthProvider>
            <AuthWrapper>
              <SafeTourWrapper>
                <App />
              </SafeTourWrapper>
            </AuthWrapper>
        </AuthProvider>
    </React.StrictMode>
);

reportWebVitals();