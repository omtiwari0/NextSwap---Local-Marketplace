import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const FaqsScreen: React.FC = () => {
  const faqs = [
    { q: 'How do I create a listing?', a: 'Go to Add from the bottom bar or Profile → My Listings and tap Create Listing.' },
    { q: 'How do I contact a seller?', a: 'Open a listing and use the chat option (coming soon) to message the seller.' },
    { q: 'Why Gmail only?', a: 'We currently accept Gmail for signup to reduce spam; more providers will be added later.' },
    { q: 'What image types are allowed?', a: 'JPEG and PNG up to 5MB per image.' },
  ]
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>FAQs</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {faqs.map((f, i) => (
          <View key={i} style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: '700', marginBottom: 4 }}>{f.q}</Text>
            <Text style={{ color: '#374151' }}>{f.a}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

export default FaqsScreen
