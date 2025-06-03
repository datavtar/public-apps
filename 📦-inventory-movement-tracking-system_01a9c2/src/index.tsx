import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import GuidedTour from './components/GuidedTour';
import { TourProvider } from './components/GuidedTour';
import tourSteps from './config/tourSteps';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
              <TourProvider>
                  <App />
                  <GuidedTour 
                      steps={tourSteps} 
                      autoStart={true}
                      onComplete={() => {
                          console.log('Tour completed');
                      }}
                  />
              </TourProvider>
    </React.StrictMode>
);

reportWebVitals();