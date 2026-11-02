// hideWhole / hideTree wrappers around Remove-anything components. React calls a component as Component(props, ref): two arguments.
// useSettings is a stand-in (identical cost in old and new), so the numbers are the wrapper's own overhead.
var settings = {hideAnything: true, hideAnythingSpots: "chat.apps,chat.gift"}, features = {hideAnything: true}, featureTable = Object.create(null);
function featureFor(k) { return k; }
function enabled(key) {
    if (!settings[key]) return false;
    var feature = featureTable[key] || featureFor(key);
    return feature === key ? !!features[key] : !!(features[feature] && settings[feature]);
}
var hideSpotCache = null, hideEdit = {on: false}, React = {};
function hiddenSpots() { var text = settings.hideAnythingSpots || ""; if (!hideSpotCache || hideSpotCache.text !== text) hideSpotCache = {text: text, set: new Set(text ? text.split(",") : [])}; return hideSpotCache.set; }
function spotHidden(key) { return !!settings.hideAnythingSpots && enabled("hideAnything") && hiddenSpots().has(key); }
function hideEditing() { return hideEdit.on && enabled("hideAnything"); }
var hookSink = 0;
function useSettings(key) { hookSink++; }
function hideMarked(n, k) { return n; }
function hideWalk(node) { return node; }
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
function hookExport(exports, key, operation) {
    var orig = exports[key], call2 = operation.call2, call1 = operation.call1;
    var patched = typeof call2 === "function" && typeof call1 === "function" ?
        function (a, b) { var n = arguments.length; return n === 1 ? call1(orig, this, a) : n === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        typeof call2 === "function" ? function (a, b) { return arguments.length === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
var rendered = {type: "View", props: {children: null}};
function mk() { return {default: function (props, ref) { return rendered; }}; }
var props = {a: 1};
// ---- old
function hideWholeOld(key) {
    return function (orig, self, args) {
        useSettings("hideAnything");
        var r = orig.apply(self, args);
        if (!r || !enabled("hideAnything")) return r;
        if (spotHidden(key)) return null;
        return hideEditing() ? hideMarked(r, key) : r;
    };
}
function hideTreeOld(classify, prepare) {
    return function (orig, self, args) {
        useSettings("hideAnything");
        var gone = prepare ? prepare() : null;
        var r = orig.apply(self, args);
        if (!React || !enabled("hideAnything")) return r;
        var edit = hideEditing();
        return edit || settings.hideAnythingSpots ? hideWalk(r, 0, classify, edit, gone) : r;
    };
}
// ---- new
function hideWholeNew(key) {
    var finish = function (r) {
        if (!r || !enabled("hideAnything")) return r;
        if (spotHidden(key)) return null;
        return hideEditing() ? hideMarked(r, key) : r;
    };
    var op = function (orig, self, args) { useSettings("hideAnything"); return finish(orig.apply(self, args)); };
    op.call1 = function (orig, self, a) { useSettings("hideAnything"); return finish(orig.call(self, a)); };
    op.call2 = function (orig, self, a, b) { useSettings("hideAnything"); return finish(orig.call(self, a, b)); };
    return op;
}
function hideTreeNew(classify, prepare) {
    var finish = function (r, gone) {
        if (!React || !enabled("hideAnything")) return r;
        var edit = hideEditing();
        return edit || settings.hideAnythingSpots ? hideWalk(r, 0, classify, edit, gone) : r;
    };
    var op = function (orig, self, args) { useSettings("hideAnything"); var gone = prepare ? prepare() : null; return finish(orig.apply(self, args), gone); };
    op.call1 = function (orig, self, a) { useSettings("hideAnything"); var gone = prepare ? prepare() : null; return finish(orig.call(self, a), gone); };
    op.call2 = function (orig, self, a, b) { useSettings("hideAnything"); var gone = prepare ? prepare() : null; return finish(orig.call(self, a, b), gone); };
    return op;
}
function classify() { return null; }
var wo = hookExport(mk(), "default", hideWholeOld("chat.emoji")).default, wn = hookExport(mk(), "default", hideWholeNew("chat.emoji")).default;
var to = hookExport(mk(), "default", hideTreeOld(classify)).default, tn = hookExport(mk(), "default", hideTreeNew(classify)).default;
bench("old hideWhole x100", function () { for (var i = 0; i < 100; i++) wo(props, undefined); });
bench("new hideWhole x100", function () { for (var i = 0; i < 100; i++) wn(props, undefined); });
bench("old hideTree x100", function () { for (var i = 0; i < 100; i++) to(props, undefined); });
bench("new hideTree x100", function () { for (var i = 0; i < 100; i++) tn(props, undefined); });
