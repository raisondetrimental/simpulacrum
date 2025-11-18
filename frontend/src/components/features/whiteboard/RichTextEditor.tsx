/**
 * Rich Text Editor Component
 * Powered by Tiptap - supports bold, italic, underline, bullet points
 */
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  disabled = false,
  minHeight = '200px',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Explicitly configure to avoid duplicate warnings
      }),
      Underline.configure(),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none p-4',
        style: `min-height: ${minHeight}`,
      },
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-md bg-white">
      {/* Toolbar */}
      {!disabled && (
        <div className="flex items-center gap-1 p-2 border-b border-gray-300 bg-gray-50 flex-wrap">
          {/* Bold */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              editor.isActive('bold')
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              editor.isActive('italic')
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              editor.isActive('underline')
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
            title="Underline (Ctrl+U)"
          >
            <u>U</u>
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Bullet List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              editor.isActive('bulletList')
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
            title="Bullet List"
          >
            • List
          </button>

          {/* Numbered List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              editor.isActive('orderedList')
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
            title="Numbered List"
          >
            1. List
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Clear Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            className="px-3 py-1.5 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 transition-colors"
            title="Clear Formatting"
          >
            Clear
          </button>
        </div>
      )}

      {/* Editor Content */}
      <div className={`${disabled ? 'bg-gray-50' : 'bg-white'}`} style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>

      {/* Character/Word Count (optional) */}
      {!disabled && (
        <div className="flex justify-end p-2 border-t border-gray-300 bg-gray-50 text-xs text-gray-500">
          <span>{editor.storage.characterCount?.characters() || 0} characters</span>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
