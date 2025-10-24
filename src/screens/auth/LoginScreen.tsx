import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { login, loginWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const onLogin = async () => {
    await login(email, password)
    navigation.navigate('Home')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={loading ? 'Logging in…' : 'Login'} onPress={onLogin} />
      <Pressable style={{ marginTop: 16 }} onPress={() => loginWithGoogle().then(() => navigation.navigate('Home'))}>
        <Text style={{ color: '#1877f2', fontWeight: '600' }}>Continue with Google</Text>
      </Pressable>
      <Pressable style={{ marginTop: 8 }} onPress={() => navigation.navigate('Register')}>
        <Text>Create an account</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default LoginScreen;