import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

const postLoginSteps: Step[] = [
  {
    target: 'body',
    content: '¡Bienvenido al Sistema de Evaluación Educativa! Te guiaremos en un recorrido rápido por las principales funcionalidades del panel de control.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="children-card"]',
    content: 'Aquí puedes gestionar a tus aprendientes: agregar nuevos estudiantes, ver sus perfiles y acceder a su historial académico.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="evaluations-card"]',
    content: 'Realiza evaluaciones de motricidad fina. La IA clasifica automáticamente los resultados en niveles bajo, medio y alto.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="reports-card"]',
    content: 'Genera reportes detallados con análisis de competencias, predicciones de progreso y recomendaciones personalizadas.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="questionnaires-card"]',
    content: 'Aplica cuestionarios especializados: Cornell (hábitos de estudio), CHAEA (estilos de aprendizaje) y TAM (modalidades sensoriales).',
    placement: 'bottom',
  },
  {
    target: '[data-tour="theme-toggle"]',
    content: 'Cambia entre modo claro y oscuro según tu preferencia.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="profile-button"]',
    content: 'Accede a tu perfil para actualizar tu información personal y configuraciones.',
    placement: 'bottom',
  },
  {
    target: 'body',
    content: '¡Listo! Ya conoces las funcionalidades principales. Puedes reiniciar este tutorial en cualquier momento usando el botón de ayuda flotante.',
    placement: 'center',
  },
];

export const PostLoginTour = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if this is the first login (user hasn't seen post-login tour)
    const hasSeenPostLoginTour = localStorage.getItem('hasSeenPostLoginTour');
    
    if (!hasSeenPostLoginTour) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setRun(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('hasSeenPostLoginTour', 'true');
    }
  };

  return (
    <Joyride
      steps={postLoginSteps}
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
        last: 'Finalizar',
        next: 'Siguiente',
        open: 'Abrir',
        skip: 'Omitir tour',
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
  );
};
