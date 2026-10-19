/**
 * Concepts: form validation, model validation, record.reject() on cancel,
 * firing a custom event back to the opening view.
 */
Ext.define('TradeBlotter.view.trades.TradeDialogController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tradedialogcontroller',

    onSave: function () {
        var form = this.lookup('tradeForm'),
            trade = this.getViewModel().get('trade');

        // Field-level checks (required, min values) shown on the form.
        if (!form.validate()) {
            return;
        }

        // Model-level validators as a second line of defence.
        if (!trade.isValid()) {
            Ext.Msg.alert('Invalid trade', 'Please check the highlighted values.');
            return;
        }

        this.getView().fireEvent('tradesaved', trade);
        this.getView().destroy();
    },

    onCancel: function () {
        var trade = this.getViewModel().get('trade');

        // Fields are two-way bound, so undo any edits made to an existing trade.
        if (trade && !trade.phantom) {
            trade.reject();
        }
        this.getView().destroy();
    }
});
