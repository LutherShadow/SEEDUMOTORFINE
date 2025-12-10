import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export interface ReportSection {
  id: string;
  title: string;
  enabled: boolean;
  required?: boolean;
}

interface ReportSectionEditorProps {
  sections: ReportSection[];
  onSectionsChange: (sections: ReportSection[]) => void;
}

interface SortableItemProps {
  section: ReportSection;
  onToggle: (id: string) => void;
}

function SortableItem({ section, onToggle }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-card border rounded-lg w-full ${isDragging ? "shadow-lg z-50" : ""
        }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
      >
        <GripVertical className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{section.title}</p>
        {section.required && (
          <p className="text-xs text-muted-foreground">Requerida</p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {section.enabled ? (
          <Eye className="h-4 w-4 text-primary hidden sm:block" />
        ) : (
          <EyeOff className="h-4 w-4 text-muted-foreground hidden sm:block" />
        )}
        <Switch
          checked={section.enabled}
          onCheckedChange={() => !section.required && onToggle(section.id)}
          disabled={section.required}
        />
      </div>
    </div>
  );
}

export const ReportSectionEditor: React.FC<ReportSectionEditorProps> = ({
  sections,
  onSectionsChange,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      onSectionsChange(newSections);
    }
  };

  const handleToggle = (id: string) => {
    const newSections = sections.map((section) =>
      section.id === id ? { ...section, enabled: !section.enabled } : section
    );
    onSectionsChange(newSections);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Orden de Secciones</h3>
        <p className="text-xs text-muted-foreground">
          Arrastra para reorganizar. Desactiva las secciones que no desees incluir.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sections.map((section) => (
              <SortableItem
                key={section.id}
                section={section}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </Card>
  );
};
