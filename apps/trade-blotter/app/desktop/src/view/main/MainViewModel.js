Ext.define('TradeBlotter.view.main.MainViewModel', {
	extend: 'Ext.app.ViewModel',
	alias: 'viewmodel.mainviewmodel',
	data: {
		name: 'TradeBlotter',
		navCollapsed:       false,
		navview_max_width:    300,
		navview_min_width:     44,
		topview_height:        75,
		bottomview_height:     50,
		headerview_height:     50,
		footerview_height:     50,
		detailCollapsed:     true,
		detailview_width:      10,
		detailview_max_width: 300,
		detailview_min_width:   0,

	},
	formulas: {
		navview_width: function(get) {
			return get('navCollapsed') ? get('navview_min_width') : get('navview_max_width');
		},
		detailview_width: function(get) {
			return get('detailCollapsed') ? get('detailview_min_width') : get('detailview_max_width');
		}
	},
	stores: {
		menu: {
			"type": "tree",
			"root": {
				"expanded": true,
				"children": [
                                                  { "text": "Dashboard", "iconCls": "x-fa fa-th-large", "xtype": "dashboardview", "leaf": true },
                                        { "text": "Trades", "iconCls": "x-fa fa-table", "xtype": "tradesview", "leaf": true },
                                        { "text": "Counterparties", "iconCls": "x-fa fa-users", "xtype": "counterpartiesview", "leaf": true },
                                        { "text": "About", "iconCls": "x-fa fa-info-circle", "xtype": "homeview", "leaf": true },
					//add new items on the next line (from sencha-node generate viewpackage)

				]
			}
		}
	}
});
