import type { Listing } from '../types'

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Swap: undefined;
  CreateListing: undefined;
  ListingDetail: { id: string; item?: Listing };
  EditListing: { id: string; item?: Listing };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
};

export type SwapStackParamList = {
  Swap: undefined;
};