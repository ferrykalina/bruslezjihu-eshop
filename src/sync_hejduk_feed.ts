import { XMLParser } from "fast-xml-parser";
import { db } from "./db/index";
import { products, categories } from "./db/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const FEED_URL = "https://hejduksport.blob.core.windows.net/hejduksport/feed/vo-feed-moc-heureka-ps-ver2_cs_CZK.xml";

function getSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function syncFeed() {
  console.log("Stahuji XML feed...");
  const res = await fetch(FEED_URL);
  const xmlData = await res.text();
  console.log("XML staženo. Parsování...");

  const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
  });
  
  const parsed = parser.parse(xmlData);
  const items = parsed.SHOP.SHOPITEM;
  console.log(`Nalezeno celkem ${items.length} položek. Synchronizuji do databáze a stahuji kategorie...`);

  // Cache kategorií pro extrémní rychlost
  const categoryCache = new Map<string, number>();

  // Načteme stávající kategorie z DB do cache
  console.log("Načítám stávající kategorie...");
  const existingCategories = await db.select().from(categories);
  for (const cat of existingCategories) {
    categoryCache.set(cat.slug, cat.id);
  }

  let count = 0;
  const processedProducts = [];

  for (const item of items) {
    const xmlId = item.ITEM_ID;
    const name = item.PRODUCTNAME;
    const price = parseFloat(item.PRICE_VAT || "0");
    const itemGroupId = item.ITEMGROUP_ID;
    const description = item.DESCRIPTION || "";
    const imageUrl = item.IMGURL || "https://images.unsplash.com/photo-1515523110800-9415d13b84a8?auto=format&fit=crop&q=80&w=800";
    
    // Zpracování kategorií z CATEGORYTEXT
    const parts = item.CATEGORYTEXT ? String(item.CATEGORYTEXT).split('|').map(p => p.trim()) : ['Ostatní'];
    const categoryName = parts[parts.length - 1] || 'Ostatní';
    const categorySlug = getSlug(categoryName);

    let categoryId: number;

    if (categoryCache.has(categorySlug)) {
      categoryId = categoryCache.get(categorySlug)!;
    } else {
      // Vložíme novou kategorii
      console.log(`Vytvářím novou kategorii: ${categoryName} (${categorySlug})`);
      const [newCat] = await db.insert(categories).values({
        name: categoryName,
        slug: categorySlug,
      }).returning({ id: categories.id });
      
      categoryId = newCat.id;
      categoryCache.set(categorySlug, categoryId);
    }

    // Upsert produktu v DB
    const existing = await db.select().from(products).where(eq(products.xmlId, String(xmlId)));
    let dbProductId: number;

    if (existing.length > 0) {
      const [updated] = await db.update(products).set({
        name,
        price: price.toString(),
        imageUrl,
        categoryId,
        description,
        stock: item.DELIVERY_DATE === '0' ? 12 : 2,
      }).where(eq(products.xmlId, String(xmlId))).returning({ id: products.id });
      
      dbProductId = updated.id;
    } else {
      const [inserted] = await db.insert(products).values({
        xmlId: String(xmlId),
        itemGroupId: itemGroupId ? String(itemGroupId) : null,
        name,
        description,
        price: price.toString(),
        stock: item.DELIVERY_DATE === '0' ? 12 : 2,
        imageUrl,
        categoryId,
      }).returning({ id: products.id });
      
      dbProductId = inserted.id;
    }

    processedProducts.push({
      id: String(dbProductId),
      name,
      price,
      category: categoryName,
      imageUrl,
      isNew: count % 15 === 0,
    });

    count++;
    if (count % 200 === 0) {
      console.log(`Zpracováno ${count} / ${items.length} produktů`);
    }
  }

  // Seskupíme unikátní produkty pro frontend, aby se v katalogu nezobrazovaly stejné karty pro různé velikosti
  const uniqueFrontendProductsMap = new Map<string, any>();
  for (const prod of processedProducts) {
    const key = prod.name;
    if (!uniqueFrontendProductsMap.has(key)) {
      uniqueFrontendProductsMap.set(key, prod);
    }
  }

  const frontendData = Array.from(uniqueFrontendProductsMap.values());
  fs.writeFileSync("./src/preview_data.json", JSON.stringify(frontendData, null, 2));
  console.log(`Data vyexportována do src/preview_data.json (${frontendData.length} produktů)`);

  console.log("Synchronizace celého feedu a roztřídění do kategorií dokončeno úspěšně!");
  process.exit(0);
}

syncFeed().catch(console.error);
