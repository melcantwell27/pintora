import { Suspense } from "react";

import { SignupView } from "@/views/SignupView";

// Suspense boundary: SignupView reads ?next= via useSearchParams.
export default function SignupPage() {
  return (
    <Suspense>
      <SignupView />
    </Suspense>
  );
}
