import { db } from "./db/index";
import { products, categories } from "./db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";

async function exportPreview() {
  console.log("Stahuji data z DB pro preview se sloučenými kategoriemi...");
  
  const allProducts = await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      imageUrl: products.imageUrl,
      categoryName: categories.name,
      description: products.description,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id));
  
  const formatted = allProducts.map((p, i) => ({
    id: String(p.id),
    name: p.name,
    price: Number(p.price),
    description: p.description || "Vysoce kvalitní sportovní vybavení.",
    category: p.categoryName || "Hokejové vybavení",
    imageUrl: p.imageUrl || "https://images.unsplash.com/photo-1515523110800-9415d13b84a8?auto=format&fit=crop&q=80&w=800",
    isNew: i % 15 === 0
  }));

  // Seskupení duplicitních velikostí/variant pod jeden unikátní produkt
  const uniqueProductsMap = new Map<string, any>();
  for (const item of formatted) {
    if (!uniqueProductsMap.has(item.name)) {
      uniqueProductsMap.set(item.name, item);
    }
  }

  const finalFormatted = Array.from(uniqueProductsMap.values());
  fs.writeFileSync("./src/preview_data.json", JSON.stringify(finalFormatted, null, 2));
  console.log(`Data vyexportována do src/preview_data.json (${finalFormatted.length} unikátních produktů)`);
  process.exit(0);
}

exportPreview().catch(console.error);
