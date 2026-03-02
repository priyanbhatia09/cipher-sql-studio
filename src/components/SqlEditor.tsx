import React from 'react';
import Editor from '@monaco-editor/react';

interface SqlEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

export default function SqlEditor({ value, onChange }: SqlEditorProps) {
  return (
    <div className="h-full w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <Editor
        height="100%"
        defaultLanguage="sql"
        value={value}
        onChange={onChange}
        theme="light"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
}
