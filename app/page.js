"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function SweetCornerChat() {
  const [inputVal, setInputVal] = useState("");
  const [chatList, setChatList] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const bottomAnchor = useRef(null);

  const suggestionPills = [
    "✨ Show menu",
    "🥜 Dry Fruit Sweets",
    "🫓 Jaggery Sweets",
    "🥮 Classic Baklavas",
    "💰 Sweets under 300"
  ];

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
    setChatList([]);
  }

  return (
    <div className="flex flex-col h-screen bg-amber-50/40 text-slate-800">
      <header className="bg-amber-800 text-amber-50 px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🪔</span>
          <div>
            <h1 className="text-lg font-bold leading-none">Sweet Corner Assistant</h1>
            <span className="text-xs text-amber-200">Fresh Mithai & Namkeen Counter</span>
          </div>
        </div>
        <button
          onClick={resetConversation}
          className="bg-amber-900/60 hover:bg-amber-900 text-xs px-3 py-2 rounded-md border border-amber-600 transition"
        >
          Reset Chat
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 max-w-3xl w-full mx-auto space-y-4">
        {chatList.length === 0 && (
          <div className="text-center my-16 text-slate-500 space-y-2">
            <span className="text-4xl block">📦</span>
            <p className="font-semibold text-slate-700">Welcome to Sweet Corner!</p>
            <p className="text-xs max-w-md mx-auto text-slate-500">
              Ask about traditional Indian sweets, baklavas, sugar-free options, or budget items.
            </p>
          </div>
        )}

        {chatList.map((item) => (
          <div
            key={item.id}
            className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-2xl px-4 py-3 rounded-xl text-sm leading-relaxed shadow-sm ${
                item.role === "user"
                  ? "bg-amber-700 text-white rounded-br-none"
                  : "bg-white text-slate-800 border border-amber-200/80 rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-wrap">{item.text}</p>

              {item.products && item.products.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                  {item.products.map((p, idx) => (
                    <Link
                      key={idx}
                      href={`/product/${p.product_id || idx + 1}`}
                      className="group bg-amber-50/50 hover:bg-amber-100/60 border border-amber-200 hover:border-amber-400 rounded-lg overflow-hidden flex flex-col justify-between shadow-xs transition transform hover:-translate-y-0.5 cursor-pointer text-left"
                    >
                      <img
                        src={p.image_url}
                        alt={p.product_name}
                        className="w-full h-24 object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=300&q=80";
                        }}
                      />
                      <div className="p-2 flex flex-col flex-1 justify-between">
                        <div>
                          <div className="font-semibold text-xs text-amber-950 group-hover:text-amber-800 truncate">
                            {p.product_name}
                          </div>
                          <div className="text-[10px] text-slate-600 line-clamp-2 mt-0.5">
                            {p.description}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-1 border-t border-amber-200/60 text-xs font-bold text-amber-900">
                          <span>₹{p.price}</span>
                          <span className="text-[10px] text-slate-500 font-normal">{p.weight}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <span
                className={`block text-[10px] mt-1 text-right ${
                  item.role === "user" ? "text-amber-200" : "text-slate-400"
                }`}
              >
                {item.time}
              </span>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="text-xs text-amber-800 font-medium animate-pulse flex items-center gap-1.5">
            <span>🪔</span> Checking store counter...
          </div>
        )}

        <div ref={bottomAnchor} />
      </main>

      <footer className="bg-white border-t border-amber-200/60 p-4 space-y-3">
        <div className="max-w-3xl mx-auto flex gap-2 overflow-x-auto pb-1">
          {suggestionPills.map((pill, i) => (
            <button
              key={i}
              onClick={() => submitMessage(pill.replace(/^[^\w\s]+/, "").trim())}
              disabled={isProcessing}
              className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-full whitespace-nowrap transition disabled:opacity-50"
            >
              {pill}
            </button>
          ))}
        </div>

        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitMessage()}
            placeholder="Search for Kaju Katli, Baklava, items under 300..."
            className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
          <button
            onClick={() => submitMessage()}
            disabled={isProcessing}
            className="bg-amber-800 hover:bg-amber-900 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}