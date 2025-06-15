
// src/types/tour.ts
export interface TourStep {
    target: string;
    title: string;
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    tab?: string;
  }
  
  export interface Position {
    top: number;
    left: number;
  }
  
  export interface PositionResult {
    position: 'top' | 'bottom' | 'left' | 'right';
    coordinates: Position;
  }
  
  export interface TourProviderProps {
    children: React.ReactNode;
    onComplete?: () => void;
  }
  
  export interface TourContextType {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    showTour: boolean;
    setShowTour: (show: boolean) => void;
    isPaused: boolean;
    setIsPaused: (paused: boolean) => void;
    hasCompletedTour: boolean;
    setHasCompletedTour: (completed: boolean) => void;
    onComplete?: () => void;
  }
  
  export interface GuidedTourProps {
    steps: TourStep[];
    autoStart?: boolean;
    onComplete?: () => void;
  }
  
  export interface TourTooltipProps {
    currentStep: number;
    totalSteps: number;
    position: PositionResult;
    onNext: () => void;
    onPrevious: () => void;
    onClose: () => void;
    isPaused: boolean;
    onPauseToggle: () => void;
    children: React.ReactNode;
  }
