import { useEffect, useRef, useState, type ReactNode } from 'react';

import parse from 'html-react-parser';

import {
  createHighlighter,
  createSingletonShorthands,
  type Highlighter,
} from 'shiki';

import type {
  LanguageRegistration,
  ShikiLanguageRegistration,
} from './customTypes';

import type {
  Language,
  Theme,
  HighlighterOptions,
  TimeoutState,
} from './types';

import {
  removeTabIndexFromPre,
  throttleHighlighting,
  resolveLanguage,
} from './utils';

// Use Shiki managed singleton for bundled languages, create a fresh instance for custom languages
const highlighter = createSingletonShorthands(createHighlighter);
const customHighlighterCache = new Map<string, Promise<Highlighter>>();

/**
 * A React hook that provides syntax highlighting using Shiki.
 * Supports optional throttled highlights and custom themes.
 *
 * @example
 * const highlightedCode = useShikiHighlighter(code, language, theme, {
 *   transformers: [removeTabIndexFromPre],
 *   delay: 150
 *   customLanguages: ['bosque', 'mcfunction']
 * });
 */
export const useShikiHighlighter = (
  code: string,
  lang: Language,
  theme: Theme,
  options: HighlighterOptions = {}
) => {
  const [highlightedCode, setHighlightedCode] =
    useState<ReactNode | null>(null);

  // Setup themeKey for highlighter caching, checks if theme is string (builtin) or object (custom)
  const themeKey = typeof theme === 'string' ? theme : theme.name;

  const normalizedCustomLanguages: LanguageRegistration[] =
    options.customLanguages
      ? Array.isArray(options.customLanguages)
        ? options.customLanguages
        : [options.customLanguages]
      : [];

  const { isCustom, languageId, resolvedLanguage } = resolveLanguage(
    lang,
    normalizedCustomLanguages
  );

  const timeoutControl = useRef<TimeoutState>({
    nextAllowedTime: 0,
    timeoutId: undefined,
  });

  const getCachedCustomHighlighter = async (
    cacheKey: string,
    customLang: LanguageRegistration | typeof lang
  ) => {
    let instance = customHighlighterCache.get(cacheKey);
    if (!instance) {
      instance = createHighlighter({
        langs: [customLang as ShikiLanguageRegistration],
        themes: [theme],
      });
      customHighlighterCache.set(cacheKey, instance);
    }
    return instance;
  };

  useEffect(() => {
    let isMounted = true;

    const transformers = [
      removeTabIndexFromPre,
      ...(options.transformers || []),
    ];

    const highlightCode = async () => {
      const codeHighlighter =
        isCustom && resolvedLanguage
          ? await getCachedCustomHighlighter(
              `${resolvedLanguage.name}--${themeKey}`,
              resolvedLanguage
            )
          : highlighter;

      const html = await codeHighlighter.codeToHtml(code, {
        lang: languageId,
        theme,
        transformers,
      });

      if (isMounted) {
        setHighlightedCode(parse(html));
      }
    };

    if (options.delay) {
      throttleHighlighting(highlightCode, timeoutControl, options.delay);
    } else {
      highlightCode().catch(console.error);
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutControl.current.timeoutId);
    };
  }, [code, lang, theme]);

  return highlightedCode;
};
