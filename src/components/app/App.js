import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CurrencyConverter from '../currency_converter/CurrencyConverter';

import log from '../../util/logger';

export default class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {};
  }
  componentDidMount() {
    log('App componentDidMount', { state: this.state, props: this.props });
  }
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
        <CurrencyConverter {...this.props} />
      </View>
    );
  }
}
