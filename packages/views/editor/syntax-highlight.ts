import { common, createLowlight } from "lowlight";

const baseLowlight = createLowlight(common);

/**
 * Languages the editor shows as plaintext. An html fence is usually a rendered
 * page. The editor keeps the source mounted even while the preview shows, so
 * highlighting it mounts one span per token and long pages hang the editor.
 * The preview already shows the markup, so the editor needs no colors for it.
 */
const EDITOR_PLAINTEXT_LANGUAGES = new Set(["html"]);

/**
 * Tiptap calls `highlightAuto` whenever a code fence has no registered
 * language. Auto-detection runs every registered grammar over the full block,
 * which makes large documents expensive to mount. Preserve the interface but
 * make that fallback deterministic and cheap: explicit known languages are
 * still highlighted, while unlabelled or unknown blocks stay plaintext.
 */
export const codeLowlight: ReturnType<typeof createLowlight> = {
  ...baseLowlight,
  highlight(language, value) {
    const normalizedLanguage = language.trim().toLowerCase();
    const grammar = EDITOR_PLAINTEXT_LANGUAGES.has(normalizedLanguage) ? "plaintext" : language;

    return baseLowlight.highlight(grammar, value);
  },
  highlightAuto(value) {
    return baseLowlight.highlight("plaintext", value);
  },
};

export function highlightCode(value: string, language?: string) {
  const normalizedLanguage = language?.trim().toLowerCase();

  return normalizedLanguage && baseLowlight.registered(normalizedLanguage)
    ? baseLowlight.highlight(normalizedLanguage, value)
    : baseLowlight.highlight("plaintext", value);
}
