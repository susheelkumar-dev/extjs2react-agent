/**
 * Add/edit trade form in a modal dialog.
 * Concepts: Dialog, form panel, two-way field binding to a record,
 * combobox bound to a remote store, select fields, required fields,
 * min values, custom event fired to the opener.
 */
Ext.define('TradeBlotter.view.trades.TradeDialog', {
    extend: 'Ext.Dialog',
    xtype: 'tradedialog',

    requires: [
        'Ext.form.Panel',
        'Ext.field.Date',
        'Ext.field.ComboBox',
        'Ext.field.Number',
        'Ext.field.Select',
        'Ext.field.Text',
        'Ext.field.TextArea',
        'TradeBlotter.store.Counterparties'
    ],

    controller: { type: 'tradedialogcontroller' },

    width: 560,
    height: 620,
    // No close (X) button: Cancel must run so edits to an existing trade are undone.
    closable: false,
    defaultFocus: 'combobox',

    layout: 'fit',

    items: [{
        xtype: 'formpanel',
        reference: 'tradeForm',
        scrollable: 'y',
        padding: '0 8',
        layout: { type: 'vbox', align: 'stretch' },
        defaults: {
            labelAlign: 'left',
            labelWidth: 130
        },
        items: [{
            xtype: 'datefield',
            label: 'Trade date',
            dateFormat: 'Y-m-d',
            required: true,
            bind: '{trade.tradeDate}'
        }, {
            xtype: 'combobox',
            label: 'Counterparty',
            required: true,
            forceSelection: true,
            queryMode: 'local',
            displayField: 'name',
            valueField: 'name',
            store: { type: 'counterparties' },
            bind: '{trade.counterparty}'
        }, {
            xtype: 'selectfield',
            label: 'Product',
            required: true,
            options: [
                { text: 'SG Peak', value: 'SG Peak' },
                { text: 'SG Off-Peak', value: 'SG Off-Peak' },
                { text: 'SG Baseload', value: 'SG Baseload' },
                { text: 'Solar PPA', value: 'Solar PPA' },
                { text: 'LNG Swap', value: 'LNG Swap' }
            ],
            bind: '{trade.product}'
        }, {
            xtype: 'selectfield',
            label: 'Side',
            required: true,
            options: [
                { text: 'Buy', value: 'Buy' },
                { text: 'Sell', value: 'Sell' }
            ],
            bind: '{trade.side}'
        }, {
            xtype: 'numberfield',
            label: 'Quantity (MWh)',
            required: true,
            minValue: 1,
            bind: '{trade.quantityMWh}'
        }, {
            xtype: 'numberfield',
            label: 'Price (SGD/MWh)',
            required: true,
            minValue: 0,
            decimals: 2,
            bind: '{trade.price}'
        }, {
            xtype: 'component',
            cls: 'notional-preview',
            bind: { html: 'Notional: SGD {trade.notional:number("0,000.00")}' }
        }, {
            xtype: 'selectfield',
            label: 'Status',
            options: [
                { text: 'Draft', value: 'Draft' },
                { text: 'Confirmed', value: 'Confirmed' },
                { text: 'Settled', value: 'Settled' },
                { text: 'Cancelled', value: 'Cancelled' }
            ],
            bind: '{trade.status}'
        }, {
            xtype: 'textfield',
            label: 'Trader',
            bind: '{trade.trader}'
        }, {
            xtype: 'textareafield',
            label: 'Notes',
            maxRows: 3,
            bind: '{trade.notes}'
        }]
    }],

    buttons: [{
        text: 'Cancel',
        handler: 'onCancel'
    }, {
        text: 'Save',
        ui: 'action',
        handler: 'onSave'
    }]
});
