import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const ResetTourButton = () => {
  const { toast } = useToast();

  const handleReset = () => {
    localStorage.removeItem('hasSeenWelcomeTour');
    localStorage.removeItem('completedTutorials');
    
    toast({
      title: 'Tours reiniciados',
      description: 'Todos los tours volverán a mostrarse. Recarga la página para ver el tour de bienvenida.',
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reiniciar Tours
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Reiniciar todos los tours?</AlertDialogTitle>
          <AlertDialogDescription>
            Esto eliminará el registro de tours completados y volverán a mostrarse 
            automáticamente cuando visites las páginas correspondientes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset}>
            Reiniciar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
