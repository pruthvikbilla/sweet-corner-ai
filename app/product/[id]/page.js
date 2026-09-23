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
        if (!res.ok) throw new Error("Product not found");
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 font-medium animate-pulse">
        ⚙️ Fetching institutional specification sheet...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-slate-700">
        <p className="text-lg font-semibold">Item not found in catalog</p>
        <Link href="/" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          ← Back to Catalog Chat
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow">
        <Link href="/" className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700 transition">
          ← Back to Catalog Chat
        </Link>
        <div className="font-semibold text-sm">Specification Sheet</div>
        <div className="w-16"></div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 flex flex-col md:flex-row gap-8 items-start justify-center">
        <div className="w-full md:w-1/2 overflow-hidden rounded-xl shadow border border-slate-200 bg-white p-2">
          <img
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-80 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80";
            }}
          />
          <div className="mt-3 text-center text-xs text-slate-400">
            Catalog Code: <span className="font-mono font-medium text-slate-600">{product.product_code || "N/A"}</span>
          </div>
        </div>

        <div className="w-full md:w-1/2 space-y-4">
          <div className="flex gap-2 items-center flex-wrap">
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded font-medium border border-blue-200">
              {product.category}
            </span>
            {product.industries?.map((ind, i) => (
              <span key={i} className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded">
                {ind}
              </span>
            ))}
          </div>

          <h1 className="text-2xl font-bold text-slate-900">{product.product_name}</h1>
          <p className="text-slate-600 text-sm leading-relaxed">{product.description}</p>
          
          <div className="pt-2 pb-1 border-y border-slate-200">
            <div className="text-xl font-bold text-emerald-700">{product.price}</div>
            <div className="text-xs text-slate-500">Tiered bulk pricing available upon formal RFQ</div>
          </div>

          <div className="space-y-2 text-xs">
            {product.quality_type && product.quality_type !== "NA" && (
              <div><strong className="text-slate-700">Quality Type:</strong> {product.quality_type}</div>
            )}
            {product.subquality && product.subquality !== "NA" && (
              <div><strong className="text-slate-700">Fabric Composition:</strong> {product.subquality}</div>
            )}
            {product.fitting && product.fitting !== "NA" && (
              <div><strong className="text-slate-700">Fitting:</strong> {product.fitting}</div>
            )}
            {product.colors && product.colors.length > 0 && product.colors[0] !== "NA" && (
              <div>
                <strong className="text-slate-700">Available Colors:</strong>{" "}
                {product.colors.join(", ")}
              </div>
            )}
            {product.sizes && product.sizes.length > 0 && product.sizes[0] !== "NA" && (
              <div>
                <strong className="text-slate-700">Available Sizes / Cuts:</strong>{" "}
                {product.sizes.join(", ")}
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={() => alert(`Added ${product.product_name} to quotation request!`)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow transition"
            >
              Add to Quote RFQ
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-white hover:bg-slate-100 text-slate-700 font-medium py-3 px-4 rounded-lg border border-slate-300 transition"
            >
              Keep Inquiring
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}