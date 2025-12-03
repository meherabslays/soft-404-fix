import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { headers } from "next/headers";
import Product from "../Product";
import getProductJoinPrice from "../../_lib/helpers/getProductJoinPrice";
import { getNewArrivalProducts } from "../../_lib/home/product";

async function NotFoundPage() {
  // Get locale and translations
  let locale = "en"; // default
  let t;
  
  try {
    // Try to get locale
    locale = await getLocale();
  } catch (error) {
    // Fallback: try to extract from headers
    try {
      const headersList = await headers();
      const referer = headersList.get("referer") || "";
      const localeMatch = referer.match(/\/(en|bn)(?:\/|$)/);
      if (localeMatch && localeMatch[1]) {
        locale = localeMatch[1];
      }
    } catch (e) {
      locale = "en";
    }
  }
  
  // Ensure locale is valid
  if (locale !== "en" && locale !== "bn") {
    locale = "en";
  }
  
  // Get translations - wrap in try-catch for safety
  try {
    t = await getTranslations("NotFound");
  } catch (error) {
    // If translations fail, use fallback function
    t = (key) => {
      const fallbacks = {
        title: "404",
        heading: "Page Not Found",
        description: "Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or the URL might be incorrect.",
        button: "Go Back Home",
        productsTitle: "Explore Our Products"
      };
      return fallbacks[key] || key;
    };
  }
  
  // Fetch products to display
  let products = [];
  try {
    const productsData = await getNewArrivalProducts();
    if (productsData && Array.isArray(productsData)) {
      products = productsData.slice(0, 8);
    } else if (productsData?.data && Array.isArray(productsData.data)) {
      products = productsData.data.slice(0, 8);
    } else if (productsData?.results && Array.isArray(productsData.results)) {
      products = productsData.results.slice(0, 8);
    }
  } catch (error) {
    // Silently fail - page will still show without products
    products = [];
  }

  // Ensure t is always a function
  if (!t || typeof t !== "function") {
    t = (key) => {
      const fallbacks = {
        title: "404",
        heading: "Page Not Found",
        description: "Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or the URL might be incorrect.",
        button: "Go Back Home",
        productsTitle: "Explore Our Products"
      };
      return fallbacks[key] || key;
    };
  }

  return (
    <main className="w-full">
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-10 md:py-20">
        {/* 404 Content */}
        <div className="text-center mb-12 md:mb-16 px-5">
          <h1 className="text-8xl md:text-9xl font-bold text-[#19A8E1] mb-4">
            {t("title")}
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
            {t("heading")}
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            {t("description")}
          </p>
          <Link href={`/${locale}`}>
            <button className="bg-[#19A8E1] hover:bg-[#1ebfff] transition-colors duration-200 text-white font-semibold px-8 py-3 rounded-lg text-base md:text-lg shadow-lg hover:shadow-xl">
              {t("button")}
            </button>
          </Link>
        </div>

      {/* Products Section */}
      {products.length > 0 && (
        <div className="w-full mt-12 md:mt-16">
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 text-center mb-8 md:mb-12">
            {t("productsTitle")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {products.map((product, index) => {
              const stocks = product.stocks || [];
              const priceDisplay = getProductJoinPrice(stocks);
              
              return (
                <Product
                  key={product.id || index}
                  img={product.thumbnail}
                  name={product.name}
                  category={product.subcategory?.name}
                  price={priceDisplay}
                  url={`/product/${product?.slug}`}
                />
              );
            })}
          </div>
        </div>
      )}
      </div>
    </main>
  );
}

export default NotFoundPage;
