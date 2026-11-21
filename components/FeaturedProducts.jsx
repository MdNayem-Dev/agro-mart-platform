"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  ShoppingCart, 
  Zap 
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function FeaturedProducts({ products = [], title = "জনপ্রিয় পণ্য" }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleOrderNow = (e, product) => {
    e.preventDefault();
    addToCart(product, false);
    router.push('/checkout');
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    addToCart(product, true);
  };

  return (
    <section id="popular-products" className="w-full">
      {title && (
        <div className="mb-3 sm:mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {title}
          </h2>
        </div>
      )}

      {/* Product Cards Grid */}
      {products.length === 0 ? (
        <div className="text-center py-14 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-2.5" />
          <p className="text-gray-600 font-semibold text-sm">
            কোনো পণ্য পাওয়া যায়নি।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {products.map((product, index) => {
            const id = product.id;
            const productTitle = product.title || product.name || '';
            const slug = product.slug;
            const image = product.image || product.images?.[0]?.src || "https://placehold.co/400x400/eeeeee/aaaaaa?text=No+Image";
            const regPrice = Number(product.regularPrice || product.regular_price || product.price) || 0;
            const salePrice = Number(product.salePrice || product.sale_price || product.price) || regPrice;
            const hasDiscount = regPrice > salePrice && regPrice > 0;
            const discountPercent = hasDiscount 
              ? Math.round(((regPrice - salePrice) / regPrice) * 100) 
              : 0;

            const stockQty = (product.stockQuantity !== null && product.stockQuantity !== undefined && product.stockQuantity !== '')
              ? Number(product.stockQuantity)
              : (product.stock_quantity !== undefined && product.stock_quantity !== null && product.stock_quantity !== '' ? Number(product.stock_quantity) : null);
            const statusStr = String(product.stockStatus || product.stock_status || '').toLowerCase().trim();
            const isOutOfStock = statusStr === 'outofstock' || statusStr === 'out_of_stock' || statusStr === 'out of stock';

            const cartItem = {
              ...product,
              id,
              title: productTitle,
              slug,
              image,
              regularPrice: regPrice,
              salePrice: salePrice,
              deliveryCharge: Number(product.deliveryCharge ?? product.delivery_charge ?? 0),
              stockStatus: isOutOfStock ? 'outofstock' : 'instock',
              stockQuantity: stockQty,
            };

            return (
              <div
                key={id}
                className="bg-white border border-gray-200 hover:border-[#488e14] rounded-2xl flex flex-col h-full shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.18)] hover:-translate-y-1.5 transition-all duration-300 ease-out overflow-hidden relative group p-2 sm:p-2.5"
              >
                <Link href={`/product/${slug}`} prefetch={true} className="flex flex-col flex-grow relative">
                  
                  {/* Badge: If stock out, show 'Stock Out' badge in the discount badge location, otherwise show discount badge */}
                  {isOutOfStock ? (
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-gradient-to-r from-rose-600 via-rose-600 to-red-700 text-white flex items-center justify-center gap-1 border border-white/80 shadow-md pointer-events-none select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      <span className="text-[9px] sm:text-[10px] font-black leading-none tracking-tight uppercase">
                        Stock Out
                      </span>
                    </div>
                  ) : (
                    hasDiscount && discountPercent > 0 && (
                      <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#488e14] via-[#3d7a11] to-[#2d5c0c] text-white flex flex-col items-center justify-center border-2 border-white shadow-md animate-discount-circle pointer-events-none select-none">
                        <span className="text-[10px] sm:text-[10.5px] font-black leading-none tracking-tight">
                          {discountPercent}%
                        </span>
                        <span className="text-[7.5px] sm:text-[8px] font-bold leading-none mt-0.5 tracking-wider text-emerald-100 animate-discount-fade">
                          ছাড়
                        </span>
                      </div>
                    )
                  )}

                  {/* Image Area */}
                  <div className="w-full aspect-square rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden mb-2 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt={productTitle}
                      className={`w-full h-full object-contain p-2 transition-all duration-300 ${
                        isOutOfStock ? 'opacity-85' : 'group-hover:scale-105'
                      }`}
                      loading={index < 6 ? "eager" : "lazy"}
                      fetchPriority={index < 2 ? "high" : "auto"}
                      decoding="async"
                    />
                  </div>

                  {/* Product Title */}
                  <h3 
                    className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-[#488e14] transition-colors mb-1.5"
                    title={productTitle}
                    dangerouslySetInnerHTML={{ __html: productTitle }}
                  />

                  {/* Price Section */}
                  <div className="mt-auto pt-1 flex items-center justify-center gap-1.5 flex-wrap w-full text-center">
                    <span className="text-sm sm:text-base font-extrabold text-[#488e14] product-price-bold">
                      ৳{(salePrice || 0).toLocaleString()}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through">
                        ৳{(regPrice || 0).toLocaleString()}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Action Buttons */}
                <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center gap-1.5">
                  <button
                    onClick={(e) => !isOutOfStock && handleOrderNow(e, cartItem)}
                    disabled={isOutOfStock}
                    className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-xs transition-colors ${
                      isOutOfStock
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-[#488e14] hover:bg-[#3d7a11] text-white cursor-pointer'
                    }`}
                    title={isOutOfStock ? 'পণ্যটি স্টকে নেই' : 'সরাসরি অর্ডার করুন'}
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    <span>{isOutOfStock ? 'স্টক শেষ' : 'অর্ডার'}</span>
                  </button>

                  <button
                    onClick={(e) => !isOutOfStock && handleAddToCart(e, cartItem)}
                    disabled={isOutOfStock}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isOutOfStock
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-[#488e14] cursor-pointer'
                    }`}
                    title={isOutOfStock ? 'পণ্যটি স্টকে নেই' : 'কার্টে যোগ করুন'}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
