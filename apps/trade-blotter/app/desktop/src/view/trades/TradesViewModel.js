/**
 * Concepts: ViewModel-owned store, selection state, formula.
 */
Ext.define('TradeBlotter.view.trades.TradesViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.tradesviewmodel',

    requires: ['TradeBlotter.store.Trades'],

    data: {
        selectedTrade: null
    },

    stores: {
        trades: {
            type: 'trades',
            autoLoad: true
        }
    }
});
