import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const isGmail = useMemo(() => /^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(email.trim()), [email])
  const emailValid = useMemo(() => email.trim().length > 0 && isGmail, [email, isGmail])
  const passwordValid = useMemo(() => password.length >= 6, [password])
  const canSubmit = emailValid && passwordValid && !loading

  const onLogin = async () => {
    setFormError(null)
    if (!canSubmit) return
    try {
      await login(email.trim(), password)
      navigation.navigate('Home')
    } catch (e: any) {
      const message = (e?.message || '').toString()
      setFormError(message || 'Login failed. Check your email and password.')
    }
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
      {!emailValid && email.length > 0 && (
        <Text style={styles.error}>Enter a valid Gmail address (example@gmail.com)</Text>
      )}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {!passwordValid && password.length > 0 && (
        <Text style={styles.error}>Password must be at least 6 characters</Text>
      )}
      {formError && <Text style={styles.error}>{formError}</Text>}
  <Button title={loading ? 'Logging in…' : 'Login'} onPress={onLogin} disabled={!canSubmit} />
  {/* Show a nudge to register if account not found */}
  <Text style={{ color: '#6b7280', marginTop: 8, textAlign: 'center' }}>Don’t have an account? Create one</Text>
      {/* Removed Google sign-in button per request */}
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
  error: {
    color: '#b91c1c',
    marginTop: -8,
    marginBottom: 12,
  },
});

export default LoginScreen;