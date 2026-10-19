/**
 * Server-side paged, sorted and filtered list of trades.
 * Concepts: Store, remote paging/sorting/filtering, alias for reuse.
 */
Ext.define('TradeBlotter.store.Trades', {
    extend: 'Ext.data.Store',
    alias: 'store.trades',

    requires: ['TradeBlotter.model.Trade'],

    model: 'TradeBlotter.model.Trade',
    pageSize: 25,
    remoteSort: true,
    remoteFilter: true,
    sorters: [{ property: 'tradeDate', direction: 'DESC' }]
});
