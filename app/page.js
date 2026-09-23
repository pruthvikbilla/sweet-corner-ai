"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function InstitutionalSuppliesChat() {
  const [inputVal, setInputVal] = useState("");
  const [chatList, setChatList] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const bottomAnchor = useRef(null);

  const suggestionPills = [
    "🏥 Hospital Bedding",
    "🩺 Medical Supplies",
    "🥼 Staff Scrubs & Uniforms",
    "🏨 Hospitality Linens",
    "🧤 Surgical Gloves & Masks",
    "🛏️ Hospital Beds"
  ];

  // 1. Load history from sessionStorage
  useEffect(() => {
    try {
      const savedHistory = sessionStorage.getItem("institutional_chat_history");
      if (savedHistory) {
        setChatList(JSON.parse(savedHistory));
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
    setIsHydrated(true);
  }, []);

  // 2. Persist history to sessionStorage
  useEffect(() => {
    if (isHydrated) {
      sessionStorage.setItem("institutional_chat_history", JSON.stringify(chatList));
    }
  }, [chatList, isHydrated]);

  // 3. Scroll to bottom
  useEffect(() => {
    bottomAnchor.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatList, isProcessing]);

  async function submitMessage(customText) {
    const text = customText || inputVal;
    if (!text.trim() || isProcessing) return;

    const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userEntry = { id: Date.now(), role: "user", text, products: [], time: stamp };
    setChatList((prev) => [...prev, userEntry]);
    setInputVal("");
    setIsProcessing(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      const botEntry = {
        id: Date.now() + 1,
        role: "bot",
        text: data.reply,
        products: data.products || [],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setChatList((prev) => [...prev, botEntry]);
    } catch (error) {
      setChatList((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "bot",
          text: "Connection issue with server. Please verify backend is running on port 8000.",
          products: [],
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  }

  async function resetConversation() {
    try {
      await fetch("http://localhost:8000/api/reset", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    sessionStorage.removeItem("institutional_chat_history");
    setChatList([]);
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800">
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏥</span>
          <div>
            <h1 className="text-base font-bold tracking-tight"> Institutional Supplies</h1>
            <span className="text-xs text-slate-400">Healthcare, Hospitality & School Sourcing</span>
          </div>
        </div>
        <button
          onClick={resetConversation}
          className="bg-slate-800 hover:bg-slate-700 text-xs px-3.5 py-2 rounded border border-slate-700 transition"
        >
          Reset Inquiry
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 max-w-4xl w-full mx-auto space-y-4">
        {chatList.length === 0 && (
          <div className="text-center my-16 text-slate-500 space-y-2">
            <span className="text-4xl block">📋</span>
            <p className="font-semibold text-slate-700 text-base">Institutional Catalog Assistant</p>
            <p className="text-xs max-w-md mx-auto text-slate-500">
              Inquire about bulk hospital bedsheets, scrubs, OT gowns, linens, or medical equipment specs.
            </p>
          </div>
        )}

        {chatList.map((item) => (
          <div
            key={item.id}
            className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-2xl px-4 py-3 rounded-xl text-sm leading-relaxed shadow-xs ${
                item.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-wrap">{item.text}</p>

              {item.products && item.products.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                  {item.products.map((p, idx) => (
                    <Link
                      key={idx}
                      href={`/product/${p._id || p.product_code || idx}`}
                      className="group bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200 hover:border-blue-400 rounded-lg overflow-hidden flex flex-col justify-between shadow-xs transition duration-150 transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <img
                        src={p.image_url}
                        alt={p.product_name}
                        className="w-full h-28 object-cover group-hover:scale-102 transition duration-200"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80";
                        }}
                      />
                      <div className="p-3 flex flex-col flex-1 justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-[9px] uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              {p.category}
                            </span>
                            {p.product_code && (
                              <span className="text-[9px] text-slate-400">
                                #{p.product_code}
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-xs text-slate-900 group-hover:text-blue-700 truncate">
                            {p.product_name}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                            {p.description}
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200 text-xs font-semibold">
                          <span className="text-emerald-700">{p.price}</span>
                          <span className="text-[10px] text-blue-600 font-normal group-hover:underline">
                            Specs →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <span
                className={`block text-[10px] mt-1.5 text-right ${
                  item.role === "user" ? "text-blue-200" : "text-slate-400"
                }`}
              >
                {item.time}
              </span>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="text-xs text-blue-700 font-medium animate-pulse flex items-center gap-1.5">
            <span>⚙️</span> Checking warehouse & catalog specs...
          </div>
        )}

        <div ref={bottomAnchor} />
      </main>

      <footer className="bg-white border-t border-slate-200 p-4 space-y-3">
        <div className="max-w-4xl mx-auto flex gap-2 overflow-x-auto pb-1">
          {suggestionPills.map((pill, i) => (
            <button
              key={i}
              onClick={() => submitMessage(pill.replace(/^[^\w\s]+/, "").trim())}
              disabled={isProcessing}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-full whitespace-nowrap transition disabled:opacity-50"
            >
              {pill}
            </button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitMessage()}
            placeholder="Search hospital blankets, scrubs, OT gowns, towels, or medical supplies..."
            className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={() => submitMessage()}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition disabled:opacity-50"
          >
            Inquire
          </button>
        </div>
      </footer>
    </div>
  );
}