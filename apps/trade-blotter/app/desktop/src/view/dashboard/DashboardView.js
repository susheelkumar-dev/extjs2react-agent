/**
 * Portfolio dashboard: KPI tiles, volume by product, top counterparties.
 * Concepts: nested vbox/hbox layouts, tpl + data binding, XTemplate
 * formatters and conditionals, DataView with itemTpl, read-only grid.
 */
Ext.define('TradeBlotter.view.dashboard.DashboardView', {
    extend: 'Ext.Container',
    xtype: 'dashboardview',
    cls: 'dashboardview',

    requires: [
        'Ext.layout.VBox',
        'Ext.layout.HBox',
        'Ext.dataview.DataView',
        'Ext.grid.Grid'
    ],

    controller: { type: 'dashboardviewcontroller' },
    viewModel: { type: 'dashboardviewmodel' },

    layout: { type: 'vbox', align: 'stretch' },
    padding: 16,
    scrollable: 'y',

    listeners: {
        activate: 'loadDashboard'
    },

    items: [{
        xtype: 'toolbar',
        cls: 'dashboard-toolbar',
        items: [{
            xtype: 'component',
            bind: { html: 'Last updated: {lastUpdatedText}' }
        }, '->', {
            xtype: 'button',
            text: 'Refresh',
            iconCls: 'x-fa fa-undo',
            handler: 'loadDashboard'
        }]
    }, {
        // KPI tiles
        xtype: 'container',
        layout: { type: 'hbox', align: 'stretch' },
        defaults: { xtype: 'component', cls: 'kpi-tile', flex: 1, bind: { data: '{kpis}' } },
        margin: '0 0 16 0',
        items: [{
            tpl: '<div class="kpi-label">Active trades</div>' +
                 '<div class="kpi-value">{tradeCount}</div>' +
                 '<div class="kpi-sub">{draftCount} draft, {confirmedCount} confirmed</div>'
        }, {
            tpl: '<div class="kpi-label">Total volume</div>' +
                 '<div class="kpi-value">{totalVolumeMWh:number("0,000")} <small>MWh</small></div>'
        }, {
            tpl: '<div class="kpi-label">Net position</div>' +
                 '<tpl if="netPositionMWh &gt;= 0">' +
                     '<div class="kpi-value kpi-long">+{netPositionMWh:number("0,000")} <small>MWh long</small></div>' +
                 '<tpl else>' +
                     '<div class="kpi-value kpi-short">{netPositionMWh:number("0,000")} <small>MWh short</small></div>' +
                 '</tpl>'
        }, {
            tpl: '<div class="kpi-label">Total notional</div>' +
                 '<div class="kpi-value"><small>SGD</small> {totalNotionalSGD:number("0,000")}</div>'
        }]
    }, {
        xtype: 'container',
        flex: 1,
        minHeight: 320,
        layout: { type: 'hbox', align: 'stretch' },
        items: [{
            xtype: 'panel',
            title: 'Volume by product',
            cls: 'dashboard-panel',
            flex: 1,
            margin: '0 16 0 0',
            layout: 'fit',
            items: [{
                xtype: 'dataview',
                bind: { store: '{byProduct}' },
                emptyText: 'No data',
                itemTpl: '<div class="bar-row">' +
                             '<div class="bar-label">{product}</div>' +
                             '<div class="bar-track"><div class="bar-fill" style="width:{pct}%"></div></div>' +
                             '<div class="bar-value">{volumeMWh:number("0,000")} MWh</div>' +
                         '</div>'
            }]
        }, {
            xtype: 'panel',
            title: 'Top counterparties by notional',
            cls: 'dashboard-panel',
            flex: 1,
            layout: 'fit',
            items: [{
                xtype: 'grid',
                bind: { store: '{byCounterparty}' },
                columns: [
                    { text: 'Counterparty', dataIndex: 'name', flex: 1 },
                    { text: 'Trades', dataIndex: 'tradeCount', width: 90, align: 'right' },
                    {
                        text: 'Notional (SGD)',
                        dataIndex: 'notionalSGD',
                        width: 150,
                        align: 'right',
                        formatter: 'number("0,000")'
                    }
                ]
            }]
        }]
    }]
});
