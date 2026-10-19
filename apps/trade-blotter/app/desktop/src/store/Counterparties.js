/**
 * All counterparties, loaded once and filtered/sorted on the client.
 * Concepts: Store used by both a grid and a combobox.
 */
Ext.define('TradeBlotter.store.Counterparties', {
    extend: 'Ext.data.Store',
    alias: 'store.counterparties',

    requires: ['TradeBlotter.model.Counterparty'],

    model: 'TradeBlotter.model.Counterparty',
    autoLoad: true,
    sorters: 'name'
});
