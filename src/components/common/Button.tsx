import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: object;
}

const Button: React.FC<ButtonProps> = ({ title, onPress, disabled = false, style }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, style, disabled && styles.disabled]}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  disabled: {
    backgroundColor: '#A5D6A7',
  },
});

export default Button;