import { Suspense } from "react";

import { LoginView } from "@/views/LoginView";

// Suspense boundary: LoginView reads ?next= via useSearchParams.
export default function LoginPage() {
  return (
    <Suspense>
      <LoginView />
    </Suspense>
  );
}
