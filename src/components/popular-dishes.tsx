"use client";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronRight, ChevronLeft, Flame, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { DishSuggestList } from "@/app/[locale]/(public)/page";

export default function PopularDishes({ data }: { data: DishSuggestList }) {
  return (
    <section className="py-16 md:py-12 px-4 sm:px-6 lg:px-33.75">
      <div className="text-center mb-12 md:mb-16">
        <div className="inline-flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-orange-500/20 border-2 border-orange-500/30 flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
            Món ăn phổ biến
          </h2>
          <div className="w-12 h-12 rounded-full bg-orange-500/20 border-2 border-orange-500/30 flex items-center justify-center">
            <Star className="w-6 h-6 text-orange-400 fill-orange-400" />
          </div>
        </div>
        <p className="text-black dark:text-white text-lg max-w-3xl mx-auto leading-relaxed px-4 tracking-wide">
          Khám phá danh sách các món ăn được yêu thích nhất, bao gồm món chính, đồ uống và tráng miệng, để có
          trải nghiệm ẩm thực đích thực!
        </p>
        <div className="mt-6 h-1 w-32 mx-auto bg-linear-to-r from-transparent via-orange-400 to-transparent rounded-full" />
      </div>

      <div className="mt-3 relative">
        {data.length > 0 ? (
          <div className="relative">
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={20}
              loop={true}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              navigation={{
                nextEl: ".custom-next",
                prevEl: ".custom-prev",
              }}
              breakpoints={{
                320: { slidesPerView: 1 },
                480: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 4 },
              }}
              className="mySwiper relative"
            >
              {data.map((dish, index) => (
                <SwiperSlide key={dish.id}>
                  <div
                    className="group relative backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-500 bg-gray-50 dark:bg-border border border-border shadow hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Image */}
                    <div className="relative h-64 overflow-hidden">
                      <div className="absolute inset-0 z-9" />
                      <Image
                        src={dish.dish.image}
                        alt={dish.dish.name}
                        width={500}
                        height={500}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />

                      {/* Popular Badge */}
                      <div className="absolute top-4 right-4 z-20">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/90 backdrop-blur-sm rounded-full border border-orange-400/50 shadow-lg">
                          <Star className="w-4 h-4 text-white fill-white" />
                          <span className="text-white font-semibold text-xs">Hot</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative p-4">
                      <h3 className="text-orange-400 dark:text-orange-400 text-xl font-bold mb-3 line-clamp-1 transition-colors duration-300">
                        {dish.dish.name}
                      </h3>

                      <p className="text-black dark:text-gray-100 text-sm line-clamp-2 leading-relaxed h-14">
                        {dish.dish.description || "Món ăn đặc biệt với hương vị tuyệt vời"}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-white bg-linear-to-r from-orange-500 to-amber-500 inline-block px-3 py-1 rounded-lg shadow-lg">
                          {formatCurrency(dish.price)}
                        </div>

                        {/* Action Button */}
                        <Link
                          href={`/dishes/${dish.id}`}
                          className="text-gray-600 dark:text-white text-sm hover:underline transition-all duration-300 group/btn block"
                        >
                          <span>Xem chi tiết</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <button className="custom-prev">
              <ChevronLeft />
            </button>

            <button className="custom-next">
              <ChevronRight />
            </button>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-800/50 border-2 border-gray-700 mb-6">
              <Flame className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-400 mb-2">Chưa có món ăn phổ biến</h3>
            <p className="text-gray-500">Hãy quay lại sau để khám phá những món ăn tuyệt vời!</p>
          </div>
        )}
      </div>

      {/* View All Button */}
      {data.length > 0 && (
        <div className="text-center mt-12">
          <Link
            href="/menu"
            className="inline-flex items-center gap-3 px-8 py-4 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:-translate-y-1 border-2 border-orange-400/50"
          >
            <Sparkles className="w-5 h-5" />
            <span>Khám phá tất cả món ăn</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
          <div className="mt-4 h-1 w-48 mx-auto bg-linear-to-r from-transparent via-orange-400 to-transparent rounded-full" />
        </div>
      )}
    </section>
  );
}
