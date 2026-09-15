"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`http://localhost:8000/api/products/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50/40 flex items-center justify-center text-amber-900 font-medium animate-pulse">
        🪔 Loading sweet delicacy...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-amber-50/40 flex flex-col items-center justify-center gap-4 text-slate-700">
        <p className="text-lg font-semibold">Item not found</p>
        <Link href="/" className="text-sm bg-amber-800 text-white px-4 py-2 rounded-lg hover:bg-amber-900 transition">
          ← Back to Counter Chat
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/40 text-slate-800 flex flex-col">
      <header className="bg-amber-800 text-amber-50 px-6 py-4 flex justify-between items-center shadow">
        <Link href="/" className="text-xs bg-amber-900/70 hover:bg-amber-900 px-3 py-1.5 rounded-md border border-amber-600 transition">
          ← Back to Chat
        </Link>
        <div className="font-bold text-base">Sweet Corner Store</div>
        <div className="w-16"></div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col md:flex-row gap-8 items-center justify-center">
        <div className="w-full md:w-1/2 overflow-hidden rounded-2xl shadow-lg border border-amber-200">
          <img
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-80 object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&q=80";
            }}
          />
        </div>

        <div className="w-full md:w-1/2 space-y-4">
          <span className="inline-block bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-full font-medium border border-amber-300">
            {product.category}
          </span>
          <h1 className="text-2xl font-bold text-amber-950">{product.product_name}</h1>
          <p className="text-slate-600 text-sm leading-relaxed">{product.description}</p>
          
          <div className="flex items-baseline gap-3 pt-2">
            <span className="text-3xl font-extrabold text-amber-900">₹{product.price}</span>
            <span className="text-sm text-slate-500 font-medium">/ {product.weight}</span>
          </div>

          <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            ✓ In Stock ({product.stock} packs fresh today)
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={() => alert(`Added ${product.product_name} to cart!`)}
              className="flex-1 bg-amber-800 hover:bg-amber-900 text-white font-semibold py-3 px-4 rounded-xl shadow transition"
            >
              Add to Box
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium py-3 px-4 rounded-xl border border-amber-300 transition"
            >
              Keep Chatting
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}