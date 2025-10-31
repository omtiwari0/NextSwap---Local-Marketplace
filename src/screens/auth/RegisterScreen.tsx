import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Alert, Pressable, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// Removed Google auth from UI per request
import * as ImagePicker from 'expo-image-picker';
import { Auth } from '../../services/auth.service';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const navigation = useNavigation<any>();
  const [phone, setPhone] = useState('')
  const [photo, setPhoto] = useState<string | undefined>(undefined)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const isGmail = useMemo(() => /^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(email.trim()), [email])
  const passwordStrength = useMemo(() => {
    const p = password
    let score = 0
    if (p.length >= 6) score++
    if (/[A-Z]/.test(p)) score++
    if (/[a-z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    // normalize to 0-3
    const normalized = Math.min(3, Math.max(0, Math.floor((score / 5) * 3)))
    const map = [
      { label: 'Weak', color: '#ef4444', widthPct: 33 },
      { label: 'Medium', color: '#f59e0b', widthPct: 66 },
      { label: 'Strong', color: '#10b981', widthPct: 100 },
    ]
    return map[Math.max(0, normalized - 1)] ?? { label: 'Weak', color: '#ef4444', widthPct: 33 }
  }, [password])
  const digitsPhone = useMemo(() => phone.replace(/\D/g, ''), [phone])
  const isValid = useMemo(() => {
    const emailOk = isGmail
    const nameOk = name.trim().length >= 2
    const phoneOk = digitsPhone.length === 10
    const passOk = password.length >= 6
    return emailOk && nameOk && phoneOk && passOk
  }, [email, name, digitsPhone, password, isGmail])

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: true, aspect:[1,1] });
    if (!result.canceled) {
      setPhoto(result.assets[0]?.uri);
    }
  }

  const handleNext = async () => {
    // Email-based OTP flow
    if (!isGmail) {
      Alert.alert('Gmail required', 'Only Gmail accounts can sign up (example@gmail.com).');
      return;
    }
    if (digitsPhone.length !== 10) {
      Alert.alert('Phone required', 'Please enter a 10-digit phone number (digits only).');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password too short', 'Please set a password with at least 6 characters.');
      return;
    }
    setSubmitting(true)
    try {
      // Ensure we send only digits to the API
      await Auth.startEmailOtp(email.trim(), name.trim(), digitsPhone, password)
      Alert.alert('Check your email', 'We sent a 6-digit code to your inbox.')
  navigation.navigate('OTP', { email: email.trim(), profile: { email: email.trim(), phone: phone.trim(), name, photoURL: photo, password } })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      // If account exists, guide user to Login
      if (/already exists|in use|409/i.test(message)) {
        Alert.alert('Account exists', message, [
          { text: 'Go to Login', onPress: () => navigation.navigate('Login') },
          { text: 'OK' },
        ])
      } else {
        Alert.alert('Failed to send OTP', message)
      }
    } finally {
      setSubmitting(false)
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#111827' }}>Create your account</Text>
              <Text style={{ marginTop: 6, color: '#6b7280' }}>Step 1 of 2 — We’ll send an OTP to verify your phone</Text>
            </View>

            {/* Card */}
            <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
              {/* Avatar */}
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <Pressable onPress={pickPhoto} accessibilityRole="button" accessibilityLabel="Add profile photo">
                  <View style={{ width: 96, height: 96, borderRadius: 48, overflow: 'hidden', backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }}>
                    {photo ? (
                      <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <Ionicons name="camera" size={28} color="#9ca3af" />
                    )}
                  </View>
                </Pressable>
                <Text style={{ color: '#6b7280', marginTop: 8 }}>Add a photo</Text>
              </View>

              {/* Name */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: '600', color: '#374151', marginBottom: 6 }}>Full name</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 10, backgroundColor: '#f9fafb' }}>
                  <Ionicons name="person-outline" size={18} color="#9ca3af" />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g., John Doe"
                    autoCapitalize="words"
                    style={{ flex: 1, paddingVertical: 10, paddingLeft: 8 }}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: '600', color: '#374151', marginBottom: 6 }}>Email</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 10, backgroundColor: '#f9fafb' }}>
                  <Ionicons name="mail-outline" size={18} color="#9ca3af" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{ flex: 1, paddingVertical: 10, paddingLeft: 8 }}
                  />
                </View>
                {!!email && !isGmail && (
                  <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 6 }}>Please enter a valid Gmail address (example@gmail.com)</Text>
                )}
              </View>

              {/* Phone (required) */}
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: '600', color: '#374151', marginBottom: 6 }}>Phone</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 10, backgroundColor: '#f9fafb' }}>
                  <Ionicons name="call-outline" size={18} color="#9ca3af" />
                  <TextInput
                    value={phone}
                    onChangeText={(t) => {
                      const onlyDigits = t.replace(/\D/g, '').slice(0, 10)
                      setPhone(onlyDigits)
                    }}
                    placeholder="10-digit phone number"
                    keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
                    maxLength={10}
                    autoCapitalize="none"
                    style={{ flex: 1, paddingVertical: 10, paddingLeft: 8 }}
                  />
                </View>
                {phone.length > 0 && phone.length < 10 && (
                  <Text style={{ color: '#ef4444', marginTop: 6, fontSize: 12 }}>Enter exactly 10 digits.</Text>
                )}
                <Text style={{ color: '#9ca3af', marginTop: 6, fontSize: 12 }}>We’ll send the OTP to your email.</Text>
              </View>

              {/* Password */}
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: '600', color: '#374151', marginBottom: 6 }}>Password</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 10, backgroundColor: '#f9fafb' }}>
                  <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="At least 6 characters"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    style={{ flex: 1, paddingVertical: 10, paddingLeft: 8 }}
                  />
                  <Pressable onPress={() => setShowPassword((s) => !s)} accessibilityRole="button" accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
                  </Pressable>
                </View>
                {/* Strength meter */}
                {password.length > 0 && (
                  <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, height: 6, backgroundColor: '#e5e7eb', borderRadius: 6, marginRight: 8 }}>
                      <View style={{ width: `${passwordStrength.widthPct}%`, height: '100%', backgroundColor: passwordStrength.color, borderRadius: 6 }} />
                    </View>
                    <Text style={{ color: '#6b7280', fontSize: 12 }}>{passwordStrength.label}</Text>
                  </View>
                )}
              </View>

              {/* Confirm password removed per request: single entry only */}

              {/* Primary action */}
              <Pressable
                onPress={handleNext}
                disabled={!isValid || submitting}
                accessibilityRole="button"
                accessibilityLabel="Next"
                style={{ marginTop: 8, backgroundColor: '#2563eb', opacity: !isValid || submitting ? 0.6 : 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' }}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>{submitting ? 'Sending OTP…' : 'Next'}</Text>
              </Pressable>

              {/* Removed Google sign-in option per request */}
            </View>

            {/* Footer */}
            <Pressable onPress={() => navigation.navigate('Login')} style={{ alignSelf: 'center', marginTop: 16 }}>
              <Text style={{ color: '#2563eb', fontWeight: '600' }}>Already have an account? Log in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;