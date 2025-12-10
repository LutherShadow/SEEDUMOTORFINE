import React, { createContext, useContext, useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useLocation } from 'react-router-dom';

interface TutorialContextType {
  startTutorial: (steps: Step[]) => void;
  skipTutorial: () => void;
  isTutorialActive: boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
};

interface TutorialProviderProps {
  children: React.ReactNode;
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [run, setRun] = useState(false);
  const location = useLocation();

  const startTutorial = (tutorialSteps: Step[]) => {
    // Check if tutorials are enabled
    const tutorialsEnabled = localStorage.getItem('tutorialsEnabled') !== 'false';
    if (!tutorialsEnabled) return;
    
    setSteps(tutorialSteps);
    setRun(true);
  };

  const skipTutorial = () => {
    setRun(false);
    setSteps([]);
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      // Store completion in localStorage
      const currentPath = location.pathname;
      const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
      if (!completedTutorials.includes(currentPath)) {
        localStorage.setItem('completedTutorials', JSON.stringify([...completedTutorials, currentPath]));
      }
    }
  };

  useEffect(() => {
    // Reset tutorial when route changes
    setRun(false);
  }, [location.pathname]);

  return (
    <TutorialContext.Provider
      value={{
        startTutorial,
        skipTutorial,
        isTutorialActive: run,
      }}
    >
      <Joyride
        steps={steps}
        run={run}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: 'hsl(var(--primary))',
            textColor: 'hsl(var(--foreground))',
            backgroundColor: 'hsl(var(--background))',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: '8px',
          },
          buttonNext: {
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
          },
          buttonBack: {
            color: 'hsl(var(--muted-foreground))',
          },
        }}
        locale={{
          back: 'Atrás',
          close: 'Cerrar',
          last: 'Finalizar',
          next: 'Siguiente',
          open: 'Abrir',
          skip: 'Saltar tutorial',
          nextLabelWithProgress: 'Siguiente (Paso {step} de {steps})',
        }}
        floaterProps={{
          disableAnimation: false,
          styles: {
            arrow: {
              length: 8,
              spread: 16
            }
          }
        }}
      />
      {children}
    </TutorialContext.Provider>
  );
};
