"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { type JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

function ToolbarButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-teal-100 text-teal-900"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );
}

export default function RichTextEditor({
  label,
  content,
  onChange,
}: {
  label: string;
  content: JSONContent;
  onChange: (content: JSONContent) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
    ],
    content,
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getJSON()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-48 px-4 py-3 text-slate-700 focus:outline-none",
      },
    },
  });

  if (!editor) {
    return (
      <div>
        <p className="mb-1.5 text-xs font-medium text-slate-600">{label}</p>
        <div className="min-h-56 animate-pulse rounded-xl border border-slate-200 bg-slate-50" />
      </div>
    );
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-slate-600">{label}</p>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-100">
        <div className="flex flex-wrap gap-1 border-b border-slate-100 p-2">
          <ToolbarButton
            label="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            label="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            label="H2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          />
          <ToolbarButton
            label="Bullets"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            label="Numbers"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarButton
            label="Link"
            active={editor.isActive("link")}
            onClick={() => {
              const href = window.prompt("Enter the link URL");
              if (!href) return;
              editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
            }}
          />
        </div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
