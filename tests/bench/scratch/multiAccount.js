// MultiAccountStore getUsers and getValidUsers (the other two getters already have call0): no arguments, feature off.
var settings = {accountSwitcher: false}, features = {accountSwitcher: true}, featureTable = Object.create(null);
function featureFor(k) { return k; }
var enabled = function (key) {
    if (!settings[key]) return false;
    var feature = featureTable[key] || featureFor(key);
    return feature === key ? !!features[key] : !!(features[feature] && settings[feature]);
};
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
function hookExport(exports, key, operation) {
    var orig = exports[key], call3 = operation.call3, call2 = operation.call2, call1 = operation.call1, call0 = operation.call0;
    var patched = typeof call0 === "function" && typeof call1 === "function" ?
        function (a) { var n = arguments.length; return n === 0 ? call0(orig, this) : n === 1 ? call1(orig, this, a) : operation(orig, this, arguments); } :
        typeof call0 === "function" ?
        function () { return arguments.length === 0 ? call0(orig, this) : operation(orig, this, arguments); } :
        typeof call3 === "function" ?
        function (a, b, c) { return arguments.length === 3 ? call3(orig, this, a, b, c) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
var list = [{id: "1"}, {id: "2"}];
function mk() { return {getCanUseMultiAccountMobile: function () { return false; }, getUsers: function () { return list; }, getValidUsers: function () { return list; }, getHasLoggedInAccounts: function () { return true; }}; }
function accountSwitcherWithCurrent(l) { return l; }
function accountSwitcherUsers() { return list; }
var accountSwitcher = {pushOnlyCurrent: false};
function currentUser() { return null; }
// ---- old
var o = mk();
o = hookExport(o, "getCanUseMultiAccountMobile", function (orig, self, args) { return enabled("accountSwitcher") ? true : orig.apply(self, args); });
o = hookExport(o, "getUsers", function (orig, self, args) { var res = orig.apply(self, args); return enabled("accountSwitcher") ? accountSwitcherWithCurrent(res, false) : res; });
o = hookExport(o, "getValidUsers", function (orig, self, args) {
    var res = orig.apply(self, args);
    if (!enabled("accountSwitcher")) return res;
    var l = accountSwitcherWithCurrent(res, true);
    if (accountSwitcher.pushOnlyCurrent) { var me = currentUser(); return me ? l.filter(function (u) { return u && u.id === me.id; }) : l; }
    return l;
});
o = hookExport(o, "getHasLoggedInAccounts", function (orig, self, args) { var res = orig.apply(self, args); return enabled("accountSwitcher") ? (res || accountSwitcherUsers().length > 0) : res; });
// ---- new
var n = mk();
function canUse(orig, self, args) { return enabled("accountSwitcher") ? true : orig.apply(self, args); }
canUse.call0 = function (orig, self) { return enabled("accountSwitcher") ? true : orig.call(self); };
function usersAnswer(res) { return enabled("accountSwitcher") ? accountSwitcherWithCurrent(res, false) : res; }
function usersHook(orig, self, args) { return usersAnswer(orig.apply(self, args)); }
usersHook.call0 = function (orig, self) { return usersAnswer(orig.call(self)); };
function validAnswer(res) {
    if (!enabled("accountSwitcher")) return res;
    var l = accountSwitcherWithCurrent(res, true);
    if (accountSwitcher.pushOnlyCurrent) { var me = currentUser(); return me ? l.filter(function (u) { return u && u.id === me.id; }) : l; }
    return l;
}
function validHook(orig, self, args) { return validAnswer(orig.apply(self, args)); }
validHook.call0 = function (orig, self) { return validAnswer(orig.call(self)); };
function loggedAnswer(res) { return enabled("accountSwitcher") ? (res || accountSwitcherUsers().length > 0) : res; }
function loggedHook(orig, self, args) { return loggedAnswer(orig.apply(self, args)); }
loggedHook.call0 = function (orig, self) { return loggedAnswer(orig.call(self)); };
n = hookExport(n, "getCanUseMultiAccountMobile", canUse);
n = hookExport(n, "getUsers", usersHook);
n = hookExport(n, "getValidUsers", validHook);
n = hookExport(n, "getHasLoggedInAccounts", loggedHook);
function all(s) { for (var i = 0; i < 25; i++) { s.getUsers(); s.getValidUsers(); } }
bench("old getUsers + getValidUsers x25, off", function () { all(o); });
bench("new getUsers + getValidUsers x25, off", function () { all(n); });
