import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import AuthWrapper from './components/AuthWrapper';
import { AuthProvider } from './contexts/authContext';
import GuidedTour from './components/GuidedTour';
import { TourProvider } from './components/GuidedTour';
import tourStepsImport from './config/tourSteps';

// Use ES6 default import
let tourSteps: any[] = [];
try {
    console.log('🔄 Loading tour steps with ES6 default import...');
    
    // Use the default export
    tourSteps = tourStepsImport || [];
    
    console.log('✅ Tour steps loaded successfully:', tourSteps);
    console.log('📊 Tour steps count:', tourSteps.length);
    console.log('📦 Imported tour steps:', tourStepsImport);
    
    if (Array.isArray(tourSteps) && tourSteps.length > 0) {
        console.log('🎯 First tour step:', tourSteps[0]);
        // Validate tour step structure
        tourSteps.forEach((step, index) => {
            if (!step.target || !step.title || !step.content) {
                console.warn(`⚠️ Tour step ${index} is missing required properties:`, step);
            } else {
                console.log(`✅ Tour step ${index + 1}: ${step.title} -> #${step.target}`);
            }
        });
    } else {
        console.warn('❓ Tour steps array is empty after ES6 import');
    }
} catch (error: any) {
    console.error('❌ Failed to load tour steps with ES6 imports:', error);
    console.error('📍 Error details:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack trace',
        name: error?.name || 'Unknown error type'
    });
    tourSteps = [];
}

// Initialize tour completion status in localStorage if not present
const tourCompleted = localStorage.getItem('tourCompleted');
console.log('🏁 Current tour completion status:', tourCompleted);
if (!tourCompleted) {
    localStorage.setItem('tourCompleted', 'false');
    console.log('📝 Initialized tourCompleted to false');
}

console.log('🚀 Application starting...');
console.log('🌐 Environment:', process.env.NODE_ENV);
console.log('📦 React version:', React.version);

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

console.log('🎪 Tour system initialization complete');
console.log('📋 Final tour steps array:', tourSteps);

// Error boundary component for tour debugging
class TourErrorBoundary extends React.Component {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: any) {
        console.error('🚨 Tour Error Boundary caught error:', error);
        return { hasError: true, error };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error('🚨 Tour Error Boundary - Component stack:', errorInfo.componentStack);
        console.error('🚨 Tour Error Boundary - Error details:', error);
    }

    render() {
        if ((this.state as any).hasError) {
            return (
                <div style={{
                    position: 'fixed',
                    top: '10px',
                    right: '10px',
                    background: '#ff4444',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '5px',
                    zIndex: 9999,
                    fontSize: '12px',
                    maxWidth: '300px'
                }}>
                    🚨 Tour Error: {(this.state as any).error?.message || 'Unknown error'}
                    <br/>
                    <small>Check console for details</small>
                </div>
            );
        }
        return (this.props as any).children;
    }
}

// Debug component to show tour status
const TourDebugInfo = () => {
    const [debugInfo, setDebugInfo] = React.useState('');
    
         React.useEffect(() => {
         const checkTourTargets = () => {
             const targetElements = tourSteps.map(step => {
                 const element = document.getElementById(step.target);
                 return {
                     target: step.target,
                     exists: !!element,
                     element: element
                 };
             });
             console.log('🎯 Tour target elements check:', targetElements);
             return targetElements;
         };

         const info = `
             Steps: ${tourSteps.length}
             AutoStart: ${Array.isArray(tourSteps) && tourSteps.length > 0}
             Completed: ${localStorage.getItem('tourCompleted')}
         `;
         setDebugInfo(info);
         console.log('🐛 Tour Debug Info:', info);
         
         // Check tour targets after a brief delay to allow DOM to render
         setTimeout(checkTourTargets, 1000);
         setTimeout(checkTourTargets, 3000); // Check again after 3 seconds
     }, []);

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            background: '#333',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '10px',
            zIndex: 9998,
            fontFamily: 'monospace',
            whiteSpace: 'pre-line',
            opacity: 0.8
        }}>
            🐛 Tour Debug:{debugInfo}
        </div>
    );
};

root.render(
    <React.StrictMode>
        <AuthProvider>
            <AuthWrapper>
              <TourProvider>
                  <App />
                  <TourErrorBoundary>
                      <GuidedTour 
                          steps={(() => {
                              const validSteps = Array.isArray(tourSteps) ? tourSteps : [];
                              console.log('🎪 GuidedTour receiving steps:', validSteps);
                              console.log('🎪 TourProvider mounted successfully');
                              return validSteps;
                          })()} 
                          autoStart={(() => {
                              const shouldAutoStart = Array.isArray(tourSteps) && tourSteps.length > 0;
                              console.log('🚀 GuidedTour autoStart decision:', shouldAutoStart);
                              console.log('🚀 Reason: tourSteps.length =', tourSteps.length);
                              if (shouldAutoStart) {
                                  console.log('🎬 Tour will start automatically!');
                              } else {
                                  console.log('⏸️ Tour will NOT start (no steps available)');
                              }
                              return shouldAutoStart;
                          })()}
                          onComplete={() => {
                              console.log('🎉 Tour completed successfully!');
                              localStorage.setItem('tourCompleted', 'true');
                              console.log('💾 Tour completion saved to localStorage');
                          }}
                      />
                  </TourErrorBoundary>
                  {process.env.NODE_ENV === 'development' && <TourDebugInfo />}
              </TourProvider>
            </AuthWrapper>
        </AuthProvider>
    </React.StrictMode>
);

reportWebVitals();