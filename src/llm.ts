export type LLMProvider = {
  generateDialog(prompt: string): Promise<unknown>;
};

export async function generateDialog(provider: LLMProvider, prompt: string) {
  const value = await provider.generateDialog(prompt);
  return value;
}

// Provider adapters should normalize model output into schema/dialog.schema.json.
// Keep provider credentials outside the canonical dialog JSON.
