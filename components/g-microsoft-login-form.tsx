"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import LoadingDots from "@/components/loading-dots";
import { Icons } from "./icons";  // Ensure you have a suitable Microsoft icon here

export default function MicrosoftLoginForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        await signIn("microsoft", {
          redirect: false,
          callbackUrl: searchParams?.get("from") || "/welcome",
        });
      }}
      className="flex flex-col space-y-4 px-4 sm:px-16"
    >
      <button
        disabled={loading}
        className={`${loading
          ? "cursor-not-allowed border-gray-200 bg-gray-100"
          : "border-black bg-black text-white hover:bg-white hover:text-black"
          } flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none`}
      >
        {loading ? (
          <LoadingDots color="#808080" />
        ) : (
          <div className="flex flex-row">
            <Icons.microsoft className="mr-2 h-4 w-4" />
            <p>Sign In With Microsoft</p>
          </div>
        )}
      </button>
    </form>
  );
}
