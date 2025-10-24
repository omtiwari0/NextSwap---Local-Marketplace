import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';

const RegisterScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<any>();
  const { register, loginWithGoogle, loading } = useAuth();
  const [phone, setPhone] = useState('')

  const handleRegister = async () => {
    try {
      await register(email, password, phone);
      Alert.alert('Registration Successful', 'You can now log in.');
      navigation.navigate('Login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Registration Failed', message);
    }
  };

  return (
    <View className="flex-1 justify-center p-4">
      <Text className="text-2xl font-bold mb-4">Register</Text>
      <TextInput
        className="border border-gray-300 p-2 mb-4"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        className="border border-gray-300 p-2 mb-4"
        placeholder="Phone (optional)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoCapitalize="none"
      />
      <TextInput
        className="border border-gray-300 p-2 mb-4"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={loading ? 'Creating…' : 'Create Account'} onPress={handleRegister} />
      <Pressable className="mt-4" onPress={() => loginWithGoogle().then(() => navigation.navigate('Home'))}>
        <Text className="text-blue-600">Continue with Google</Text>
      </Pressable>
      <Pressable className="mt-4" onPress={() => navigation.navigate('Login')}>
        <Text className="text-blue-600">Back to Login</Text>
      </Pressable>
    </View>
  );
};

export default RegisterScreen;