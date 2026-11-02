// One-argument hooks with the feature off (the common case): renderSettingItem (settingItemMark, once per settings row),
// isTrustedDomain (alwaysTrustDomain, once per link), startTyping (typing).
var settings = {hideAnything: false, alwaysTrust: false, noTyping: false}, features = {hideAnything: true, alwaysTrust: true, noTyping: true};
function enabled(key) { return !!settings[key] && !!features[key]; }
var hideEdit = {on: false};
function hideEditing() { return hideEdit.on && enabled("hideAnything"); }
function settingRemovable(key) { return typeof key === "string" && /^[A-Za-z0-9_][A-Za-z0-9_ .\-]{1,79}$/.test(key); }
function hideMarkedRow(r) { return r; }
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
function hookExport(exports, key, operation) {
    var orig = exports[key], call3 = operation.call3, call2 = operation.call2, call1 = operation.call1, call0 = operation.call0;
    var patched = typeof call0 === "function" && typeof call1 === "function" ?
        function (a) { var n = arguments.length; return n === 0 ? call0(orig, this) : n === 1 ? call1(orig, this, a) : operation(orig, this, arguments); } :
        typeof call0 === "function" ?
        function () { return arguments.length === 0 ? call0(orig, this) : operation(orig, this, arguments); } :
        typeof call3 === "function" ? function (a, b, c) { return arguments.length === 3 ? call3(orig, this, a, b, c) : operation(orig, this, arguments); } :
        typeof call2 === "function" && typeof call1 === "function" ?
        function (a, b) { var n = arguments.length; return n === 1 ? call1(orig, this, a) : n === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        typeof call2 === "function" ? function (a, b) { return arguments.length === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        typeof call1 === "function" ? function (a) { return arguments.length === 1 ? call1(orig, this, a) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
// ---- old
function settingItemMarkOld(orig, self, args) {
    var rendered = orig.apply(self, args), props = args[0], key = props && props.setting;
    return rendered && hideEditing() && settingRemovable(key) ? hideMarkedRow(rendered, "settings." + key) : rendered;
}
function trustOld(orig, self, args) { return enabled("alwaysTrust") && settings.alwaysTrustLinks ? true : orig.apply(self, args); }
function typingOld(orig, self, args) { return enabled("noTyping") ? undefined : orig.apply(self, args); }
// ---- new
function settingItemMarkNew(orig, self, args) { return settingMarked(orig.apply(self, args), args[0]); }
settingItemMarkNew.call1 = function (orig, self, props) { return settingMarked(orig.call(self, props), props); };
function settingMarked(rendered, props) {
    var key = props && props.setting;
    return rendered && hideEditing() && settingRemovable(key) ? hideMarkedRow(rendered, "settings." + key) : rendered;
}
function trustNew(orig, self, args) { return enabled("alwaysTrust") && settings.alwaysTrustLinks ? true : orig.apply(self, args); }
trustNew.call1 = function (orig, self, a) { return enabled("alwaysTrust") && settings.alwaysTrustLinks ? true : orig.call(self, a); };
function typingNew(orig, self, args) { return enabled("noTyping") ? undefined : orig.apply(self, args); }
typingNew.call1 = function (orig, self, a) { return enabled("noTyping") ? undefined : orig.call(self, a); };
function mk() { return {renderSettingItem: function (p) { return p; }, isTrustedDomain: function (u) { return false; }, startTyping: function (c) { return c; }}; }
var o = mk(), n = mk();
o = hookExport(o, "renderSettingItem", settingItemMarkOld); o = hookExport(o, "isTrustedDomain", trustOld); o = hookExport(o, "startTyping", typingOld);
n = hookExport(n, "renderSettingItem", settingItemMarkNew); n = hookExport(n, "isTrustedDomain", trustNew); n = hookExport(n, "startTyping", typingNew);
var props = {setting: "VENUS_GENERAL"}, sink = 0;
bench("old renderSettingItem x100", function () { for (var i = 0; i < 100; i++) if (o.renderSettingItem(props)) sink++; });
bench("new renderSettingItem x100", function () { for (var i = 0; i < 100; i++) if (n.renderSettingItem(props)) sink++; });
bench("old isTrustedDomain x100", function () { for (var i = 0; i < 100; i++) if (o.isTrustedDomain("a.com")) sink++; });
bench("new isTrustedDomain x100", function () { for (var i = 0; i < 100; i++) if (n.isTrustedDomain("a.com")) sink++; });
bench("old startTyping x100", function () { for (var i = 0; i < 100; i++) if (o.startTyping("1")) sink++; });
bench("new startTyping x100", function () { for (var i = 0; i < 100; i++) if (n.startTyping("1")) sink++; });
