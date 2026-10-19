Ext.define('TradeBlotter.Application', {
	extend: 'Ext.app.Application',
	name: 'TradeBlotter',
	requires: ['TradeBlotter.*'],
	defaultToken: 'dashboardview',

	removeSplash: function () {
		var elem = document.getElementById('splash');

		Ext.getBody().removeCls('launching');
		if (elem && elem.parentNode) {
			elem.parentNode.removeChild(elem);
		}
	},

	launch: function () {
		this.removeSplash();
		Ext.Viewport.add([{ xtype: 'mainview' }]);
	},

	onAppUpdate: function () {
		Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
			function (choice) {
				if (choice === 'yes') {
					window.location.reload();
				}
			}
		);
	}
});
