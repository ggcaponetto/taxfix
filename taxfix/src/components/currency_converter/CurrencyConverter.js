import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Picker,
  TextInput
} from 'react-native';
import ModalPicker from 'react-native-modal-picker';
import PropTypes from 'prop-types';

import log from '../../util/logger';

const PRIMARY_COLOR = '#BDBDC1';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  row: {
    flex: 1,
    margin: 0,
    padding: 0,
    justifyContent: 'center'
  },
  textInput: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 40,
    padding: 0,
    margin: 0,
    borderStyle: 'solid',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR
  }
});

function getRates() {
  return fetch('https://txf-ecb.glitch.me/rates')
  .then(response => response.json())
  .then(responseJson => responseJson)
  .catch((error) => {
    log('Error fetching the current rates', error);
  });
}

class Row extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      a: {
        rate: null,
        amount: null
      },
      b: {
        rate: null
      }
    };
    this.getCurrencyDropDown = this.getCurrencyDropDown.bind(this);
  }
  getCurrencyDropDown(type) {
    const data = [];
    this.props.rates.forEach((rate, index) => {
      data.push(Object.assign({}, rate, { key: index, label: rate.currency }));
    });
    return (
      <ModalPicker
        style={{
          flex: 1,
          position: 'relative',
          height: 40
        }}
        data={data}
        onChange={(option) => {
          log('onChange', option);
          const updatedState = Object.assign({}, this.state);
          if (type === 'a') {
            updatedState[type] = {
              rate: option,
              amount: updatedState[type].amount
            };
          } else if (type === 'b') {
            updatedState[type] = {
              rate: option
            };
          }
          this.setState(updatedState, () => {
            log('Updated state', this.state);
            this.props.onChange(this.state);
          });
        }}
      >
        <View
          style={{
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderStyle: 'solid',
            borderRadius: 5,
            borderWidth: 1,
            borderColor: PRIMARY_COLOR
          }}
        >
          <Text>
            {(() => {
              if (this.state[type].rate && this.state[type].rate.currency) {
                return this.state[type].rate.currency;
              }
              return 'Select currency';
            })()}
          </Text>
        </View>
      </ModalPicker>
    );
  }
  render() {
    return (
      <View style={{ flexDirection: 'row', margin: 10 }}>
        <View
          style={styles.row}
        >
          <TextInput
            textAlign="center"
            textAlignVertical="center"
            style={styles.textInput}
            keyboardType="numeric"
            onChangeText={(input) => {
              log('onChangeText', input);
              this.setState({
                a: {
                  amount: `${input}`,
                  rate: this.state.a.rate
                }
              }, () => {
                log('Updated state', this.state);
                this.props.onChange(this.state);
              });
            }}
            value={this.state.a.amount}
          />
        </View>
        <View
          style={{ flex: 1, flexDirection: 'row' }}
        >
          {this.getCurrencyDropDown('a')}
          <View
            style={{
              height: 40,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text> to </Text>
          </View>
          {this.getCurrencyDropDown('b')}
        </View>
      </View>
    );
  }
}

export default class CurrencyConverter extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      apiResponse: {
        rates: []
      },
      data: {
        a: {
          rate: null,
          amount: null
        },
        b: {
          rate: null
        }
      }
    };
    this.getConversion();
  }
  componentDidMount() {
    // fetch the rates once the component has been mounted
    getRates()
    .then((responseJson) => {
      this.setState({
        apiResponse: responseJson
      }, () => {
        log('Updated state', this.state);
      });
    });
  }

  getConversion() {
    log('getConversion', this.state);
    const amountA = this.state.data.a.amount;
    const rateA = this.state.data.a.rate;
    // const amountB = this.state.data.b.amount;
    const rateB = this.state.data.b.rate;
    try {
      if (isNaN(parseFloat(amountA)) || amountA.match(/[^$.\d]/)) {
        throw new Error('Not a valid amount to convert.');
      }
      const baseAmount = 1 / parseFloat(rateA.rate);
      const baseConversion = amountA * baseAmount;
      const convertedAmount = baseConversion * rateB.rate;
      const roundedConvertedAmount = Math.round(convertedAmount * 100) / 100;
      return `${amountA || 0} ${
        rateA ? rateA.currency : null
      } equals ${roundedConvertedAmount} ${rateB ? rateB.currency : null}
      `;
    } catch (e) {
      if (!amountA || !rateA || !rateB) {
        return 'Select your starting and target currency.';
      }
      return e.message;
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Row
          onChange={(data) => {
            log('onChange Row', data);
            this.setState({
              data
            }, () => {
              log('Updated state', data);
            });
          }}
          rates={this.state.apiResponse.rates}
        />
        <View>
          <Text>
            {this.getConversion()}
          </Text>
        </View>
      </View>
    );
  }
}

Row.propTypes = {
  onChange: PropTypes.func.isRequired,
  rates: PropTypes.array.isRequired
};
