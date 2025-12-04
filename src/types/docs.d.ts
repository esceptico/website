declare module 'katex' {
  export function renderToString(
    tex: string,
    options?: {
      displayMode?: boolean;
      throwOnError?: boolean;
      errorColor?: string;
      macros?: Record<string, string>;
      trust?: boolean;
      strict?: boolean | string;
    }
  ): string;
}
