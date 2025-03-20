import React from "react";
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

export type MarkdownEditorProps = React.ComponentProps<typeof MDXEditor>;

export type MarkdownEditorRef = MDXEditorMethods;

const defaultPlugins = [
  headingsPlugin(),
  listsPlugin(),
  linkPlugin(),
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
  }),
  markdownShortcutPlugin(),
];

export default function MarkdownEditor({
  plugins = [],
  className,
  contentEditableClassName,
  ...props
}: MarkdownEditorProps) {
  return (
    <MDXEditor
      {...props}
      plugins={[...defaultPlugins, ...plugins]}
      className={cn(
        "[&_.mdxeditor-root-contenteditable]:h-full [&_.mdxeditor-root-contenteditable_>_div]:h-full",
        className
      )}
      contentEditableClassName={cn(
        "dark:!text-on-surface prose dark:prose-invert",
        contentEditableClassName
      )}
    />
  );
}
