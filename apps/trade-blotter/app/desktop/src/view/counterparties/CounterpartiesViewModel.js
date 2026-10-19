/**
 * Concepts: formulas that depend on the selected record.
 */
Ext.define('TradeBlotter.view.counterparties.CounterpartiesViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.counterpartiesviewmodel',

    data: {
        selectedCounterparty: null
    },

    stores: {
        counterparties: {
            type: 'counterparties'
        }
    },

    formulas: {
        hasSelection: function (get) {
            return !!get('selectedCounterparty');
        },

        utilisation: function (get) {
            var limit = get('selectedCounterparty.creditLimitSGD'),
                exposure = get('selectedCounterparty.exposureSGD');
            return limit ? Math.min(exposure / limit, 1) : 0;
        },

        utilisationText: function (get) {
            return Math.round(get('utilisation') * 100) + '%';
        },

        utilisationCls: function (get) {
            var u = get('utilisation');
            return u >= 0.9 ? 'util-critical' : (u >= 0.7 ? 'util-warning' : 'util-ok');
        },

        headroom: function (get) {
            var limit = get('selectedCounterparty.creditLimitSGD') || 0,
                exposure = get('selectedCounterparty.exposureSGD') || 0;
            return Math.max(limit - exposure, 0);
        }
    }
});
