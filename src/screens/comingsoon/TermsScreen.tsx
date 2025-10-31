import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const TermsScreen: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>Terms & Conditions</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ marginBottom: 12, color: '#374151' }}>
          These are placeholder Terms & Conditions for the NearSwap app. Replace this content with your actual terms,
          including acceptable use, prohibited items, payment policies, refunds, dispute handling, and other legal
          requirements.
        </Text>
        <Text style={{ marginBottom: 8, fontWeight: '700' }}>1. Acceptance of Terms</Text>
        <Text style={{ marginBottom: 12, color: '#374151' }}>By using NearSwap, you agree to comply with these terms...</Text>
        <Text style={{ marginBottom: 8, fontWeight: '700' }}>2. User Responsibilities</Text>
        <Text style={{ marginBottom: 12, color: '#374151' }}>Users must provide accurate information and comply with local laws...</Text>
        <Text style={{ marginBottom: 8, fontWeight: '700' }}>3. Listings and Transactions</Text>
        <Text style={{ marginBottom: 12, color: '#374151' }}>All items must be accurately described. NearSwap is not a party to transactions...</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

export default TermsScreen
