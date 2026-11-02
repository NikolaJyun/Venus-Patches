// No-argument getters hooked with (orig, self, args) + apply vs call0 fast path: Account switcher's getCanUseMultiAccountMobile /
// getHasLoggedInAccounts and the quest dock hooks, with their feature off (the common case).
var settings = {accountSwitcher: false, hideAnything: false}, features = {accountSwitcher: true, hideAnything: true};
function enabled(key) { return !!settings[key] && !!features[key]; }
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
function hook(exports, key, operation) {
    var orig = exports[key], call0 = operation.call0;
    var patched = typeof call0 === "function" ?
        function () { return arguments.length === 0 ? call0(orig, this) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
function questDockHidden() { return false; }
var store = {getCanUse: function () { return false; }, getHas: function () { return false; }, dock: function () { return {a: 1}; }};
var oldA = hook({f: store.getCanUse}, "f", function (orig, self, args) { return enabled("accountSwitcher") ? true : orig.apply(self, args); });
var newOp = function (orig, self, args) { return enabled("accountSwitcher") ? true : orig.apply(self, args); };
newOp.call0 = function (orig, self) { return enabled("accountSwitcher") ? true : orig.call(self); };
var newA = hook({f: store.getCanUse}, "f", newOp);
var oldD = hook({f: store.dock}, "f", function (orig, self, args) { var d = orig.apply(self, args); return questDockHidden() ? null : d; });
var dop = function (orig, self, args) { var d = orig.apply(self, args); return questDockHidden() ? null : d; };
dop.call0 = function (orig, self) { var d = orig.call(self); return questDockHidden() ? null : d; };
var newD = hook({f: store.dock}, "f", dop);
var sink = 0;
bench("old getCanUseMultiAccountMobile x100", function () { for (var i = 0; i < 100; i++) sink += oldA.f() ? 1 : 0; });
bench("new getCanUseMultiAccountMobile x100", function () { for (var i = 0; i < 100; i++) sink += newA.f() ? 1 : 0; });
bench("old quest dock x100", function () { for (var i = 0; i < 100; i++) sink += oldD.f().a; });
bench("new quest dock x100", function () { for (var i = 0; i < 100; i++) sink += newD.f().a; });
