# TradeBlotter sample: setup and concept map

A small ETRM app built to exercise the Ext JS concepts the migration agent
must convert. Copy these folders over `C:\dev\extjs2react-agent`, keeping the paths.

## 1. Start the mock API (terminal 1)

```powershell
cd C:\dev\extjs2react-agent\apps\mock-api
uv sync --python 3.12
uv run uvicorn main:app --reload --port 8000
```

Check http://localhost:8000/docs. Run the tests with `uv run pytest`.

## 2. Proxy `/api` from the Ext JS dev server to the API (one-time edit)

Open `apps\trade-blotter\webpack.config.js`, find the `devServer: {` block,
and add this line inside it (for example right after `stats: stats`, with a comma
after `stats`):

```js
proxy: { '/api': 'http://localhost:8000' },
```

The app calls relative URLs like `/api/trades`, so no CORS setup is needed.
The React app will use the same trick with Vite's proxy.

## 3. Start the Ext JS app (terminal 2)

```powershell
cd C:\dev\extjs2react-agent\apps\trade-blotter
.\start-legacy.ps1
```

Open http://localhost:1962. It opens on the Dashboard.

## What each screen tests

| Screen | Files | Ext JS concepts |
| --- | --- | --- |
| Dashboard | `view/dashboard/*` | vbox/hbox layouts, `tpl` + `bind: {data}`, XTemplate formatters and `<tpl if>`, DataView with `itemTpl`, read-only grid, `Ext.Ajax`, load mask, `activate` event |
| Trades | `view/trades/TradesView*` | ViewModel store, remote paging/sorting/filtering, date/number columns, `formatter`, controller `renderer`, paging plugin, search and select filters with `buffer`, select/deselect/double-tap events, buttons disabled by binding, `store.sync()`, confirm dialog, toast |
| Trade form | `view/trades/TradeDialog*` | `Ext.Dialog`, `formpanel`, two-way `bind` to a record, combobox on a remote store, select/number/date/textarea fields, `required`/`minValue`, `form.validate()`, model validators, `record.reject()`, custom event to the opener |
| Counterparties | `view/counterparties/*` | Master-detail hbox, summary row plugin, display fields bound to the selection, formulas, progress bar, `hidden` via binding, `redirectTo` routing |
| Data layer | `model/*`, `store/*` | Typed fields, date format, calculated field, `identifier: 'negative'`, validators, REST and ajax proxies, reader/writer config, store aliases |
| Shell | `Application.js`, `resources/desktop/menu.json` | Hash routing via the menu tree, default route |

## API

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/trades` | `page`, `start`, `limit`, JSON `sort` and `filter` (Ext JS format); filter `q` = text search |
| GET/PUT/DELETE | `/api/trades/{id}` | |
| POST | `/api/trades` | Returns the trade with its new id |
| GET | `/api/counterparties` | Includes live `exposureSGD` and `tradeCount` |
| GET | `/api/dashboard` | KPIs, volume by product, top 5 counterparties |

Data is 200 seeded trades held in memory; restarting the API resets it.
