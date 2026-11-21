"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  ChevronDown,
  Highlighter,
  Eraser,
  Sparkles,
} from "lucide-react";

/**
 * Helper to convert Markdown to clean semantic HTML
 * Handles ChatGPT markdown copy-paste (headings, bold, lists, quotes, links)
 */
function convertMarkdownToHtml(markdown) {
  if (!markdown) return "";

  const lines = markdown.split(/\r?\n/);
  const processedLines = [];
  let inUl = false;
  let inOl = false;

  for (let rawLine of lines) {
    let line = rawLine.trim();

    // Blank line closes open lists
    if (!line) {
      if (inUl) { processedLines.push("</ul>"); inUl = false; }
      if (inOl) { processedLines.push("</ol>"); inOl = false; }
      continue;
    }

    // Markdown inline styling
    line = line
      .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.*?)__/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      .replace(/~~(.*?)~~/g, "<del>$1</del>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Headings
    if (/^####\s+/.test(line)) {
      if (inUl) { processedLines.push("</ul>"); inUl = false; }
      if (inOl) { processedLines.push("</ol>"); inOl = false; }
      processedLines.push(`<h4>${line.replace(/^####\s+/, "")}</h4>`);
    } else if (/^###\s+/.test(line)) {
      if (inUl) { processedLines.push("</ul>"); inUl = false; }
      if (inOl) { processedLines.push("</ol>"); inOl = false; }
      processedLines.push(`<h3>${line.replace(/^###\s+/, "")}</h3>`);
    } else if (/^##\s+/.test(line)) {
      if (inUl) { processedLines.push("</ul>"); inUl = false; }
      if (inOl) { processedLines.push("</ol>"); inOl = false; }
      processedLines.push(`<h2>${line.replace(/^##\s+/, "")}</h2>`);
    } else if (/^#\s+/.test(line)) {
      if (inUl) { processedLines.push("</ul>"); inUl = false; }
      if (inOl) { processedLines.push("</ol>"); inOl = false; }
      processedLines.push(`<h1>${line.replace(/^#\s+/, "")}</h1>`);
    } else if (/^>\s+/.test(line)) {
      // Blockquote
      if (inUl) { processedLines.push("</ul>"); inUl = false; }
      if (inOl) { processedLines.push("</ol>"); inOl = false; }
      processedLines.push(`<blockquote>${line.replace(/^>\s+/, "")}</blockquote>`);
    } else if (/^[-*•]\s+/.test(line)) {
      // Unordered list item
      if (inOl) { processedLines.push("</ol>"); inOl = false; }
      if (!inUl) { processedLines.push("<ul>"); inUl = true; }
      processedLines.push(`<li>${line.replace(/^[-*•]\s+/, "")}</li>`);
    } else if (/^\d+[.)]\s+/.test(line)) {
      // Ordered list item
      if (inUl) { processedLines.push("</ul>"); inUl = false; }
      if (!inOl) { processedLines.push("<ol>"); inOl = true; }
      processedLines.push(`<li>${line.replace(/^\d+[.)]\s+/, "")}</li>`);
    } else {
      // Standard paragraph
      if (inUl) { processedLines.push("</ul>"); inUl = false; }
      if (inOl) { processedLines.push("</ol>"); inOl = false; }
      processedLines.push(`<p>${line}</p>`);
    }
  }

  if (inUl) processedLines.push("</ul>");
  if (inOl) processedLines.push("</ol>");

  return processedLines.join("");
}

/**
 * Sanitize & clean HTML from ChatGPT or web clipboard
 */
function sanitizePastedHtml(html) {
  if (!html) return "";
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Remove scripts, meta, buttons, styles
    const unwanted = doc.querySelectorAll("script, style, meta, link, object, iframe, button, noscript");
    unwanted.forEach((el) => el.remove());

    const allElements = doc.querySelectorAll("*");
    allElements.forEach((el) => {
      const color = el.style.color;
      const bgColor = el.style.backgroundColor;
      const textAlign = el.style.textAlign;
      const fontWeight = el.style.fontWeight;

      // Strip non-essential attributes
      Array.from(el.attributes).forEach((attr) => {
        if (!["href", "src", "alt", "title", "target", "rel"].includes(attr.name)) {
          el.removeAttribute(attr.name);
        }
      });

      if (color) el.style.color = color;
      if (bgColor) el.style.backgroundColor = bgColor;
      if (textAlign) el.style.textAlign = textAlign;
      if (fontWeight) el.style.fontWeight = fontWeight;

      if (el.tagName === "A") {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      }
    });

    return doc.body.innerHTML;
  } catch {
    return html;
  }
}

const TEXT_COLORS = [
  { label: "Default", color: "#1f2937" },
  { label: "Dark Green", color: "#166534" },
  { label: "Emerald", color: "#059669" },
  { label: "Blue", color: "#2563eb" },
  { label: "Red", color: "#dc2626" },
  { label: "Orange", color: "#ea580c" },
  { label: "Purple", color: "#7c3aed" },
];

const HIGHLIGHT_COLORS = [
  { label: "None", color: "transparent" },
  { label: "Yellow", color: "#fef08a" },
  { label: "Light Green", color: "#bbf7d0" },
  { label: "Light Blue", color: "#bfdbfe" },
  { label: "Light Pink", color: "#fbcfe8" },
  { label: "Light Orange", color: "#fed7aa" },
];

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write product description here...",
  minHeight = "240px",
  label = "Description",
}) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [activeFormat, setActiveFormat] = useState("Paragraph");
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showHighlightDropdown, setShowHighlightDropdown] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#1f2937");
  const [selectedHighlight, setSelectedHighlight] = useState("#fef08a");
  const [stats, setStats] = useState({ words: 0, characters: 0 });
  const [isEmpty, setIsEmpty] = useState(!value);
  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    alignLeft: true,
    alignCenter: false,
    alignRight: false,
  });

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowFormatDropdown(false);
        setShowColorDropdown(false);
        setShowHighlightDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Calculate statistics from editor HTML
  const updateStats = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const clean = text.trim();
    const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
    const characters = clean.length;
    setStats({ words, characters });
    setIsEmpty(!clean);
  }, []);

  // Sync external value changes to editor
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
      updateStats();
    }
  }, [value, updateStats]);

  // Execute standard editor commands without losing selection
  const execute = (command, val = null) => {
    if (typeof document === "undefined") return;
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    handleEditorChange();
    checkCurrentFormat();
  };

  const handleEditorChange = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    updateStats();
    if (onChange) {
      const textOnly = (editorRef.current.innerText || "").trim();
      onChange(!textOnly ? "" : html);
    }
  };

  // Check current cursor position format
  const checkCurrentFormat = () => {
    if (typeof document === "undefined") return;
    try {
      setActiveStates({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strike: document.queryCommandState("strikeThrough"),
        alignLeft: document.queryCommandState("justifyLeft"),
        alignCenter: document.queryCommandState("justifyCenter"),
        alignRight: document.queryCommandState("justifyRight"),
      });

      const blockVal = document.queryCommandValue("formatBlock");
      if (blockVal) {
        const tag = blockVal.toLowerCase().replace(/[<>]/g, "");
        if (tag === "h1") setActiveFormat("Heading 1");
        else if (tag === "h2") setActiveFormat("Heading 2");
        else if (tag === "h3") setActiveFormat("Heading 3");
        else if (tag === "h4") setActiveFormat("Heading 4");
        else if (tag === "blockquote") setActiveFormat("Quote");
        else setActiveFormat("Paragraph");
      }
    } catch {}
  };

  // Apply block format (Paragraph, Heading 1/2/3/4, Quote)
  const applyBlockFormat = (formatTag, formatName) => {
    editorRef.current?.focus();
    try {
      document.execCommand("formatBlock", false, formatTag);
    } catch {
      document.execCommand("formatBlock", false, `<${formatTag}>`);
    }
    setActiveFormat(formatName);
    setShowFormatDropdown(false);
    handleEditorChange();
  };

  // Apply text color
  const applyTextColor = (color) => {
    setSelectedColor(color);
    editorRef.current?.focus();
    document.execCommand("foreColor", false, color);
    setShowColorDropdown(false);
    handleEditorChange();
  };

  // Apply highlight color
  const applyHighlightColor = (color) => {
    setSelectedHighlight(color);
    editorRef.current?.focus();
    if (color === "transparent") {
      document.execCommand("removeFormat", false, null);
    } else {
      if (!document.execCommand("hiliteColor", false, color)) {
        document.execCommand("backColor", false, color);
      }
    }
    setShowHighlightDropdown(false);
    handleEditorChange();
  };

  // Insert Link
  const handleInsertLink = () => {
    editorRef.current?.focus();
    const selection = window.getSelection();
    const selectedText = selection?.toString() || "";

    const url = prompt("লিংক (URL) প্রবেশ করান:", "https://");
    if (!url || url === "https://") return;

    if (selectedText) {
      document.execCommand("createLink", false, url);
    } else {
      const text = prompt("লিংকের টেক্সট (Link text) লিখুন:", url);
      const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text || url}</a>`;
      document.execCommand("insertHTML", false, linkHtml);
    }
    handleEditorChange();
  };

  // Insert Image
  const handleInsertImage = () => {
    editorRef.current?.focus();
    const url = prompt("ছবির সরাসরি লিংক (Image URL) প্রবেশ করান:");
    if (url) {
      const imgHtml = `<img src="${url}" alt="Product image" style="max-width:100%; height:auto; border-radius:8px; margin:10px 0;" />`;
      document.execCommand("insertHTML", false, imgHtml);
      handleEditorChange();
    }
  };

  // ChatGPT & Clipboard Paste Handler
  const handlePaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const htmlData = clipboardData.getData("text/html");
    const plainText = clipboardData.getData("text/plain") || "";

    let contentToInsert = "";

    // Check if plain text looks like Markdown (common from ChatGPT copy button)
    const isMarkdown =
      /^#{1,6}\s+/m.test(plainText) ||
      /\*\*[^*]+\*\*/.test(plainText) ||
      /^[-*•]\s+/m.test(plainText) ||
      /^\d+\.\s+/m.test(plainText);

    if (isMarkdown) {
      contentToInsert = convertMarkdownToHtml(plainText);
    } else if (htmlData && htmlData.trim().length > 0) {
      contentToInsert = sanitizePastedHtml(htmlData);
    } else {
      contentToInsert = plainText
        .split(/\r?\n\r?\n/)
        .map((p) => (p.trim() ? `<p>${p.trim()}</p>` : ""))
        .join("");
    }

    if (contentToInsert) {
      if (document.queryCommandSupported("insertHTML")) {
        document.execCommand("insertHTML", false, contentToInsert);
      } else {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          const temp = document.createElement("div");
          temp.innerHTML = contentToInsert;
          const frag = document.createDocumentFragment();
          let node;
          while ((node = temp.firstChild)) {
            frag.appendChild(node);
          }
          range.insertNode(frag);
        }
      }
      handleEditorChange();
    }
  };

  return (
    <div ref={containerRef} className="w-full">
      {/* Label & ChatGPT Badge */}
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm text-gray-700 dark:text-gray-300 font-bold">
          {label}
        </label>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ChatGPT ফরম্যাট সাপোর্ট</span>
        </span>
      </div>

      {/* Editor Main Box */}
      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-xs overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
        
        {/* Top Toolbar (Exact Match to Screenshot) */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50/90 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 select-none">
          
          {/* 1. Undo / Redo */}
          <button
            type="button"
            title="Undo (পূর্বাবস্থায় ফিরুন)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execute("undo")}
            className="p-1.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Redo (পুনরায় করুন)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execute("redo")}
            className="p-1.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            <Redo className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* 2. Format Dropdown (Paragraph, Heading 1, 2, 3, Quote) */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setShowFormatDropdown(!showFormatDropdown);
                setShowColorDropdown(false);
                setShowHighlightDropdown(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition shadow-2xs cursor-pointer"
            >
              <span>{activeFormat}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>

            {showFormatDropdown && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 py-1 text-xs">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyBlockFormat("<p>", "Paragraph")}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer"
                >
                  Paragraph (সাধারণ লেখা)
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyBlockFormat("<h1>", "Heading 1")}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-bold text-base cursor-pointer"
                >
                  Heading 1 (বড় হেডিং)
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyBlockFormat("<h2>", "Heading 2")}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-emerald-800 dark:text-emerald-400 font-bold text-sm cursor-pointer"
                >
                  Heading 2 (মাঝারি হেডিং)
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyBlockFormat("<h3>", "Heading 3")}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-emerald-700 dark:text-emerald-300 font-bold cursor-pointer"
                >
                  Heading 3 (সাব-হেডিং)
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyBlockFormat("<h4>", "Heading 4")}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer"
                >
                  Heading 4 (ছোট হেডিং)
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyBlockFormat("<blockquote>", "Quote")}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 italic border-l-2 border-emerald-500 ml-1 cursor-pointer"
                >
                  Quote (উদ্ধৃতি বা হাইলাইট)
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* 3. Bold (B) */}
          <button
            type="button"
            title="Bold (Ctrl+B)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execute("bold")}
            className={`px-2.5 py-1 rounded-lg font-bold text-sm transition cursor-pointer ${
              activeStates.bold
                ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-500"
                : "text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            B
          </button>

          {/* 4. Italic (I) */}
          <button
            type="button"
            title="Italic (Ctrl+I)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execute("italic")}
            className={`px-2.5 py-1 rounded-lg italic font-serif text-sm transition cursor-pointer ${
              activeStates.italic
                ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-500"
                : "text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            I
          </button>

          {/* 5. Underline (U) */}
          <button
            type="button"
            title="Underline (Ctrl+U)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execute("underline")}
            className={`px-2.5 py-1 rounded-lg underline text-sm transition cursor-pointer ${
              activeStates.underline
                ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-500"
                : "text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            U
          </button>

          {/* 6. Strikethrough (S) */}
          <button
            type="button"
            title="Strikethrough"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execute("strikeThrough")}
            className={`px-2.5 py-1 rounded-lg line-through text-sm transition cursor-pointer ${
              activeStates.strike
                ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-500"
                : "text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            S
          </button>

          {/* 7. Text Color Picker (A with color bar) */}
          <div className="relative">
            <button
              type="button"
              title="Text Color (লেখার রঙ)"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setShowColorDropdown(!showColorDropdown);
                setShowFormatDropdown(false);
                setShowHighlightDropdown(false);
              }}
              className="flex flex-col items-center justify-center px-1.5 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              <span className="font-bold text-xs leading-none">A</span>
              <span
                className="w-4 h-1 rounded-full mt-0.5"
                style={{ backgroundColor: selectedColor }}
              />
            </button>

            {showColorDropdown && (
              <div className="absolute left-0 top-full mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 flex flex-col gap-1 w-32">
                <span className="text-[10px] text-gray-500 font-semibold mb-1">টেক্সট কালার:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {TEXT_COLORS.map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      title={item.label}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyTextColor(item.color)}
                      className="w-6 h-6 rounded-md border border-gray-300 dark:border-gray-600 hover:scale-110 transition cursor-pointer"
                      style={{ backgroundColor: item.color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 8. Text Highlighter (Pen with color bar) */}
          <div className="relative">
            <button
              type="button"
              title="Highlight Color (ব্যাকগ্রাউন্ড হাইলাইট)"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setShowHighlightDropdown(!showHighlightDropdown);
                setShowFormatDropdown(false);
                setShowColorDropdown(false);
              }}
              className="flex flex-col items-center justify-center px-1.5 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              <Highlighter className="w-3.5 h-3.5" />
              <span
                className="w-4 h-1 rounded-full mt-0.5"
                style={{ backgroundColor: selectedHighlight }}
              />
            </button>

            {showHighlightDropdown && (
              <div className="absolute left-0 top-full mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 flex flex-col gap-1 w-32">
                <span className="text-[10px] text-gray-500 font-semibold mb-1">হাইলাইট কালার:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {HIGHLIGHT_COLORS.map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      title={item.label}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyHighlightColor(item.color)}
                      className="w-7 h-6 rounded-md border border-gray-300 dark:border-gray-600 hover:scale-110 transition text-[9px] flex items-center justify-center text-gray-700 cursor-pointer"
                      style={{ backgroundColor: item.color === "transparent" ? "#ffffff" : item.color }}
                    >
                      {item.color === "transparent" ? "None" : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* 9. Alignments (Left, Center, Right) */}
          <button
            type="button"
            title="Align Left (বামে সারিবদ্ধ)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execute("justifyLeft")}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              activeStates.alignLeft
                ? "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-200"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Align Center (মাঝখানে সারিবদ্ধ)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execute("justifyCenter")}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              activeStates.alignCenter
                ? "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-200"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Align Right (ডানে সারিবদ্ধ)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execute("justifyRight")}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              activeStates.alignRight
                ? "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-200"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <AlignRight className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* 10. Bullet List & Numbered List */}
          <button
            type="button"
            title="Bullet List (বুলেট পয়েন্ট)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execute("insertUnorderedList")}
            className="p-1.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Numbered List (নম্বর পয়েন্ট)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execute("insertOrderedList")}
            className="p-1.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* 11. Link & Image */}
          <button
            type="button"
            title="Insert Link (লিংক যুক্ত করুন)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleInsertLink}
            className="p-1.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Insert Image URL (ছবির লিংক যুক্ত করুন)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleInsertImage}
            className="p-1.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* 12. Clear Formatting */}
          <button
            type="button"
            title="Clear Formatting (ফরম্যাট মুছে সাধারণ করুন)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execute("removeFormat")}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition ml-auto cursor-pointer"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Editable Content Area */}
        <div className="relative">
          {isEmpty && (
            <div className="absolute top-4 left-4 text-gray-400 dark:text-gray-500 pointer-events-none text-sm select-none">
              {placeholder}
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorChange}
            onKeyUp={checkCurrentFormat}
            onMouseUp={checkCurrentFormat}
            onPaste={handlePaste}
            style={{ minHeight }}
            className="rich-text-content relative p-4 text-gray-900 dark:text-gray-100 outline-none focus:outline-none overflow-y-auto leading-relaxed"
          />
        </div>

        {/* Bottom Status Bar (Word & Character Counter matching screenshot) */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50/60 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-400">
            <span>💡 ChatGPT থেকে ফরম্যাট করা টেক্সট সরাসরি কপি করে পেস্ট করতে পারবেন</span>
          </div>
          <div className="ml-auto font-medium tracking-wide">
            Words: <span className="text-gray-700 dark:text-gray-200 font-bold">{stats.words}</span>{" "}
            &nbsp;Characters: <span className="text-gray-700 dark:text-gray-200 font-bold">{stats.characters}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
