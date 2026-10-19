/**
 * Trade blotter: filter toolbar + paged grid.
 * Concepts: vbox layout, toolbar with search/select fields, grid columns
 * (date, number, formatter, renderer, summary), paging plugin, grid
 * events, buttons bound to ViewModel state.
 */
Ext.define('TradeBlotter.view.trades.TradesView', {
    extend: 'Ext.Container',
    xtype: 'tradesview',
    cls: 'tradesview',

    requires: [
        'Ext.layout.VBox',
        'Ext.grid.Grid',
        'Ext.grid.column.Date',
        'Ext.grid.column.Number',
        'Ext.grid.plugin.PagingToolbar',
        'Ext.field.Search',
        'Ext.field.Select'
    ],

    controller: { type: 'tradesviewcontroller' },
    viewModel: { type: 'tradesviewmodel' },

    layout: { type: 'vbox', align: 'stretch' },

    items: [{
        xtype: 'toolbar',
        docked: 'top',
        items: [{
            xtype: 'searchfield',
            reference: 'searchField',
            placeholder: 'Search id, counterparty, product, trader',
            width: 320,
            listeners: {
                change: { fn: 'onFilterChange', buffer: 400 }
            }
        }, {
            xtype: 'selectfield',
            reference: 'statusFilter',
            label: 'Status',
            labelAlign: 'left',
            labelWidth: 60,
            width: 220,
            value: 'All',
            options: [
                { text: 'All', value: 'All' },
                { text: 'Draft', value: 'Draft' },
                { text: 'Confirmed', value: 'Confirmed' },
                { text: 'Settled', value: 'Settled' },
                { text: 'Cancelled', value: 'Cancelled' }
            ],
            listeners: {
                change: 'onFilterChange'
            }
        }, '->', {
            xtype: 'button',
            text: 'New trade',
            ui: 'action',
            iconCls: 'x-fa fa-plus',
            handler: 'onAddTrade'
        }, {
            xtype: 'button',
            text: 'Edit',
            iconCls: 'x-fa fa-edit',
            handler: 'onEditTrade',
            bind: { disabled: '{!selectedTrade}' }
        }, {
            xtype: 'button',
            text: 'Delete',
            iconCls: 'x-fa fa-trash',
            handler: 'onDeleteTrade',
            bind: { disabled: '{!selectedTrade}' }
        }]
    }, {
        xtype: 'grid',
        reference: 'tradeGrid',
        flex: 1,
        bind: { store: '{trades}' },
        emptyText: 'No trades match the filters',
        plugins: {
            pagingtoolbar: true
        },
        listeners: {
            select: 'onTradeSelect',
            deselect: 'onTradeDeselect',
            childdoubletap: 'onEditTrade'
        },
        columns: [{
            text: 'ID',
            dataIndex: 'id',
            width: 70,
            align: 'right'
        }, {
            xtype: 'datecolumn',
            text: 'Trade date',
            dataIndex: 'tradeDate',
            format: 'Y-m-d',
            width: 120
        }, {
            text: 'Counterparty',
            dataIndex: 'counterparty',
            flex: 1,
            minWidth: 160
        }, {
            text: 'Product',
            dataIndex: 'product',
            width: 130
        }, {
            text: 'Side',
            dataIndex: 'side',
            width: 90,
            renderer: 'renderSide',
            cell: { encodeHtml: false }
        }, {
            xtype: 'numbercolumn',
            text: 'Qty (MWh)',
            dataIndex: 'quantityMWh',
            format: '0,000',
            width: 110,
            align: 'right'
        }, {
            xtype: 'numbercolumn',
            text: 'Price (SGD/MWh)',
            dataIndex: 'price',
            format: '0,000.00',
            width: 150,
            align: 'right'
        }, {
            text: 'Notional (SGD)',
            dataIndex: 'notional',
            sortable: false,
            width: 140,
            align: 'right',
            formatter: 'number("0,000")'
        }, {
            text: 'Status',
            dataIndex: 'status',
            width: 120,
            renderer: 'renderStatus',
            cell: { encodeHtml: false }
        }, {
            text: 'Trader',
            dataIndex: 'trader',
            width: 110
        }]
    }]
});
