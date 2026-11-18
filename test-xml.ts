import { XMLParser } from "fast-xml-parser";

async function testXml() {
  console.log("Fetching XML...");
  const res = await fetch("https://hejduksport.blob.core.windows.net/hejduksport/feed/vo-feed-moc-heureka-ps-ver2_cs_CZK.xml");
  const xmlData = await res.text();
  console.log("Parsing XML...");
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
  });
  const parsed = parser.parse(xmlData);
  const items = parsed.SHOP.SHOPITEM;
  
  const allNames = items.map((item: any) => item.PRODUCTNAME);
  const uniqueNames = new Set(allNames);
  
  console.log(`Celkem položek ve feedu: ${items.length}`);
  console.log(`Celkem UNIKÁTNÍCH produktů ve feedu: ${uniqueNames.size}`);
}

testXml();
