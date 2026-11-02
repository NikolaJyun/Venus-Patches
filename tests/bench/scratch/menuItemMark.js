// menuItemMark (every context-menu row) and segmentedItemMark (every profile/search tab): removal mode is off, so they only wrap.
var settings = {hideAnything: true, hideAnythingSpots: "chat.apps"}, features = {hideAnything: true}, featureTable = Object.create(null);
function featureFor(k) { return k; }
function enabled(key) {
    if (!settings[key]) return false;
    var feature = featureTable[key] || featureFor(key);
    return feature === key ? !!features[key] : !!(features[feature] && settings[feature]);
}
var hideEdit = {on: false}, hideMenuLabels = new Map([["Mute", "x"]]);
function hideEditing() { return hideEdit.on && enabled("hideAnything"); }
function spotHidden() { return false; }
function el() { return {}; }
function profileTabItems() { return false; }
var PROFILE_TABS = {}, SEARCH_TAB_SPOTS = {};
function markInside(r) { return r; }
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
function hookExport(exports, key, operation) {
    var orig = exports[key], call2 = operation.call2, call1 = operation.call1;
    var patched = typeof call2 === "function" && typeof call1 === "function" ?
        function (a, b) { var n = arguments.length; return n === 1 ? call1(orig, this, a) : n === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        typeof call2 === "function" ? function (a, b) { return arguments.length === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        typeof call1 === "function" ? function (a) { return arguments.length === 1 ? call1(orig, this, a) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
var rendered = {type: "View", props: {children: null}};
function mk() { return {default: function (props, ref) { return rendered; }}; }
var menuProps = {label: "Mute"}, tabProps = {state: {items: [{id: 1}]}, index: 0};
// ---- old
function menuOld(orig, self, args) {
    var r = orig.apply(self, args), props = args[0];
    if (!r || !hideMenuLabels.size || !props || typeof props.label !== "string" || !hideEditing()) return r;
    var key = hideMenuLabels.get(props.label);
    return key && !spotHidden(key) ? el() : r;
}
function tabOld(orig, self, args) {
    var r = orig.apply(self, args), props = args[0];
    if (!r || !props || !props.state || !Array.isArray(props.state.items) || !hideEditing()) return r;
    var item = props.state.items[props.index];
    var key = !item ? null : profileTabItems(props.state.items) ? PROFILE_TABS[item.id] : "page" in item && "count" in item ? SEARCH_TAB_SPOTS[item.id] : null;
    return key ? markInside(r, key) : r;
}
// ---- new
function menuMark(r, props) {
    if (!r || !hideMenuLabels.size || !props || typeof props.label !== "string" || !hideEditing()) return r;
    var key = hideMenuLabels.get(props.label);
    return key && !spotHidden(key) ? el() : r;
}
function menuNew(orig, self, args) { return menuMark(orig.apply(self, args), args[0]); }
menuNew.call1 = function (orig, self, a) { return menuMark(orig.call(self, a), a); };
menuNew.call2 = function (orig, self, a, b) { return menuMark(orig.call(self, a, b), a); };
function tabMark(r, props) {
    if (!r || !props || !props.state || !Array.isArray(props.state.items) || !hideEditing()) return r;
    var item = props.state.items[props.index];
    var key = !item ? null : profileTabItems(props.state.items) ? PROFILE_TABS[item.id] : "page" in item && "count" in item ? SEARCH_TAB_SPOTS[item.id] : null;
    return key ? markInside(r, key) : r;
}
function tabNew(orig, self, args) { return tabMark(orig.apply(self, args), args[0]); }
tabNew.call1 = function (orig, self, a) { return tabMark(orig.call(self, a), a); };
tabNew.call2 = function (orig, self, a, b) { return tabMark(orig.call(self, a, b), a); };
var mo = hookExport(mk(), "default", menuOld).default, mn = hookExport(mk(), "default", menuNew).default;
var to = hookExport(mk(), "default", tabOld).default, tn = hookExport(mk(), "default", tabNew).default;
bench("old menuItemMark x100", function () { for (var i = 0; i < 100; i++) mo(menuProps, undefined); });
bench("new menuItemMark x100", function () { for (var i = 0; i < 100; i++) mn(menuProps, undefined); });
bench("old segmentedItemMark x100", function () { for (var i = 0; i < 100; i++) to(tabProps, undefined); });
bench("new segmentedItemMark x100", function () { for (var i = 0; i < 100; i++) tn(tabProps, undefined); });
