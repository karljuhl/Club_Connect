// EmailLoginForm.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import LoadingDots from "@/components/loading-dots";
import { Icons } from "@/components/icons";

export default function EmailLoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        await signIn("email", {
          email,
          redirect: false,
          callbackUrl: searchParams?.get("from") || "/welcome",
        });
        setLoading(false);
      }}
      className="flex flex-col space-y-4 px-4 mt-4 mb-8 sm:px-16"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className="w-full px-4 py-2 border rounded-md"
      />
      <button
        disabled={loading || !email}
        className={`${loading
          ? "cursor-not-allowed border-gray-200 bg-gray-100"
          : "border-blue-500 bg-blue-500 text-white hover:bg-blue-600"
          } flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none`}
      >
        {loading ? (
          <LoadingDots color="#808080" />
        ) : (
          <div className="flex flex-row">
            <Icons.email className="mr-2 h-4 w-4" />
            <p>Magic Link</p>
          </div>
        )}
      </button>
    </form>
  );
}
