import JSZip from "jszip";

export async function parsePptxText(fileBlob: Blob): Promise<string[][]> {
  try {
    const zip = await JSZip.loadAsync(fileBlob);
    const slideTexts: string[][] = [];
    
    let slideNum = 1;
    while (true) {
      const slidePath = `ppt/slides/slide${slideNum}.xml`;
      const slideFile = zip.file(slidePath);
      if (!slideFile) break;
      
      const xmlContent = await slideFile.async("text");
      
      // Extract all text inside <a:t>...</a:t> XML tags
      const textMatches: string[] = [];
      const regex = /<a:t>([^<]*)<\/a:t>/g;
      let match;
      while ((match = regex.exec(xmlContent)) !== null) {
        const textVal = match[1].trim();
        if (textVal && textVal.length > 0) {
          // Decode simple XML entities
          const decoded = textVal
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'");
          textMatches.push(decoded);
        }
      }
      
      slideTexts.push(textMatches);
      slideNum++;
    }
    
    return slideTexts;
  } catch (err) {
    console.error("Error parsing PPTX binary via JSZip:", err);
    return [];
  }
}
