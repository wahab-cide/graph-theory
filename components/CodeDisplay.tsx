"use client";
import React from 'react';

interface CodeDisplayProps {
  code: string;
  language?: string;
  highlightedLine?: number;
  className?: string;
}

export default function CodeDisplay({
  code,
  language = 'java',
  highlightedLine,
  className = ''
}: CodeDisplayProps) {
  const lines = code.split('\n');

  // Simple Java syntax highlighting
  const highlightJavaSyntax = (line: string): React.ReactNode => {
    // Keywords
    const keywords = /\b(public|private|protected|static|final|class|interface|extends|implements|import|package|return|if|else|for|while|do|switch|case|break|continue|new|this|super|void|int|double|float|long|short|byte|char|boolean|String|List|Map|Set|ArrayList|HashMap|HashSet|PriorityQueue|Queue|Deque|Arrays|Collections|Math|System|Object|Exception|try|catch|finally|throw|throws)\b/g;

    // Comments
    const singleLineComment = /\/\/.*/g;

    // Strings
    const stringPattern = /"([^"\\]|\\.)*"/g;

    // Numbers
    const numberPattern = /\b\d+(\.\d+)?\b/g;

    // Annotations
    const annotationPattern = /@\w+/g;

    const result: React.ReactNode[] = [];
    let lastIndex = 0;
    const segments: Array<{start: number, end: number, type: string}> = [];

    // Find all matches
    const findMatches = (pattern: RegExp, type: string) => {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        segments.push({
          start: match.index,
          end: match.index + match[0].length,
          type
        });
      }
    };

    findMatches(stringPattern, 'string');
    findMatches(singleLineComment, 'comment');
    findMatches(keywords, 'keyword');
    findMatches(numberPattern, 'number');
    findMatches(annotationPattern, 'annotation');

    // Sort segments by start position
    segments.sort((a, b) => a.start - b.start);

    // Remove overlapping segments (prioritize comments and strings)
    const filteredSegments: typeof segments = [];
    for (let i = 0; i < segments.length; i++) {
      const current = segments[i];
      const hasOverlap = filteredSegments.some(seg =>
        (current.start >= seg.start && current.start < seg.end) ||
        (current.end > seg.start && current.end <= seg.end)
      );

      if (!hasOverlap) {
        filteredSegments.push(current);
      }
    }

    // Build the result
    filteredSegments.forEach((segment, index) => {
      // Add text before this segment
      if (segment.start > lastIndex) {
        result.push(
          <span key={`text-${index}`} className="text-gray-300">
            {line.substring(lastIndex, segment.start)}
          </span>
        );
      }

      // Add the highlighted segment
      const text = line.substring(segment.start, segment.end);
      const colorClass = {
        keyword: 'text-purple-400',
        string: 'text-green-400',
        comment: 'text-gray-500 italic',
        number: 'text-blue-400',
        annotation: 'text-yellow-400'
      }[segment.type] || 'text-gray-300';

      result.push(
        <span key={`segment-${index}`} className={colorClass}>
          {text}
        </span>
      );

      lastIndex = segment.end;
    });

    // Add remaining text
    if (lastIndex < line.length) {
      result.push(
        <span key="remaining" className="text-gray-300">
          {line.substring(lastIndex)}
        </span>
      );
    }

    return result.length > 0 ? result : <span className="text-gray-300">{line}</span>;
  };

  return (
    <div className={`bg-gray-950 rounded-lg border border-gray-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-sm text-gray-400 ml-2 font-mono">
            {language === 'java' ? 'Algorithm.java' : `code.${language}`}
          </span>
        </div>
        <div className="text-xs text-gray-500 font-mono">
          {lines.length} lines
        </div>
      </div>

      {/* Code Content */}
      <div className="overflow-auto max-h-[600px]">
        <pre className="p-4 text-sm font-mono leading-relaxed">
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            const isHighlighted = highlightedLine === lineNumber;

            return (
              <div
                key={index}
                className={`flex ${
                  isHighlighted
                    ? 'bg-blue-500/10 border-l-2 border-blue-500'
                    : ''
                }`}
              >
                {/* Line number */}
                <span
                  className={`select-none inline-block w-12 text-right mr-4 ${
                    isHighlighted ? 'text-blue-400' : 'text-gray-600'
                  }`}
                >
                  {lineNumber}
                </span>

                {/* Code line */}
                <span className="flex-1 pr-4">
                  {line.trim() === '' ? '\u00A0' : highlightJavaSyntax(line)}
                </span>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
