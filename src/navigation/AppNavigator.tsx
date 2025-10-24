import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import HomeScreen from '../screens/CampusMarketplace';
import SwapScreen from '../screens/swap/SwapScreen';
import CreateListingScreen from '../screens/listings/CreateListingScreen';
import ListingDetailScreen from '../screens/listings/ListingDetailScreen';
import NearbyProductsScreen from '../screens/home/NearbyProductsScreen';
import FavoritesScreen from '../screens/comingsoon/FavoritesScreen';
import ChatsScreen from '../screens/comingsoon/ChatsScreen';
import OrdersScreen from '../screens/comingsoon/OrdersScreen';
import ProfileScreen from '../screens/comingsoon/ProfileScreen';

type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Swap: undefined;
  CreateListing: undefined;
  ListingDetail: { id: string; item?: any };
  FavoritesSoon: undefined;
  ChatsSoon: undefined;
  OrdersSoon: undefined;
  ProfileSoon: undefined;
  NearbyProducts: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false, presentation: 'modal' }} />
  <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Swap" component={SwapScreen} />
      <Stack.Screen name="CreateListing" component={CreateListingScreen} options={{ title: 'Create Listing' }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Listing' }} />
      <Stack.Screen name="FavoritesSoon" component={FavoritesScreen} options={{ title: 'Favorites', headerShown: false }} />
  <Stack.Screen name="ChatsSoon" component={ChatsScreen} options={{ title: 'Chats', headerShown: false }} />
      <Stack.Screen name="OrdersSoon" component={OrdersScreen} options={{ title: 'Orders', headerShown: false }} />
      <Stack.Screen name="ProfileSoon" component={ProfileScreen} options={{ title: 'Profile', headerShown: false }} />
      <Stack.Screen name="NearbyProducts" component={NearbyProductsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;