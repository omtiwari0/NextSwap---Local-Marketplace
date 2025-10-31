import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import HomeScreen from '../screens/CampusMarketplace';
import SwapScreen from '../screens/swap/SwapScreen';
import CreateListingScreen from '../screens/listings/CreateListingScreen';
import ListingDetailScreen from '../screens/listings/ListingDetailScreen';
import EditListingScreen from '../screens/listings/EditListingScreen';
import NearbyProductsScreen from '../screens/home/NearbyProductsScreen';
import FavoritesScreen from '../screens/comingsoon/FavoritesScreen';
import ChatsScreen from '../screens/comingsoon/ChatsScreen';
import OrdersScreen from '../screens/comingsoon/OrdersScreen';
import ProfileScreen from '../screens/comingsoon/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import { MyListingsScreen } from '../screens/listings';
import TermsScreen from '../screens/comingsoon/TermsScreen';
import FaqsScreen from '../screens/comingsoon/FaqsScreen';
import ChatWindowScreen from '../screens/comingsoon/ChatWindowScreen';

type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Swap: undefined;
  CreateListing: undefined;
  ListingDetail: { id: string; item?: any };
  EditListing: { id: string; item?: any };
  EditProfile: undefined;
  FavoritesSoon: undefined;
  ChatsSoon: undefined;
  OrdersSoon: undefined;
  ProfileSoon: undefined;
  NearbyProducts: undefined;
  MyListings: undefined;
  Terms: undefined;
  Faqs: undefined;
  ChatWindow: { chatId: string; title?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false, presentation: 'modal' }} />
  <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Swap" component={SwapScreen} />
      <Stack.Screen name="CreateListing" component={CreateListingScreen} options={{ title: 'Create Listing' }} />
  <Stack.Screen name="EditListing" component={EditListingScreen} options={{ title: 'Edit Listing' }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Listing' }} />
      <Stack.Screen name="FavoritesSoon" component={FavoritesScreen} options={{ title: 'Favorites', headerShown: false }} />
  <Stack.Screen name="ChatsSoon" component={ChatsScreen} options={{ title: 'Chats', headerShown: false }} />
      <Stack.Screen name="OrdersSoon" component={OrdersScreen} options={{ title: 'Orders', headerShown: false }} />
      <Stack.Screen name="ProfileSoon" component={ProfileScreen} options={{ title: 'Profile', headerShown: false }} />
  <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit profile' }} />
      <Stack.Screen name="NearbyProducts" component={NearbyProductsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MyListings" component={MyListingsScreen} options={{ title: 'My Listings' }} />
  <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Terms & Conditions' }} />
  <Stack.Screen name="Faqs" component={FaqsScreen} options={{ title: 'FAQs' }} />
    <Stack.Screen name="ChatWindow" component={ChatWindowScreen} options={{ title: 'Chat' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;