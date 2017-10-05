import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CurrencyConverter from '../currency_converter/CurrencyConverter';

export default class App extends React.Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CurrencyConverter />
      </View>
    );
  }
}
