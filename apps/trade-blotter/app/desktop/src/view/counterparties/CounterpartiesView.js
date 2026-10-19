/**
 * Master-detail: counterparty grid on the left, details on the right.
 * Concepts: hbox layout, client-side grid with grouping and summary,
 * selection driving a detail panel, display fields bound to a record,
 * progress bar bound to a formula, show/hide via binding.
 */
Ext.define('TradeBlotter.view.counterparties.CounterpartiesView', {
    extend: 'Ext.Container',
    xtype: 'counterpartiesview',
    cls: 'counterpartiesview',

    requires: [
        'Ext.layout.HBox',
        'Ext.grid.Grid',
        'Ext.grid.column.Number',
        'Ext.grid.plugin.Summary',
        'Ext.field.Display',
        'Ext.Progress',
        'TradeBlotter.store.Counterparties'
    ],

    controller: { type: 'counterpartiesviewcontroller' },
    viewModel: { type: 'counterpartiesviewmodel' },

    layout: { type: 'hbox', align: 'stretch' },

    listeners: {
        activate: 'onActivate'
    },

    items: [{
        xtype: 'grid',
        reference: 'counterpartyGrid',
        flex: 1,
        bind: { store: '{counterparties}' },
        plugins: {
            gridsummary: true
        },
        listeners: {
            select: 'onCounterpartySelect'
        },
        columns: [{
            text: 'Name',
            dataIndex: 'name',
            flex: 1,
            summaryRenderer: function () {
                return 'Total';
            }
        }, {
            text: 'Country',
            dataIndex: 'country',
            width: 90
        }, {
            text: 'Rating',
            dataIndex: 'rating',
            width: 90
        }, {
            xtype: 'numbercolumn',
            text: 'Trades',
            dataIndex: 'tradeCount',
            format: '0',
            width: 90,
            align: 'right',
            summary: 'sum'
        }, {
            xtype: 'numbercolumn',
            text: 'Credit limit (SGD)',
            dataIndex: 'creditLimitSGD',
            format: '0,000',
            width: 160,
            align: 'right',
            summary: 'sum'
        }, {
            xtype: 'numbercolumn',
            text: 'Exposure (SGD)',
            dataIndex: 'exposureSGD',
            format: '0,000',
            width: 150,
            align: 'right',
            summary: 'sum'
        }]
    }, {
        xtype: 'panel',
        title: 'Counterparty details',
        cls: 'counterparty-detail',
        width: 360,
        padding: 16,
        layout: { type: 'vbox', align: 'stretch' },
        items: [{
            xtype: 'component',
            cls: 'empty-detail',
            html: 'Select a counterparty to see its credit position.',
            bind: { hidden: '{hasSelection}' }
        }, {
            xtype: 'container',
            hidden: true,
            bind: { hidden: '{!hasSelection}' },
            defaults: { xtype: 'displayfield', labelAlign: 'left', labelWidth: 130 },
            items: [{
                label: 'Name',
                bind: '{selectedCounterparty.name}'
            }, {
                label: 'Country',
                bind: '{selectedCounterparty.country}'
            }, {
                label: 'Rating',
                bind: '{selectedCounterparty.rating}'
            }, {
                label: 'Credit limit',
                bind: 'SGD {selectedCounterparty.creditLimitSGD:number("0,000")}'
            }, {
                label: 'Exposure',
                bind: 'SGD {selectedCounterparty.exposureSGD:number("0,000")}'
            }, {
                label: 'Headroom',
                bind: 'SGD {headroom:number("0,000")}'
            }, {
                xtype: 'component',
                cls: 'utilisation-label',
                bind: { html: 'Credit utilisation: {utilisationText}' }
            }, {
                xtype: 'progress',
                bind: {
                    value: '{utilisation}',
                    userCls: '{utilisationCls}'
                }
            }, {
                xtype: 'button',
                text: 'View trades',
                ui: 'action',
                margin: '16 0 0 0',
                handler: 'onViewTrades'
            }]
        }]
    }]
});
