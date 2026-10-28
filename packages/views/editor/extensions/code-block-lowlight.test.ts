import { afterEach, describe, expect, it } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Markdown } from "@tiptap/markdown";
import { codeLowlight } from "../syntax-highlight";

let editor: Editor | null = null;

function makeEditor(markdown: string): Editor {
  const element = document.createElement("div");
  document.body.appendChild(element);
  editor = new Editor({
    element,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight: codeLowlight }),
      Markdown,
    ],
  });
  editor.commands.setContent(markdown, { contentType: "markdown" });
  return editor;
}

/** Token spans that the code block highlighter mounted into the editor DOM. */
function highlightSpanCount(e: Editor): number {
  return e.view.dom.querySelectorAll("[class*='hljs']").length;
}

afterEach(() => {
  editor?.destroy();
  editor = null;
});

describe("code block highlighting in the editor", () => {
  it("mounts no token spans for a long html block", () => {
    const page = Array.from({ length: 200 }, (_, i) => `<p class="row">Row ${i}</p>`).join("\n");

    const e = makeEditor("```html\n" + page + "\n```");

    expect(e.state.doc.firstChild?.attrs.language).toBe("html");
    expect(highlightSpanCount(e)).toBe(0);
  });

  it("still mounts token spans for other languages", () => {
    const e = makeEditor("```typescript\nconst answer: number = 42;\n```");

    expect(highlightSpanCount(e)).toBeGreaterThan(0);
  });
});
