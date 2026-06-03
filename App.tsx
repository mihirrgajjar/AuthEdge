/**
 * AuthEdge App
 *
 * Secure Offline Facial Recognition & Liveness Detection
 * Built for Hackathon 7.0 — Datalake 3.0 Integration
 *
 * @format
 */

import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import {AppProvider} from './src/context/AppContext';

/**
 * Dark navigation theme matching AuthEdge branding.
 * All colors extracted from AuthEdge_logo.png.
 */
const AuthEdgeNavTheme = {
  dark: true,
  colors: {
    primary: '#00E5A0',
    background: '#000000',
    card: '#060B18',
    text: '#FFFFFF',
    border: '#1A2340',
    notification: '#00E5A0',
  },
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <NavigationContainer theme={AuthEdgeNavTheme}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#000000"
          translucent={false}
        />
        <AppNavigator />
      </NavigationContainer>
    </AppProvider>
  );
};

export default App;
