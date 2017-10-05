import { combineReducers } from 'redux';
import {
  UPDATE_CYRRENCY_CONVERSION_HISTORY
} from '../actions/actionTypes';

const initialState = {
  currencyConversionHistory: []
};

function currencyConversionHistory(
  // eslint-disable-next-line no-shadow
  currencyConversionHistory = initialState.currencyConversionHistory, action
) {
  switch (action.type) {
    case UPDATE_CYRRENCY_CONVERSION_HISTORY:
      return action.payload.currencyConversionHistory;
    default:
      return currencyConversionHistory;
  }
}

const taxfixApp = combineReducers({
  currencyConversionHistory
});

export default taxfixApp;
