/**
 * Concepts: ViewModel data, in-memory stores, formula.
 */
Ext.define('TradeBlotter.view.dashboard.DashboardViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.dashboardviewmodel',

    data: {
        kpis: null,
        lastUpdated: null
    },

    formulas: {
        lastUpdatedText: function (get) {
            var when = get('lastUpdated');
            return when ? Ext.Date.format(when, 'H:i:s') : 'never';
        }
    },

    stores: {
        byProduct: {
            fields: ['product', 'volumeMWh', 'pct'],
            data: []
        },
        byCounterparty: {
            fields: ['name', 'tradeCount', 'notionalSGD'],
            data: []
        }
    }
});
