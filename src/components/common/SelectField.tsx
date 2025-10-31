import React, { useState } from 'react'
import { View, Text, Pressable, Modal, FlatList } from 'react-native'

type Option = { label: string; value: string }

export default function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string
  value?: string
  onChange: (v: string) => void
  options: Option[]
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontWeight: '600', marginBottom: 6 }}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12 }}
      >
        <Text style={{ color: selected ? '#111827' : '#9ca3af' }}>
          {selected ? selected.label : (placeholder || 'Select...')}
        </Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setOpen(false)}>
          <View
            style={{ position: 'absolute', left: 16, right: 16, bottom: 40, backgroundColor: '#fff', borderRadius: 12, maxHeight: '50%' }}
          >
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.value)
                    setOpen(false)
                  }}
                  style={{ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}
                >
                  <Text style={{ color: '#111827', fontWeight: item.value === value ? '700' : '400' }}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}
