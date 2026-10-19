/**
 * Concepts: selection handling, reloading on activate, routing to another
 * view with redirectTo.
 */
Ext.define('TradeBlotter.view.counterparties.CounterpartiesViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.counterpartiesviewcontroller',

    // Called from the view's activate listener: reload when the user comes
    // back, because new or edited trades change each counterparty's exposure.
    onActivate: function () {
        this.getViewModel().set('selectedCounterparty', null);
        this.getStore('counterparties').load();
    },

    onCounterpartySelect: function (grid, selected) {
        var record = Ext.isArray(selected) ? selected[0] : selected;
        this.getViewModel().set('selectedCounterparty', record || null);
    },

    onViewTrades: function () {
        // Simple cross-view navigation via the hash router.
        this.redirectTo('tradesview');
    }
});
