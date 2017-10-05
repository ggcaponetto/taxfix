import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Picker,
  TextInput,
  FlatList,
  TouchableOpacity,
  AsyncStorage
} from 'react-native';
import ModalPicker from 'react-native-modal-picker';
import PropTypes from 'prop-types';

import log from '../../util/logger';

const PRIMARY_COLOR = '#BDBDC1';
const STORAGE_KEY_HISTORY = '@currencyConversionHistory';

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

async function saveHistoryToStorage(currencyConversionHistory) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY_HISTORY,
      JSON.stringify(currencyConversionHistory, null, 4)
    );
    log('Saved history to local storage.', { history: currencyConversionHistory });
  } catch (error) {
    // Error saving data
    log('Could not save to local storage.', { currencyConversionHistory, error });
  }
}

async function getHistoryFromStorage() {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
    if (value !== null) {
      // We have data!!
      try {
        const parsed = JSON.parse(value);
        log('Restored history from local storage.', { history: parsed });
        return parsed;
      } catch (e) {
        throw new Error('No data retrieved');
      }
    }
    return [];
  } catch (error) {
    log('Could not save to local storage.', { key: STORAGE_KEY_HISTORY, error });
    return [];
  }
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
  setFromHistory(data) {
    this.setState(data);
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

// TODO docs
// true if the conversion data should be saved to the history
function isValidConversion(data) {
  const amountA = data.a.amount;
  const rateA = data.a.rate;
  const rateB = data.b.rate;
  const isValid = !(
    isNaN(parseFloat(amountA)) ||
    amountA.match(/[^$.\d]/) ||
    !rateA ||
    !rateB
  );
  return isValid;
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
    log('CurrencyConverter componentDidMount', { state: this.state, props: this.props });
    // fetch the rates once the component has been mounted
    getRates()
    .then((responseJson) => {
      this.setState({
        apiResponse: responseJson
      }, () => {
        log('Updated state', this.state);
      });
    });

    getHistoryFromStorage()
    .then((currencyConversionHistory) => {
      this.props.updateCurrnencyConversionHistory(currencyConversionHistory);
    })
    .catch();
  }


  getConversion() {
    log('getConversion', this.state);
    const amountA = this.state.data.a.amount;
    const rateA = this.state.data.a.rate;
    // const amountB = this.state.data.b.amount;
    const rateB = this.state.data.b.rate;
    try {
      if (!isValidConversion(this.state.data)) {
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
        return 'Select the amount, initial and target currency.';
      }
      return e.message;
    }
  }

  updateRedux(data) {
    if (isValidConversion(data)) {
      log('updateRedux', data);
      const newHistory = this.props.currencyConversionHistory.concat(data);
      this.props.updateCurrnencyConversionHistory(newHistory);
      saveHistoryToStorage(newHistory);
    } else {
      log('skipping updateRedux', data);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Row
          ref={(c) => {
            this.row = c;
          }}
          onChange={(data) => {
            log('onChange Row', data);
            this.setState({
              data
            }, () => {
              log('Updated state', data);
              this.updateRedux(data);
            });
          }}
          rates={this.state.apiResponse.rates}
          data={this.state.data}
          {...this.props}
        />
        <View>
          <Text>
            {this.getConversion()}
          </Text>
        </View>
        <View style={{ height: 200, marginTop: 10 }}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => {
                this.props.updateCurrnencyConversionHistory([]);
              }}
            >
              <Text>Clear history</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={this.props.currencyConversionHistory}
            keyExtractor={(item, index) => index}
            renderItem={
              ({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      data: item
                    }, () => {
                      this.row.setFromHistory(item);
                    });
                  }}
                >
                  <Text>{item.a.amount} {item.a.rate.currency} to {item.b.rate.currency}</Text>
                </TouchableOpacity>
              )
            }
          />
        </View>
      </View>
    );
  }
}

Row.propTypes = {
  onChange: PropTypes.func.isRequired,
  rates: PropTypes.array.isRequired,
};

CurrencyConverter.propTypes = {
  currencyConversionHistory: PropTypes.array.isRequired,
  updateCurrnencyConversionHistory: PropTypes.func.isRequired
};
