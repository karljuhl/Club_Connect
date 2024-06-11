'use server'

import { z } from 'zod';
import { sendFeatureEmail } from "@/lib/emails/send-feature";

// Define a schema for the incoming request body
const SuggestionSchema = z.object({
    suggestion: z.string().min(1, "Suggestion cannot be empty"),
});

export async function submitSuggestion(formData: FormData) {
    const rawFormData = {
        suggestion: formData.get('suggestion'),
    };

    const validatedData = SuggestionSchema.parse(rawFormData);
    await sendFeatureEmail(validatedData.suggestion);
    // Handle response or revalidation if needed
}
