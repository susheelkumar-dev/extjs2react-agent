/**
 * A trading counterparty with its credit limit and current exposure.
 * Concepts: read-only Model with an ajax proxy.
 */
Ext.define('TradeBlotter.model.Counterparty', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'id', type: 'int' },
        { name: 'name', type: 'string' },
        { name: 'country', type: 'string' },
        { name: 'rating', type: 'string' },
        { name: 'creditLimitSGD', type: 'float' },
        { name: 'exposureSGD', type: 'float' },
        { name: 'tradeCount', type: 'int' }
    ],

    proxy: {
        type: 'ajax',
        url: '/api/counterparties',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    }
});
