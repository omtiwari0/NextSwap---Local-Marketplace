import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import AuthLanding from '../screens/auth/AuthLanding';

type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  OTP: { email: string; profile: { email: string; phone: string; name: string; photoURL?: string | null; password: string } };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Landing">
      <Stack.Screen name="Landing" component={AuthLanding} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
  {/* OTP entry for email verification */}
  <Stack.Screen name="OTP" getComponent={() => require('../screens/auth/OTPScreen').default} options={{ title: 'Verify Email' }} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;