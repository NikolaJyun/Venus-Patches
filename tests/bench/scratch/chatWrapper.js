// ChatViewWrapper (10368) hooks: translateBarHeader, bulkDeleteChatFooter and chatViewWrapperThemeBackground re-run on every chat re-render.
// React calls the component as (props) or (props, ref). Stand-ins for useSettings/el cost the same on both sides.
var features = {translate: true, bulkDelete: true, customThemes: true}, settings = {customThemes: true, customThemesBackground: false};
var featureTable = Object.create(null);
function featureFor(k) { return k; }
function enabled(key) {
    if (!settings[key]) return false;
    var feature = featureTable[key] || featureFor(key);
    return feature === key ? !!features[key] : !!(features[feature] && settings[feature]);
}
var React = {}, RN = {Image: {}}, sink = 0;
function useSettings() { sink++; }
function el(type, props, a) { return {type: type, props: props, a: a}; }
var TranslateBar = {}, BulkDeleteBar = {}, TranslateHeaderMeasure = {};
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
function hookExport(exports, key, operation) {
    var orig = exports[key], call2 = operation.call2, call1 = operation.call1;
    var patched = typeof call2 === "function" && typeof call1 === "function" ?
        function (a, b) { var n = arguments.length; return n === 1 ? call1(orig, this, a) : n === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
var tree = {type: "View", props: {children: null}};
function mk() { return {default: function (props, ref) { return tree; }}; }
// ---- old
function translateOld(orig, self, args) {
    var props = args[0];
    if (!props || !props.channelId || !React || !RN) return orig.apply(self, args);
    var bar = el(TranslateBar, {key: "venus-translate-bar", channelId: props.channelId});
    var children = Array.isArray(props.children) ? props.children.concat([bar]) : [props.children, bar];
    var next = Object.assign({}, props, props.stickyHeader ? {children: children, stickyHeader: el(TranslateHeaderMeasure, {channelId: props.channelId}, props.stickyHeader)} : {children: children});
    return args.length === 1 ? orig.call(self, next) : orig.apply(self, [next].concat(Array.prototype.slice.call(args, 1)));
}
function bulkOld(orig, self, args) {
    var props = args[0];
    if (!features.bulkDelete || !props || !props.channelId || !React || !RN) return orig.apply(self, args);
    var bar = el(BulkDeleteBar, {key: "venus-bulk-bar", channelId: props.channelId});
    var children = Array.isArray(props.children) ? props.children.concat([bar]) : [props.children, bar];
    var next = Object.assign({}, props, {children: children});
    return args.length === 1 ? orig.call(self, next) : orig.apply(self, [next].concat(Array.prototype.slice.call(args, 1)));
}
function themeOld(orig, self, args) {
    useSettings("customThemes");
    var t = orig.apply(self, args);
    if (!enabled("customThemes") || !settings.customThemesBackground || !React || !RN || !RN.Image || !t) return t;
    return t;
}
// ---- new
function translateNext(props) {
    var bar = el(TranslateBar, {key: "venus-translate-bar", channelId: props.channelId});
    var children = Array.isArray(props.children) ? props.children.concat([bar]) : [props.children, bar];
    return Object.assign({}, props, props.stickyHeader ? {children: children, stickyHeader: el(TranslateHeaderMeasure, {channelId: props.channelId}, props.stickyHeader)} : {children: children});
}
function translateNew(orig, self, args) {
    var props = args[0];
    if (!props || !props.channelId || !React || !RN) return orig.apply(self, args);
    var next = translateNext(props);
    return args.length === 1 ? orig.call(self, next) : orig.apply(self, [next].concat(Array.prototype.slice.call(args, 1)));
}
translateNew.call1 = function (orig, self, props) { return !props || !props.channelId || !React || !RN ? orig.call(self, props) : orig.call(self, translateNext(props)); };
translateNew.call2 = function (orig, self, props, ref) { return !props || !props.channelId || !React || !RN ? orig.call(self, props, ref) : orig.call(self, translateNext(props), ref); };
function bulkNext(props) {
    var bar = el(BulkDeleteBar, {key: "venus-bulk-bar", channelId: props.channelId});
    var children = Array.isArray(props.children) ? props.children.concat([bar]) : [props.children, bar];
    return Object.assign({}, props, {children: children});
}
function bulkNew(orig, self, args) {
    var props = args[0];
    if (!features.bulkDelete || !props || !props.channelId || !React || !RN) return orig.apply(self, args);
    var next = bulkNext(props);
    return args.length === 1 ? orig.call(self, next) : orig.apply(self, [next].concat(Array.prototype.slice.call(args, 1)));
}
bulkNew.call1 = function (orig, self, props) { return !features.bulkDelete || !props || !props.channelId || !React || !RN ? orig.call(self, props) : orig.call(self, bulkNext(props)); };
bulkNew.call2 = function (orig, self, props, ref) { return !features.bulkDelete || !props || !props.channelId || !React || !RN ? orig.call(self, props, ref) : orig.call(self, bulkNext(props), ref); };
function themeDone(t) {
    if (!enabled("customThemes") || !settings.customThemesBackground || !React || !RN || !RN.Image || !t) return t;
    return t;
}
function themeNew(orig, self, args) { useSettings("customThemes"); return themeDone(orig.apply(self, args)); }
themeNew.call1 = function (orig, self, a) { useSettings("customThemes"); return themeDone(orig.call(self, a)); };
themeNew.call2 = function (orig, self, a, b) { useSettings("customThemes"); return themeDone(orig.call(self, a, b)); };
var to = hookExport(mk(), "default", translateOld).default, tn = hookExport(mk(), "default", translateNew).default;
var bo = hookExport(mk(), "default", bulkOld).default, bn = hookExport(mk(), "default", bulkNew).default;
var ho = hookExport(mk(), "default", themeOld).default, hn = hookExport(mk(), "default", themeNew).default;
var props = {channelId: "1", children: [1, 2, 3]};
bench("old translate bar x100", function () { for (var i = 0; i < 100; i++) to(props, undefined); });
bench("new translate bar x100", function () { for (var i = 0; i < 100; i++) tn(props, undefined); });
bench("old bulk footer x100", function () { for (var i = 0; i < 100; i++) bo(props, undefined); });
bench("new bulk footer x100", function () { for (var i = 0; i < 100; i++) bn(props, undefined); });
bench("old theme background x100", function () { for (var i = 0; i < 100; i++) ho(props, undefined); });
bench("new theme background x100", function () { for (var i = 0; i < 100; i++) hn(props, undefined); });
