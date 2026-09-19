export interface StoreTheme {
  primary: string;
  secondary: string;
  accent: string;
  badgeBg: string;
  bgGradient: string;
  tagText: string;
}

export const STORE_THEMES: Record<string, StoreTheme> = {
  amazon: {
    primary: "#FF9900",
    secondary: "#146EB4",
    accent: "#F59E0B",
    badgeBg: "linear-gradient(135deg, #FF9900 0%, #D97706 100%)",
    bgGradient: "radial-gradient(circle at 50% 20%, rgba(255, 153, 0, 0.18) 0%, rgba(8, 12, 22, 1) 75%)",
    tagText: "AMAZON VERIFIED LOOT",
  },
  flipkart: {
    primary: "#2874F0",
    secondary: "#FFE500",
    accent: "#38BDF8",
    badgeBg: "linear-gradient(135deg, #2874F0 0%, #1D4ED8 100%)",
    bgGradient: "radial-gradient(circle at 50% 20%, rgba(40, 116, 240, 0.18) 0%, rgba(8, 12, 22, 1) 75%)",
    tagText: "FLIPKART SUPER DEALS",
  },
  myntra: {
    primary: "#FF3F6C",
    secondary: "#F43F5E",
    accent: "#FB7185",
    badgeBg: "linear-gradient(135deg, #FF3F6C 0%, #E11D48 100%)",
    bgGradient: "radial-gradient(circle at 50% 20%, rgba(255, 63, 108, 0.18) 0%, rgba(8, 12, 22, 1) 75%)",
    tagText: "MYNTRA FASHION LOOT",
  },
  ajio: {
    primary: "#D5A253",
    secondary: "#2C4152",
    accent: "#E2B874",
    badgeBg: "linear-gradient(135deg, #D5A253 0%, #B8860B 100%)",
    bgGradient: "radial-gradient(circle at 50% 20%, rgba(213, 162, 83, 0.18) 0%, rgba(8, 12, 22, 1) 75%)",
    tagText: "AJIO LUXE DROP",
  },
  swiggy: {
    primary: "#FC8019",
    secondary: "#F59E0B",
    accent: "#F97316",
    badgeBg: "linear-gradient(135deg, #FC8019 0%, #EA580C 100%)",
    bgGradient: "radial-gradient(circle at 50% 20%, rgba(252, 128, 25, 0.18) 0%, rgba(8, 12, 22, 1) 75%)",
    tagText: "SWIGGY INSTA DROP",
  },
  blinkit: {
    primary: "#F8CB46",
    secondary: "#10B981",
    accent: "#EAB308",
    badgeBg: "linear-gradient(135deg, #F8CB46 0%, #D97706 100%)",
    bgGradient: "radial-gradient(circle at 50% 20%, rgba(248, 203, 70, 0.18) 0%, rgba(8, 12, 22, 1) 75%)",
    tagText: "BLINKIT 10-MIN LOOT",
  },
  default: {
    primary: "#6366F1",
    secondary: "#10B981",
    accent: "#818CF8",
    badgeBg: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
    bgGradient: "radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.16) 0%, rgba(8, 12, 22, 1) 75%)",
    tagText: "VERIFIED LOOT DROP",
  },
};

export interface DealShortProps {
  title: string;
  brand: string;
  salePrice: number;
  mrp: number;
  discountPct: number;
  store: string;
  worthScore: number;
  imageUrl: string;
  coupon?: string;
  handle: string;
  verifiedAt: string;
  affiliateUrl?: string;
  qrCodeDataUrl?: string;
  audioBgm?: string;
  audioVoice?: string;
  enableAudio?: boolean;
  themeName?: string;
}

export const DEFAULT_DEAL_PROPS: DealShortProps = {
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
  themeName: "amazon",
};
