import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import FoodProviderNavigation from './FoodProviderNavigation.js';
import ErrorBoundary from './ErrorBoundary.js';

export default function FoodProviderApp() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <FoodProviderNavigation />
      </NavigationContainer>
    </ErrorBoundary>
  );
} 