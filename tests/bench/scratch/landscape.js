// useChatLayout() / getChatLayout(): no argument, read on every screen render. Full-screen chat in landscape ON, phone held upright.
var settings = {landscapeFull: true}, features = {landscapeFull: true};
function enabled(key) { return !!settings[key] && !!features[key]; }
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
var React = {}, RN = {Dimensions: {get: function () { return {width: 400, height: 850}; }}};
function useSettings() {}
var LANDSCAPE = Object.freeze({isChatBesideChannelList: false, isChatLockedOpen: false});
function landscapePhone() {
    if (!enabled("landscapeFull") || !RN || !RN.Dimensions) return false;
    try { var d = RN.Dimensions.get("window"); return d.width > d.height && d.height < 600; } catch (_) { return false; }
}
function layoutOld(orig, self, args) {
    var layout = orig.apply(self, args);
    return layout && layout.isChatBesideChannelList && landscapePhone() ? LANDSCAPE : layout;
}
function layoutNew(orig, self, args) {
    var layout = orig.apply(self, args);
    return layout && layout.isChatBesideChannelList && landscapePhone() ? LANDSCAPE : layout;
}
layoutNew.call0 = function (orig, self) {
    var layout = orig.call(self);
    return layout && layout.isChatBesideChannelList && landscapePhone() ? LANDSCAPE : layout;
};
function hookOld(exports, key, operation) {
    var orig = exports[key];
    var patched = function () { return operation(orig, this, arguments); };
    return replaceValue(exports, key, patched);
}
function hookNew(exports, key, operation) {
    var orig = exports[key], call0 = operation.call0;
    var patched = typeof call0 === "function" ? function () { return arguments.length === 0 ? call0(orig, this) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    return replaceValue(exports, key, patched);
}
function hookViewOld(orig, self, args) { try { if (React) useSettings("landscapeFull"); } catch (_) {} return layoutOld(orig, self, args); }
function hookViewNew(orig, self, args) { try { if (React) useSettings("landscapeFull"); } catch (_) {} return layoutNew(orig, self, args); }
hookViewNew.call0 = function (orig, self) { try { if (React) useSettings("landscapeFull"); } catch (_) {} return layoutNew.call0(orig, self); };
var base = function () { return {isChatBesideChannelList: true, isChatLockedOpen: false}; };
var o = hookOld({f: base}, "f", hookViewOld), n = hookNew({f: base}, "f", hookViewNew);
var sink = 0;
bench("old useChatLayout x100", function () { for (var i = 0; i < 100; i++) sink += o.f().isChatLockedOpen ? 1 : 0; });
bench("new useChatLayout x100", function () { for (var i = 0; i < 100; i++) sink += n.f().isChatLockedOpen ? 1 : 0; });
