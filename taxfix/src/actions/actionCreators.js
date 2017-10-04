import {
  UPDATE_CYRRENCY_CONVERSION_HISTORY
} from './actionTypes';

export function updateCurrnencyConversionHistory(currencyConversionHistory) {
  return {
    type: UPDATE_CYRRENCY_CONVERSION_HISTORY,
    payload: {
      currencyConversionHistory
    }
  };
}
