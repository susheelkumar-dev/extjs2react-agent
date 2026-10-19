/**
 * Concepts: renderers, remote filtering, opening a dialog, store.sync(),
 * confirm dialogs, toasts, event handling between components.
 */
Ext.define('TradeBlotter.view.trades.TradesViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tradesviewcontroller',

    requires: [
        'TradeBlotter.model.Trade',
        'TradeBlotter.view.trades.TradeDialog'
    ],

    // ------------------------------------------------------------ renderers

    renderSide: function (value) {
        var cls = value === 'Buy' ? 'side-buy' : 'side-sell';
        return '<span class="' + cls + '">' + Ext.String.htmlEncode(value) + '</span>';
    },

    renderStatus: function (value) {
        var cls = 'status-badge status-' + String(value).toLowerCase();
        return '<span class="' + cls + '">' + Ext.String.htmlEncode(value) + '</span>';
    },

    // ------------------------------------------------------------ filtering

    onFilterChange: function () {
        var store = this.getStore('trades'),
            query = this.lookup('searchField').getValue(),
            status = this.lookup('statusFilter').getValue(),
            filters = [];

        if (query) {
            filters.push({ property: 'q', value: query });
        }
        if (status && status !== 'All') {
            filters.push({ property: 'status', value: status });
        }

        // Clear silently, then apply; remoteFilter makes this reload page 1.
        store.clearFilter(true);
        store.currentPage = 1;

        if (filters.length) {
            store.filter(filters);
        } else {
            store.load();
        }
    },

    // ------------------------------------------------------------ selection

    onTradeSelect: function (grid, selected) {
        var record = Ext.isArray(selected) ? selected[0] : selected;
        this.getViewModel().set('selectedTrade', record || null);
    },

    onTradeDeselect: function () {
        var grid = this.lookup('tradeGrid');
        this.getViewModel().set('selectedTrade', grid.getSelection() || null);
    },

    // ------------------------------------------------------------ CRUD

    onAddTrade: function () {
        var trade = Ext.create('TradeBlotter.model.Trade', {
            tradeDate: new Date(),
            side: 'Buy',
            status: 'Draft'
        });
        this.openDialog(trade, 'New trade');
    },

    onEditTrade: function () {
        var trade = this.getViewModel().get('selectedTrade');
        if (trade) {
            this.openDialog(trade, 'Edit trade #' + trade.getId());
        }
    },

    openDialog: function (trade, title) {
        var dialog = Ext.create({
            xtype: 'tradedialog',
            title: title,
            viewModel: {
                data: { trade: trade }
            },
            listeners: {
                tradesaved: this.onTradeSaved,
                scope: this
            }
        });
        dialog.show();
    },

    onTradeSaved: function (trade) {
        var store = this.getStore('trades');

        if (trade.phantom) {
            store.insert(0, trade);
        }

        store.sync({
            success: function () {
                Ext.toast('Trade saved', 2000);
                store.load();
            },
            failure: function () {
                store.rejectChanges();
                Ext.Msg.alert('Save failed', 'The server rejected the trade. Check the values and try again.');
            }
        });
    },

    onDeleteTrade: function () {
        var me = this,
            trade = me.getViewModel().get('selectedTrade');

        if (!trade) {
            return;
        }

        Ext.Msg.confirm('Delete trade',
            'Delete trade #' + trade.getId() + ' with ' + Ext.String.htmlEncode(trade.get('counterparty')) + '?',
            function (choice) {
                if (choice !== 'yes') {
                    return;
                }
                var store = me.getStore('trades');
                store.remove(trade);
                me.getViewModel().set('selectedTrade', null);
                store.sync({
                    success: function () {
                        Ext.toast('Trade deleted', 2000);
                        store.load();
                    },
                    failure: function () {
                        store.rejectChanges();
                        Ext.Msg.alert('Delete failed', 'The server could not delete the trade.');
                    }
                });
            });
    }
});
