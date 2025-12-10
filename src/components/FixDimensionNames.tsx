import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

export function FixDimensionNames() {
  const [isFixing, setIsFixing] = useState(false);

  const fixDimensionNames = async () => {
    setIsFixing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      // Fetch all user's responses
      const { data: responses, error: responsesError } = await supabase
        .from("questionnaire_responses")
        .select("*")
        .eq("evaluator_id", user.id);

      if (responsesError) throw responsesError;

      let updatedCount = 0;

      for (const response of responses || []) {
        let needsUpdate = false;
        let dominantName = response.dominant_dimension;
        let secondaryName = response.secondary_dimension;

        // Fetch dimensions for this questionnaire
        const { data: dimensions } = await supabase
          .from("questionnaire_dimensions")
          .select("id, name")
          .eq("questionnaire_id", response.questionnaire_id);

        if (dimensions) {
          const dimensionMap = new Map(dimensions.map((d) => [d.id, d.name]));

          // Check if dominant_dimension is a UUID and convert it
          if (response.dominant_dimension && dimensionMap.has(response.dominant_dimension)) {
            dominantName = dimensionMap.get(response.dominant_dimension);
            needsUpdate = true;
          }

          // Check if secondary_dimension is a UUID and convert it
          if (response.secondary_dimension && dimensionMap.has(response.secondary_dimension)) {
            secondaryName = dimensionMap.get(response.secondary_dimension);
            needsUpdate = true;
          }

          // Update if needed
          if (needsUpdate) {
            const { error: updateError } = await supabase
              .from("questionnaire_responses")
              .update({
                dominant_dimension: dominantName,
                secondary_dimension: secondaryName,
              })
              .eq("id", response.id);

            if (updateError) {
              console.error("Error updating response:", updateError);
            } else {
              updatedCount++;
            }
          }
        }
      }

      toast.success(`Se actualizaron ${updatedCount} registros exitosamente`);
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      console.error("Error fixing dimension names:", error);
      toast.error("Error al actualizar los registros: " + error.message);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={fixDimensionNames}
      disabled={isFixing}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isFixing ? 'animate-spin' : ''}`} />
      {isFixing ? "Actualizando..." : "Actualizar Nombres"}
    </Button>
  );
}
