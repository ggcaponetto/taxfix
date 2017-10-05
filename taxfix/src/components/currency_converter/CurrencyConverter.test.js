/* eslint-env mocha, chai, jest */
import renderer from 'react-test-renderer';

import React from 'react';
import CurrencyConverter from './CurrencyConverter';

global.fetch = jest.fn().mockImplementation(() => Promise.resolve(
  `
    {"time":"2017-10-05","base":"EUR","rates":[{"currency":"USD","rate":"1.1742"},{"currency":"JPY","rate":"132.05"},{"currency":"BGN","rate":"1.9558"},{"currency":"CZK","rate":"25.837"},{"currency":"DKK","rate":"7.4424"},{"currency":"GBP","rate":"0.89153"},{"currency":"HUF","rate":"311.42"},{"currency":"PLN","rate":"4.3000"},{"currency":"RON","rate":"4.5750"},{"currency":"SEK","rate":"9.5195"},{"currency":"CHF","rate":"1.1472"},{"currency":"NOK","rate":"9.3500"},{"currency":"HRK","rate":"7.5055"},{"currency":"RUB","rate":"67.5273"},{"currency":"TRY","rate":"4.1905"},{"currency":"AUD","rate":"1.5015"},{"currency":"BRL","rate":"3.6772"},{"currency":"CAD","rate":"1.4655"},{"currency":"CNY","rate":"7.8108"},{"currency":"HKD","rate":"9.1701"},{"currency":"IDR","rate":"15803.15"},{"currency":"ILS","rate":"4.1229"},{"currency":"INR","rate":"76.4965"},{"currency":"KRW","rate":"1337.65"},{"currency":"MXN","rate":"21.4107"},{"currency":"MYR","rate":"4.9651"},{"currency":"NZD","rate":"1.6413"},{"currency":"PHP","rate":"59.949"},{"currency":"SGD","rate":"1.5998"},{"currency":"THB","rate":"39.160"},{"currency":"ZAR","rate":"16.0020"}]}
  `
));

it('renders without crashing', () => {
  const rendered = renderer.create(<CurrencyConverter />).toJSON();
  expect(rendered).toBeTruthy();
});
