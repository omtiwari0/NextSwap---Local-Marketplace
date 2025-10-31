import 'react-native-gesture-handler'
import React, { useEffect, useState } from 'react';
import { View, Text, Platform } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

class ErrorBoundary extends React.Component<any, { hasError: boolean; error?: any }> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }
  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('App error boundary caught:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <GestureHandlerRootView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <SafeAreaProvider>
            <NavigationContainer>
              {/* Simple fallback UI instead of a blank screen */}
              <View style={{ alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 6 }}>Something went wrong</Text>
                <Text style={{ color: '#6b7280', textAlign: 'center' }}>{this.state?.error?.message || String(this.state.error)}</Text>
              </View>
            </NavigationContainer>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      )
    }
    return this.props.children
  }
}

const DevErrorOverlay = () => {
  const [err, setErr] = useState<string | null>(null)
  useEffect(() => {
    if (Platform.OS !== 'web') return
    const onError = (e: any) => {
      const msg = e?.message || e?.error?.message || String(e?.error || e)
      // eslint-disable-next-line no-console
      console.error('Global error:', e)
      setErr(msg)
    }
    const onRej = (e: any) => {
      const msg = e?.reason?.message || String(e?.reason || e)
      // eslint-disable-next-line no-console
      console.error('Unhandled rejection:', e)
      setErr(msg)
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRej)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRej)
    }
  }, [])
  if (!err) return null
  return (
    <View style={{ position: 'absolute', top: 8, right: 8, maxWidth: '80%', backgroundColor: 'rgba(239,68,68,0.95)', padding: 10, borderRadius: 8 }}>
      <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 4 }}>Error</Text>
      <Text style={{ color: '#fff' }}>{err}</Text>
    </View>
  )
}

const App = () => {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppNavigator />
            <DevErrorOverlay />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

export default App;