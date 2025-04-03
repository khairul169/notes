import React, { useMemo } from "react";
import {
  codeBlockPlugin,
  codeMirrorPlugin,
  MDXEditor,
  MDXEditorMethods,
} from "@mdxeditor/editor";
import {
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
} from "@mdxeditor/editor";
import { cn } from "@/lib/utils";
import { nord } from "cm6-theme-nord";
import { useStore } from "zustand";
import settingsStore from "@/stores/settings.store";

export type MarkdownEditorProps = React.ComponentProps<typeof MDXEditor>;

export type MarkdownEditorRef = MDXEditorMethods;

export default function MarkdownEditor({
  plugins = [],
  className,
  contentEditableClassName,
  ...props
}: MarkdownEditorProps) {
  const theme = useStore(settingsStore, (i) => i.theme);

  const defaultPlugins = useMemo(
    () => [
      headingsPlugin(),
      listsPlugin(),
      linkPlugin({ disableAutoLink: true }),
      quotePlugin(),
      thematicBreakPlugin(),
      codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
      codeMirrorPlugin({
        codeBlockLanguages: {
          js: "Javascript",
          ts: "Typescript",
          css: "CSS",
          shell: "Shell",
          sql: "SQL",
          json: "JSON",
        },
        codeMirrorExtensions: theme === "dark" ? [nord] : undefined,
      }),
      markdownShortcutPlugin(),
    ],
    [theme]
  );

  return (
    <MDXEditor
      {...props}
      plugins={[...defaultPlugins, ...plugins]}
      className={cn(
        // "overflow-hidden [&_.mdxeditor-root-contenteditable]:h-full [&_.mdxeditor-root-contenteditable_>_div]:h-full",
        className
      )}
      contentEditableClassName={cn(
        "dark:!text-on-surface prose dark:prose-invert",
        contentEditableClassName
      )}
    />
  );
}
