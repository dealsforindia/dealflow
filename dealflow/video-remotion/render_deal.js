/**
 * DealFlow Remotion CLI & Cloud Renderer
 * Generates custom 1080x1920 Deal Shorts with automatic Neural Voiceover, Store Theming & Dynamic QR Code.
 * 
 * Usage:
 *   node render_deal.js --title "boAt Nirvana Ion" --price 1499 --mrp 7990 --discount 81 --store "Amazon" --image "https://..."
 * Or directly pass JSON:
 *   node render_deal.js --json '{"title":"...","salePrice":1499,...}'
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

async function main() {
  const args = process.argv.slice(2);
  let props = {
    title: "boAt Airdopes 141 Bluetooth Wireless Earbuds",
    brand: "boAt",
    salePrice: 899,
    mrp: 4490,
    discountPct: 80,
    store: "Amazon",
    worthScore: 94,
    imageUrl: "https://m.media-amazon.com/images/I/71IkDIETLlL._AC_UF1000,1000_QL80_.jpg",
    coupon: "SAVE100",
    handle: "@dealsforindia",
    verifiedAt: "Just Now • 0% Fake Deals",
    affiliateUrl: "https://indiadealhunts.in",
    enableAudio: true,
  };

  let specifiedOutput = null;
  let voiceLang = "hinglish"; // "hinglish" | "english"

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--json" && args[i + 1]) {
      try {
        const parsed = JSON.parse(args[i + 1]);
        props = { ...props, ...parsed };
      } catch (e) {
        console.error("Invalid JSON passed:", e.message);
      }
      i++;
    } else if (args[i] === "--title" && args[i + 1]) {
      props.title = args[++i];
    } else if (args[i] === "--brand" && args[i + 1]) {
      props.brand = args[++i];
    } else if (args[i] === "--price" && args[i + 1]) {
      props.salePrice = Number(args[++i]);
    } else if (args[i] === "--mrp" && args[i + 1]) {
      props.mrp = Number(args[++i]);
    } else if (args[i] === "--discount" && args[i + 1]) {
      props.discountPct = Number(args[++i]);
    } else if (args[i] === "--store" && args[i + 1]) {
      props.store = args[++i];
    } else if (args[i] === "--image" && args[i + 1]) {
      props.imageUrl = args[++i];
    } else if (args[i] === "--url" && args[i + 1]) {
      props.affiliateUrl = args[++i];
    } else if (args[i] === "--out" && args[i + 1]) {
      specifiedOutput = args[++i];
    } else if (args[i] === "--lang" && args[i + 1]) {
      voiceLang = args[++i].toLowerCase();
    } else if (args[i] === "--no-audio") {
      props.enableAudio = false;
    }
  }

  // Generate dynamic QR Code pointing to affiliate or product destination
  const targetUrl = props.affiliateUrl || `https://indiadealhunts.in?deal=${encodeURIComponent(props.title)}`;
  try {
    props.qrCodeDataUrl = await QRCode.toDataURL(targetUrl, {
      margin: 1,
      width: 280,
      color: { dark: "#0f172a", light: "#ffffff" },
    });
    console.log(`📱 Dynamic QR Code generated for: ${targetUrl}`);
  } catch (err) {
    console.warn("QR code generation warning:", err.message);
  }

  const outDir = path.join(__dirname, "out");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Clean title for voiceover (strip URLs, markdown symbols, excessive noise)
  const cleanTitleForVoice = (props.title || "Curated Deal")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/[*_~`#|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 75);

  const brandName = props.brand || cleanTitleForVoice.split(" ")[0] || "Deal";

  // Generate tailored neural voiceover if audio is enabled
  const timestamp = Date.now();
  let customVoiceFile = null;
  if (props.enableAudio) {
    try {
      let voiceText = "";
      let voiceModel = "en-IN-PrabhatNeural";

      if (voiceLang === "hinglish") {
        voiceModel = "hi-IN-MadhurNeural";
        voiceText = `Loot offer alert! ${brandName} ka ${cleanTitleForVoice} mil raha hai flat ${props.discountPct} percent off pe, sirf ${props.salePrice} rupees mein! Turant loot lo, QR code scan karo!`;
      } else {
        voiceModel = "en-IN-PrabhatNeural";
        voiceText = `Insane loot alert! ${brandName} ${cleanTitleForVoice} is now flat ${props.discountPct} percent off, down to just ${props.salePrice} rupees! Scan the QR code now to grab this deal!`;
      }

      const voiceFileName = `voice_${timestamp}.mp3`;
      const voiceFilePath = path.join(__dirname, "public", "audio", voiceFileName);
      
      console.log(`🎙️ Generating AI Neural Voiceover (${voiceModel}): "${voiceText}"`);
      execSync(`edge-tts --text "${voiceText.replace(/"/g, '\\"')}" --voice "${voiceModel}" --rate="+10%" --write-media "${voiceFilePath}"`, {
        stdio: "pipe"
      });
      
      if (fs.existsSync(voiceFilePath) && fs.statSync(voiceFilePath).size > 1000) {
        props.audioVoice = `audio/${voiceFileName}`;
        customVoiceFile = voiceFilePath;
        console.log(`✅ Voiceover generated: ${voiceFileName}`);
      }
    } catch (err) {
      console.warn(`⚠️ Voice synthesis fallback:`, err.message);
    }
  }

  const propsJson = JSON.stringify(props);
  const tempPropsFile = path.join(outDir, `props_${timestamp}.json`);
  fs.writeFileSync(tempPropsFile, propsJson, "utf8");

  const outputFile = specifiedOutput 
    ? (path.isAbsolute(specifiedOutput) ? specifiedOutput : path.join(__dirname, specifiedOutput))
    : path.join(outDir, `deal_${timestamp}.mp4`);

  console.log(`🎬 Rendering DealShort with dynamic props:`);
  console.log(`- Title: ${props.title}`);
  console.log(`- Price: ₹${props.salePrice} (M.R.P. ₹${props.mrp}) [${props.discountPct}% OFF]`);
  console.log(`- Store: ${props.store}`);
  console.log(`- QR Code: ${props.qrCodeDataUrl ? "Embedded" : "None"}`);
  console.log(`- Output: ${outputFile}\n`);

  try {
    execSync(`npx remotion render src/index.ts DealShort "${outputFile}" --props="${tempPropsFile}"`, {
      stdio: "inherit",
      cwd: __dirname
    });
    console.log(`\n✅ Render complete: ${outputFile}`);
  } finally {
    if (fs.existsSync(tempPropsFile)) {
      fs.unlinkSync(tempPropsFile);
    }
  }
}

main().catch(err => {
  console.error("Renderer error:", err);
  process.exit(1);
});
