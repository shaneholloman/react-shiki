import type {
  BundledLanguage,
  SpecialLanguage,
  BundledTheme,
  ShikiTransformer,
  CodeOptionsMultipleThemes,
  CodeToHastOptionsCommon,
  ThemeRegistrationAny,
  StringLiteralUnion,
} from 'shiki';

import type { LanguageRegistration } from './customTypes';

/**
 * A Shiki BundledLanguage or a custom textmate grammar object
 * @see https://shiki.style/languages
 */
type Language =
  | BundledLanguage
  | LanguageRegistration
  | SpecialLanguage
  | (string & {})
  | undefined;

/**
 * A Shiki BundledTheme or a custom textmate theme object
 * @see https://shiki.style/themes
 */
type Theme = ThemeRegistrationAny | StringLiteralUnion<BundledTheme>;

/**
 * A map of color names to themes.
 * This allows you to specify multiple themes for the generated code.
 * Supports custom textmate theme objects in addition to Shiki's bundled themes
 *
 * @example
 * ```ts
 * useShikiHighlighter(code, language, {
 *   light: 'github-light',
 *   dark: 'github-dark',
 *   dim: 'github-dark-dimmed'
 * })
 * ```
 *
 * @see https://shiki.style/guide/dual-themes
 */
type Themes = {
  [key: string]: ThemeRegistrationAny | StringLiteralUnion<BundledTheme>;
};

/**
 * Configuration options specific to react-shiki
 */
type ReactShikiOptions = {
  /**
   * Minimum time (in milliseconds) between highlight operations.
   * @default undefined (no throttling)
   */
  delay?: number;

  /**
   * Custom textmate grammars to be preloaded for highlighting.
   */
  customLanguages?: LanguageRegistration | LanguageRegistration[];
};

/**
 * Configuration options for the syntax highlighter
 */
type HighlighterOptions = ReactShikiOptions &
  Pick<
    CodeOptionsMultipleThemes<BundledTheme>,
    'defaultColor' | 'cssVariablePrefix'
  > &
  Pick<CodeToHastOptionsCommon, 'transformers'>;

/**
 * State for the throttling logic
 */
type TimeoutState = {
  /**
   * Id of the timeout that is currently scheduled
   */
  timeoutId: NodeJS.Timeout | undefined;
  /**
   * Next time when the timeout can be scheduled
   */
  nextAllowedTime: number;
};

export type { Language, Theme, Themes, HighlighterOptions, TimeoutState };
