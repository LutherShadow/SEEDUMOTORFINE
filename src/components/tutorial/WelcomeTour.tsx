import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useNavigate } from 'react-router-dom';

const welcomeSteps: Step[] = [
  {
    target: 'body',
    content: 'Paso 1 de 4: ¡Bienvenido a la Plataforma de Evaluación Educativa! Te guiaremos en un recorrido rápido para que conozcas las principales funcionalidades.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="hero-section"]',
    content: 'Paso 2 de 4: Esta es tu plataforma integral para evaluar el desarrollo motor fino y estilos de aprendizaje de los estudiantes.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="features-section"]',
    content: 'Paso 3 de 4: Aquí encontrarás las principales características de la plataforma: gestión de alumnos, evaluaciones, cuestionarios especializados y reportes detallados.',
    placement: 'top',
  },
  {
    target: '[data-tour="login-button"]',
    content: 'Paso 4 de 4: Para comenzar, inicia sesión o regístrate haciendo clic aquí. ¡Vamos a empezar!',
    placement: 'bottom',
  },
];

export const WelcomeTour = () => {
  const [run, setRun] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is the first visit
    const hasSeenTour = localStorage.getItem('hasSeenWelcomeTour');
    const completedTutorials = localStorage.getItem('completedTutorials');
    
    // Only show if user hasn't seen the tour and hasn't completed any other tutorials
    if (!hasSeenTour && !completedTutorials) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('hasSeenWelcomeTour', 'true');
      
      // If tour was completed (not skipped), navigate to auth
      if (status === STATUS.FINISHED) {
        navigate('/auth');
      }
    }
  };

  return (
    <Joyride
      steps={welcomeSteps}
      run={run}
      continuous
      showProgress={false}
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          textColor: 'hsl(var(--foreground))',
          backgroundColor: 'hsl(var(--background))',
          overlayColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '8px',
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          padding: '8px 16px',
          borderRadius: '6px',
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          marginRight: '10px',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
        },
      }}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Comenzar',
        next: 'Siguiente',
        open: 'Abrir',
        skip: 'Omitir tour',
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
  );
};
