import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TutorialButtonProps {
  onClick: () => void;
}

export const TutorialButton: React.FC<TutorialButtonProps> = ({ onClick }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onClick}
            className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Iniciar tutorial interactivo</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
