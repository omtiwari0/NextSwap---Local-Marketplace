export type NavigationParams = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Swap: undefined;
};

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface SwapData {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
}

export interface ListingImage {
  uri: string;
}

export interface Listing {
  id: string;
  title: string;
  category: string;
  price: number;
  barter: boolean;
  description: string;
  images: ListingImage[];
  user: {
    id: string;
    name: string;
    verified: boolean;
  };
  createdAt?: string;
  // Optional marketplace fields for filters/sorting and display
  condition?: 'new' | 'like-new' | 'good' | 'fair';
  originalPrice?: number;
  location?: string;
  sold?: boolean;
}

export interface Order {
  id: string;
  listing: { id: string; title: string; imageUri?: string | null } | null;
  status: 'pending' | 'confirmed';
  role: 'buyer' | 'seller';
  createdAt: string; // ISO string
}