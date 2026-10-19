/**
 * A single power trade.
 * Concepts: Model, typed fields, calculated field, validators, REST proxy.
 */
Ext.define('TradeBlotter.model.Trade', {
    extend: 'Ext.data.Model',

    // New records get ids -1, -2, ... until the server assigns a real one.
    identifier: 'negative',

    fields: [
        { name: 'id', type: 'int' },
        { name: 'tradeDate', type: 'date', dateFormat: 'Y-m-d' },
        { name: 'counterparty', type: 'string' },
        { name: 'product', type: 'string' },
        { name: 'side', type: 'string', defaultValue: 'Buy' },
        { name: 'quantityMWh', type: 'float' },
        { name: 'price', type: 'float' },
        { name: 'status', type: 'string', defaultValue: 'Draft' },
        { name: 'trader', type: 'string' },
        { name: 'notes', type: 'string' },
        {
            // Calculated on the client, never sent to the server.
            name: 'notional',
            type: 'float',
            calculate: function (data) {
                return (data.quantityMWh || 0) * (data.price || 0);
            }
        }
    ],

    validators: {
        tradeDate: 'presence',
        counterparty: 'presence',
        product: 'presence',
        side: { type: 'inclusion', list: ['Buy', 'Sell'] },
        quantityMWh: { type: 'range', min: 1 },
        price: { type: 'range', min: 0 }
    },

    proxy: {
        type: 'rest',
        url: '/api/trades',
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty: 'total'
        },
        writer: {
            type: 'json',
            writeAllFields: true
        }
    }
});
