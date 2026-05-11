"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Send, FileText, X } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const BACKEND_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat, loading]);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setLoading(true);

      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Upload error:", errText);
        alert("Upload failed: " + errText);
        return;
      }

      const data = await res.json();
      setDocumentId(data.documentId);
      setChat([]);
      setFile(null);
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim() || !documentId) return;

    const userMessage: ChatMessage = { role: "user", content: question.trim() };
    setChat((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, question: userMessage.content }),
      });

      if (!res.ok) throw new Error("Ask failed");

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.result,
      };
      setChat((prev) => [...prev, assistantMessage]);
    } catch {
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Failed to fetch answer." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const exampleQuestions = [
    "What is the main contribution?",
    "Summarize the abstract",
    "What methods were used?",
    "Explain the results",
    "What are the limitations?",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 py-5 px-6 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            R
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Research Paper Assistant
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload a PDF and explore it with AI-powered questions
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex justify-center items-start p-6 overflow-hidden">
        <div className="w-full max-w-5xl space-y-8">
          {/* Upload Section */}
          {!documentId ? (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Upload Your Research Paper
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
                Drop your PDF here to instantly index it and start asking intelligent questions.
              </p>

              <div className="max-w-2xl mx-auto">
                <label className="block cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div className="border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 bg-white/50 dark:bg-gray-900/50">
                    <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    {file ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-3 text-lg">
                          <FileText className="w-8 h-8 text-red-500" />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{file.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                            }}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xl font-medium text-gray-700 dark:text-gray-300">
                          Drop your PDF here or click to browse
                        </p>
                        <p className="text-sm text-gray-500 mt-2">Only PDF files supported</p>
                      </div>
                    )}
                  </div>
                </label>

                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="mt-8 w-full py-5 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg rounded-2xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-xl flex items-center justify-center gap-3"
                >
                  {uploading ? (
                    <>Indexing Paper...</>
                  ) : (
                    <>
                      <Upload className="w-6 h-6" />
                      Upload & Index Paper
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 text-center shadow-lg">
                <p className="text-xl font-semibold">
                  ✅ Paper successfully indexed and ready for questions!
                </p>
              </div>

              {/* Chat Interface */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col h-[76vh] max-h-[900px]">
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto px-8 py-8 space-y-8 scrollbar-hide"
                >
                  {chat.length === 0 ? (
                    <div className="text-center mt-20 space-y-6">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                        R
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
                        Ask anything about your paper
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                        Try one of these examples:
                      </p>
                      <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
                        {exampleQuestions.map((q) => (
                          <button
                            key={q}
                            onClick={() => {
                              setQuestion(q);
                              document.querySelector("input")?.focus();
                            }}
                            className="px-5 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {chat.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start gap-4 max-w-4xl mx-auto ${
                            msg.role === "user" ? "flex-row-reverse" : ""
                          }`}
                        >
                          {msg.role === "assistant" && (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">
                              R
                            </div>
                          )}

                          <div
                            className={`max-w-[70%] px-6 py-4 rounded-3xl shadow-md ${
                              msg.role === "user"
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none"
                            }`}
                          >
                            <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          </div>

                          {msg.role === "user" && (
                            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold text-lg shrink-0">
                              U
                            </div>
                          )}
                        </div>
                      ))}

                      {loading && (
                        <div className="flex items-center gap-4 max-w-4xl mx-auto">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                            R
                          </div>
                          <div className="flex gap-2">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Input Bar */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50/50 dark:bg-gray-900/50">
                  <div className="max-w-4xl mx-auto flex gap-4">
                    <input
                      type="text"
                      placeholder="Ask a question about the paper..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAsk()}
                      disabled={loading}
                      className="flex-1 px-6 py-4 text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 shadow-inner placeholder-gray-500"
                    />
                    <button
                      onClick={handleAsk}
                      disabled={loading || !question.trim()}
                      className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl flex items-center gap-3"
                    >
                      <Send className="w-5 h-5" />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}