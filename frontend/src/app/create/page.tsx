import { RequireAuth } from "@/components/auth/RequireAuth";
import { CreateRecipeView } from "@/views/CreateRecipeView";

export default function CreatePage() {
  return (
    <RequireAuth>
      <CreateRecipeView />
    </RequireAuth>
  );
}
