export interface PublicDeal {
  id: string;
  title: string;
  price: number | null;
  mrp: number | null;
  discount_pct: number | null;
  store: 'Amazon' | 'Flipkart' | 'Myntra' | 'AJIO' | 'Swiggy Instamart' | 'Zepto' | 'Blinkit' | 'Croma' | string;
  image: string | null;
  url: string;
  category: string;
  posted_at: number;
  coupon?: string | null;
  coupon_discount?: number | null;
  effective_price?: number | null;
  usually_price?: number | null;
  savings?: number | null;
  worth_score?: number;
  worth_label?: string;
  expiry_mins?: number;
  stock_status?: string;
  is_over?: boolean;
}

export interface CuratedBundleItem {
  id: string;
  title: string;
  store: string;
  price: number;
  mrp: number;
  image: string;
  url: string;
  category: string;
}

export interface CuratedBundle {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  themeColor: string;
  gradient: string;
  icon: string;
  items: CuratedBundleItem[];
  totalPrice: number;
  totalMrp: number;
  savings: number;
  discountPct: number;
}

export interface ActiveOffer {
  id: string;
  title: string;
  store: string;
  storeLogo?: string;
  code?: string;
  description: string;
  discountBadge: string;
  validTill: string;
  link: string;
  type: 'bank' | 'voucher' | 'wallet';
  minSpend?: string;
}

export interface CustomerReview {
  id: string;
  author: string;
  location: string;
  productName: string;
  savingsText: string;
  store: string;
  comment: string;
  imageUrl?: string;
  rating: number;
  date: string;
}

export interface PublicDealsResponse {
  deals: PublicDeal[];
  total: number;
  limit: number;
  skip: number;
  has_more: boolean;
}

export interface LookupResult {
  title: string;
  price: number;
  mrp?: number | null;
  discount_pct?: number | null;
  image: string;
  url: string;
  store: string;
  usually_price?: number | null;
  worth_score?: number;
  worth_label?: string;
  is_verified_deal: boolean;
  savings?: number | null;
  verdict: string;
}

export type SortOption = 'worth' | 'newest' | 'discount' | 'price_low' | 'price_high';
export type NavTab = 'home' | 'ending_soon' | 'best_worth' | 'active_offers' | 'lookup' | 'reviews' | 'submit_deal' | 'about' | 'how_we_verify' | 'contact';

