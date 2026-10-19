/**
 * Concepts: ViewController, Ext.Ajax request, pushing data into a ViewModel.
 */
Ext.define('TradeBlotter.view.dashboard.DashboardViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.dashboardviewcontroller',

    loadDashboard: function () {
        var vm = this.getViewModel(),
            view = this.getView();

        view.setMasked({ xtype: 'loadmask', message: 'Loading...' });

        Ext.Ajax.request({
            url: '/api/dashboard',
            method: 'GET',
            success: function (response) {
                var result = Ext.decode(response.responseText);

                vm.set('kpis', result.kpis);
                vm.getStore('byProduct').setData(result.byProduct);
                vm.getStore('byCounterparty').setData(result.byCounterparty);
                vm.set('lastUpdated', new Date());
            },
            failure: function (response) {
                Ext.Msg.alert('Dashboard',
                    'Could not load the dashboard (HTTP ' + response.status + '). Is the mock API running on port 8000?');
            },
            callback: function () {
                if (!view.destroyed) {
                    view.setMasked(false);
                }
            }
        });
    }
});
