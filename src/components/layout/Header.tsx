import React from 'react';
import { View, Text } from 'react-native';
import { useAuthStore } from '../../store/authStore';

const Header: React.FC = () => {
  const isVerified = useAuthStore((s: any) => s.isVerified)
  return (
    <View className="bg-blue-500 p-4 flex-row items-center justify-between">
      <Text className="text-white text-lg font-bold">NearSwap</Text>
      {isVerified && (
        <View className="bg-green-600 px-2 py-1 rounded">
          <Text className="text-white text-xs">Verified</Text>
        </View>
      )}
    </View>
  );
};

export default Header;