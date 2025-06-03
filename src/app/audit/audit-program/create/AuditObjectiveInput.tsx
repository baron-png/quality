"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import Blockquote from "@tiptap/extension-blockquote";
import Link from "@tiptap/extension-link";
import History from "@tiptap/extension-history";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import {
  FaBold, FaItalic, FaUnderline, FaListOl, FaListUl, FaQuoteRight, FaLink, FaUndo, FaRedo,
  FaHeading, FaCode, FaHighlighter, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify, FaMinus
} from "react-icons/fa";
import { MdFormatColorText } from "react-icons/md";
import { useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function AuditObjectiveInput({ value, onChange }: Props) {
  const inputFile = useRef<HTMLInputElement>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isHighlightPickerOpen, setIsHighlightPickerOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      Blockquote,
      Link,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Color,
      Highlight,
      HorizontalRule,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base focus:outline-none min-h-[120px] p-4 border border-gray-300 rounded-b-lg bg-white",
      },
    },
  });

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    editor?.chain().focus().setColor(e.target.value).run();
    setIsColorPickerOpen(false);
  };

  const handleHighlightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    editor?.chain().focus().setHighlight({ color: e.target.value }).run();
    setIsHighlightPickerOpen(false);
  };

  const setLink = () => {
    const url = window.prompt("Enter URL");
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-2 font-medium text-gray-700 text-sm">
        Objectives
      </label>
      <div className="border border-gray-300 rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-300 rounded-t-lg">
          {/* Text Styling Group */}
          <div className="flex items-center gap-1 bg-white rounded-md p-1 shadow-sm">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive("bold") ? "bg-gray-200" : ""}`}
              title="Bold"
            >
              <FaBold />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive("italic") ? "bg-gray-200" : ""}`}
              title="Italic"
            >
              <FaItalic />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive("underline") ? "bg-gray-200" : ""}`}
              title="Underline"
            >
              <FaUnderline />
            </button>
          </div>

          {/* Heading Dropdown */}
          <div className="relative">
            <select
              onChange={(e) => {
                const level = parseInt(e.target.value) as 1 | 2 | 3;
                editor?.chain().focus().toggleHeading({ level }).run();
              }}
              className="p-2 bg-white rounded-md shadow-sm hover:bg-gray-100 focus:outline-none"
              title="Heading Level"
            >
              <option value="">Paragraph</option>
              <option value="1">Heading 1</option>
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
            </select>
          </div>

          {/* List Group */}
          <div className="flex items-center gap-1 bg-white rounded-md p-1 shadow-sm">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive("bulletList") ? "bg-gray-200" : ""}`}
              title="Bulleted List"
            >
              <FaListUl />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive("orderedList") ? "bg-gray-200" : ""}`}
              title="Numbered List"
            >
              <FaListOl />
            </button>
          </div>

          {/* Alignment Group */}
          <div className="flex items-center gap-1 bg-white rounded-md p-1 shadow-sm">
            <button
              type="button"
              onClick={() => editor?.chain().focus().setTextAlign("left").run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""}`}
              title="Align Left"
            >
              <FaAlignLeft />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().setTextAlign("center").run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""}`}
              title="Align Center"
            >
              <FaAlignCenter />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().setTextAlign("right").run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""}`}
              title="Align Right"
            >
              <FaAlignRight />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive({ textAlign: "justify" }) ? "bg-gray-200" : ""}`}
              title="Justify"
            >
              <FaAlignJustify />
            </button>
          </div>

          {/* Miscellaneous Group */}
          <div className="flex items-center gap-1 bg-white rounded-md p-1 shadow-sm">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive("blockquote") ? "bg-gray-200" : ""}`}
              title="Blockquote"
            >
              <FaQuoteRight />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive("codeBlock") ? "bg-gray-200" : ""}`}
              title="Code Block"
            >
              <FaCode />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}
              className="p-2 rounded hover:bg-gray-100"
              title="Horizontal Rule"
            >
              <FaMinus />
            </button>
            <button
              type="button"
              onClick={setLink}
              className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive("link") ? "bg-gray-200" : ""}`}
              title="Insert Link"
            >
              <FaLink />
            </button>
          </div>

          {/* Color Pickers */}
          <div className="flex items-center gap-1 bg-white rounded-md p-1 shadow-sm">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                className="p-2 rounded hover:bg-gray-100"
                title="Text Color"
              >
                <MdFormatColorText />
              </button>
              {isColorPickerOpen && (
                <input
                  type="color"
                  className="absolute top-10 left-0 z-10"
                  onChange={handleColorChange}
                />
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsHighlightPickerOpen(!isHighlightPickerOpen)}
                className="p-2 rounded hover:bg-gray-100"
                title="Highlight"
              >
                <FaHighlighter />
              </button>
              {isHighlightPickerOpen && (
                <input
                  type="color"
                  className="absolute top-10 left-0 z-10"
                  onChange={handleHighlightChange}
                />
              )}
            </div>
          </div>

          {/* History Group */}
          <div className="flex items-center gap-1 bg-white rounded-md p-1 shadow-sm">
            <button
              type="button"
              onClick={() => editor?.chain().focus().undo().run()}
              className="p-2 rounded hover:bg-gray-100"
              title="Undo"
            >
              <FaUndo />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().redo().run()}
              className="p-2 rounded hover:bg-gray-100"
              title="Redo"
            >
              <FaRedo />
            </button>
          </div>
        </div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}