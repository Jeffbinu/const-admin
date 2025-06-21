"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "./Button";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start typing...",
  height = "300px",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value;
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertVariable = (variable: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      span.className =
        "variable-placeholder bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium";
      span.textContent = variable;
      span.contentEditable = "false";
      range.deleteContents();
      range.insertNode(span);
      range.setStartAfter(span);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      handleInput();
    }
  };

  const variables = [
    "{{PROJECT_NAME}}",
    "{{CLIENT_NAME}}",
    "{{CLIENT_ADDRESS}}",
    "{{PROJECT_DURATION}}",
    "{{ESTIMATED_BUDGET}}",
    "{{AGREEMENT_DATE}}",
    "{{NUMBER_OF_FLOORS}}",
    "{{PROJECT_TYPE}}",
    "{{ESTIMATION_TABLE}}",
  ];

  return (
    <div className="border border-gray-300 rounded-lg">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => executeCommand("bold")}
            className="p-2"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => executeCommand("italic")}
            className="p-2"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => executeCommand("underline")}
            className="p-2"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => executeCommand("justifyLeft")}
            className="p-2"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => executeCommand("justifyCenter")}
            className="p-2"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => executeCommand("justifyRight")}
            className="p-2"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => executeCommand("insertUnorderedList")}
            className="p-2"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => executeCommand("insertOrderedList")}
            className="p-2"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <select
          onChange={(e) => executeCommand("fontSize", e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="3">Normal</option>
          <option value="4">Large</option>
          <option value="5">Larger</option>
          <option value="6">X-Large</option>
        </select>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Variable Dropdown */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              insertVariable(e.target.value);
              e.target.value = "";
            }
          }}
          className="text-sm border border-gray-300 rounded px-2 py-1 min-w-[140px]"
        >
          <option value="">Insert Variable</option>
          {variables.map((variable) => (
            <option key={variable} value={variable}>
              {variable}
            </option>
          ))}
        </select>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-4 outline-none min-h-[200px] prose max-w-none"
        style={{ height }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        .variable-placeholder {
          display: inline-block;
          margin: 0 2px;
        }
      `}</style>
    </div>
  );
};
