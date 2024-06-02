// AzureADLoginForm.tsx
"use client";


import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import LoadingDots from "@/components/loading-dots";
import { Icons } from "./icons";  // Ensure you have an appropriate icon for AzureAD

export default function AzureADLoginForm() {
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();

    return (
        <form
            onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                await signIn("azure-ad", {
                    redirect: false,
                    callbackUrl: searchParams?.get("from") || "/welcome",
                });
                setLoading(false);
            }}
            className="flex flex-col space-y-4 px-4 mb-4 sm:px-16"
        >
            <button
                disabled={loading}
                className={`${loading
                    ? "cursor-not-allowed border-gray-200 bg-gray-100"
                    : "border-blue-500 bg-blue-500 text-white hover:bg-blue-600"
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
