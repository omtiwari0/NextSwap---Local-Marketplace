import React from 'react'
import { View, Text, Pressable, TextInput, Switch } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export type Condition = 'new' | 'like-new' | 'good' | 'fair'

type Props = {
  visible: boolean
  onClose: () => void
  priceMin: string
  priceMax: string
  setPriceMin: (v: string) => void
  setPriceMax: (v: string) => void
  conditions: Condition[]
  selectedConditions: Condition[]
  setSelectedConditions: (next: Condition[]) => void
  barterOnly: boolean
  setBarterOnly: (v: boolean) => void
  onClear: () => void
  onApply: () => void
}

const FilterModal: React.FC<Props> = ({ visible, onClose, priceMin, priceMax, setPriceMin, setPriceMax, conditions, selectedConditions, setSelectedConditions, barterOnly, setBarterOnly, onClear, onApply }) => {
  if (!visible) return null
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>Filters</Text>
          <Pressable onPress={onClose}><Ionicons name="close" size={22} /></Pressable>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 6 }}>Price Range</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput value={priceMin} onChangeText={setPriceMin} keyboardType="numeric" placeholder="Min" style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, width: 100, marginRight: 12 }} />
            <Text>to</Text>
            <TextInput value={priceMax} onChangeText={setPriceMax} keyboardType="numeric" placeholder="Max" style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, width: 100, marginLeft: 12 }} />
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 6 }}>Condition</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {conditions.map((c) => {
              const active = selectedConditions.includes(c)
              return (
                <Pressable key={c} onPress={() => {
                  const next = active ? selectedConditions.filter((v) => v !== c) : [...selectedConditions, c]
                  setSelectedConditions(next)
                }} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: active ? '#2563eb' : '#e5e7eb', marginRight: 8, marginBottom: 8 }}>
                  <Text style={{ color: active ? '#fff' : '#374151', textTransform: 'capitalize' }}>{c.replace('-', ' ')}</Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: '600' }}>Barter Allowed Only</Text>
          <Switch value={barterOnly} onValueChange={setBarterOnly} />
        </View>

        <View style={{ flexDirection: 'row', gap: 12 as any, marginTop: 8, marginBottom: 8 }}>
          <Pressable onPress={onClear} style={{ flex: 1, backgroundColor: '#e5e7eb', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
            <Text style={{ color: '#374151', fontWeight: '700' }}>Clear All</Text>
          </Pressable>
          <Pressable onPress={onApply} style={{ flex: 1, backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Apply</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

export default FilterModal
