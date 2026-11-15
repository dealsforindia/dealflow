export interface PublicDeal {
  fp_hash?: string | null;
  original_text?: string | null;
  aff_text?: string | null;
  id: string;
  title: string;
  price: number | null;
  sale_price?: number | null;
  prices?: { sale?: number | null; mrp?: number | null; discount_pct?: number | null };
  mrp: number | null;
  discount_pct: number | null;
  store: string;
  image: string | null;
  url: string;
  category: string;
  posted_at: number;
  rating?: number | null;
  rating_count?: number | null;
  review_count?: number | null;
  brand?: string | null;
  highlights?: string[];
  description?: string | null;
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
  is_community_verified?: boolean;
  deal_score?: number | null;
  is_lowest_price?: boolean;
  regular_price?: number | null;
  displayRegularPrice?: number | null;
  cluster_count?: number;
  cluster_channels?: string[];
  consensus_badge?: string;
  deal_badges?: string[];
  is_expired?: boolean;
  status?: string;
  display_ts?: number;
  heat_score?: number;
  heat_badge?: {
    tier: string;
    label: string;
    emoji: string;
    color: string;
  };
  has_video?: boolean;
  video_url?: string;
  video_cover?: string;
  video_preview?: string;
  video_status?: string;
  deal_type?: string;
  is_mega_haul?: boolean;
  haul_store?: string;
  pincodes?: string[];
  items?: MegaHaulItem[];
  is_multi_deal?: boolean;
  multi_deal_count?: number;
  multi_items?: MultiDealItem[];
  arbitrage?: {
    winnerStore: string;
    savingsVsOthers: number;
    stores: Array<{ store: string; price: number; inStock: boolean; url?: string }>;
  } | null;
  sellout_prediction?: {
    predicted_remaining_hours: number;
    survival_probability: number;
    urgency_level: 'critical' | 'high' | 'moderate' | 'low';
    urgency_label: string;
    hazard_rate: number;
    confidence: number;
    discount_band: string;
    hours_alive: number;
    clicks_per_hour: number;
  } | null;
  consensus?: {
    channels_spotted: number;
    consensus_velocity: number;
    is_viral: boolean;
    viral_label: string | null;
  } | null;
  price_position?: {
    percentile: number;
    is_all_time_low: boolean;
    vs_average: number;
    lowest_ever: number | null;
    highest_ever: number | null;
    avg_price: number | null;
    price_label: string;
  } | null;
}

export interface MegaHaulItem {
  id: string;
  title: string;
  pincode?: string | null;
  city?: string | null;
  sale_price: number | null;
  mrp: number | null;
  discount_pct: number | null;
  buy_url: string;
  img_url?: string | null;
  store?: string;
}

export interface MultiDealItem {
  label: string;
  url: string;
  price?: number | null;
  discount?: number | null;
}


export interface CreditCardProfile {
  id: string;
  name: string;
  bank: string;
  rewardText: string;
  colorGradient: string;
  borderColor: string;
  accentColor: string;
  cashbackPct: number;
  stores: string[]; // e.g. ['Amazon'], ['Flipkart'], ['All']
  monthlyCap?: number;
}

export interface CardSavingsResult {
  cardName: string;
  bank: string;
  cashbackPct: number;
  cashbackAmount: number;
  effectivePrice: number;
  colorGradient: string;
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
  regular_price?: number | null;
  mrp?: number | null;
  discount_pct?: number | null;
  image: string;
  url: string;
  store: string;
  usually_price?: number | null;
  worth_score?: number;
  worth_label?: string;
  is_verified_deal: boolean;
  in_stock?: boolean;
  is_lowest_price?: boolean;
  lowest_price?: number | null;
  history?: Array<[number, number]>;
  savings?: number | null;
  verdict: string;
  stock_text?: string | null;
}

export type SortOption = 'worth' | 'newest' | 'discount' | 'price_low' | 'price_high';
export type NavTab = 'home' | 'ending_soon' | 'best_worth' | 'active_offers' | 'lookup' | 'submit_deal' | 'about' | 'how_we_verify' | 'wall_of_happiness' | 'contact' | 'saved' | 'profile';

export interface CommunityBrag {
  id: string;
  name: string;
  city: string;
  product: string;
  store: string;
  sale_price: number;
  saved_amount: number;
  comment: string;
  relative_time: string;
  avatar_bg?: string;
}

export interface WallStats {
  total_saved_inr: number;
  formatted_savings: string;
  active_deals_count: number;
  verified_shoppers_count: number;
  satisfaction_rate: string;
  updated_at: number;
}

export interface TickerItem {
  id: string;
  title: string;
  price: number;
  mrp: number;
  discount_pct: number;
  store: string;
  image?: string;
  url: string;
  badge?: string;
  relative_time?: string;
  consensus_count?: number;
  worth_score?: number;
}

export interface TickerResponse {
  items: TickerItem[];
  stats: {
    total_live_deals: number;
    today_drops: number;
    avg_discount: number;
    updated_at: number;
  };
}

export interface CategoryStoryItem {
  is_expired?: boolean;
  is_over?: boolean;
  id: string;
  title: string;
  price: number;
  mrp: number;
  discount_pct: number;
  store: string;
  image?: string;
  url: string;
}

export interface CategoryStoryCollection {
  id: string;
  title: string;
  emoji: string;
  ring_color: string;
  badge: string;
  category_filter: string;
  items: CategoryStoryItem[];
}

export interface StoriesResponse {
  stories: CategoryStoryCollection[];
  updated_at: number;
}

