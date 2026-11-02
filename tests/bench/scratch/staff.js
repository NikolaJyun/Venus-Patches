// isStaff / isStaffFromRawUser / isStaffEnv hooks (account switcher, experiments): off = the common case.
var settings = {accountSwitcher: false, experiments: false}, features = {accountSwitcher: true, experiments: true};
function enabled(key) { return !!settings[key] && !!features[key]; }
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
function hookExport(exports, key, operation) {
    var orig = exports[key], call3 = operation.call3, call2 = operation.call2, call1 = operation.call1;
    var patched = typeof call3 === "function" ?
        function (a, b, c) { return arguments.length === 3 ? call3(orig, this, a, b, c) : operation(orig, this, arguments); } :
        typeof call2 === "function" && typeof call1 === "function" ?
        function (a, b) { var n = arguments.length; return n === 1 ? call1(orig, this, a) : n === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        typeof call2 === "function" ? function (a, b) { return arguments.length === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        typeof call1 === "function" ? function (a) { return arguments.length === 1 ? call1(orig, this, a) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
var me = {id: "1"}, other = {id: "2"};
function currentUser() { return me; }
function accountSwitcherStore() { return null; }
// ---- old
function staffOld(orig, self, args) {
    var res = orig.apply(self, args);
    if (res || !enabled("accountSwitcher")) return res;
    var user = args[0], m = currentUser();
    if (!m || (user && user.id === m.id)) return true;
    var store = accountSwitcherStore();
    try { if (store && typeof store.getCanUseMultiAccountMobile === "function" && !store.getCanUseMultiAccountMobile()) return true; } catch (_) {}
    return res;
}
function envOld(orig, self, args) {
    var real = orig.apply(self, args);
    if (real || !enabled("experiments")) return real;
    var user = args[0], m = currentUser();
    return !!(user && m && user.id === m.id);
}
// ---- new
function staffAnswer(res, user) {
    if (res || !enabled("accountSwitcher")) return res;
    var m = currentUser();
    if (!m || (user && user.id === m.id)) return true;
    var store = accountSwitcherStore();
    try { if (store && typeof store.getCanUseMultiAccountMobile === "function" && !store.getCanUseMultiAccountMobile()) return true; } catch (_) {}
    return res;
}
function staffNew(orig, self, args) { return staffAnswer(orig.apply(self, args), args[0]); }
staffNew.call1 = function (orig, self, user) { return staffAnswer(orig.call(self, user), user); };
function envAnswer(real, user) {
    if (real || !enabled("experiments")) return real;
    var m = currentUser();
    return !!(user && m && user.id === m.id);
}
function envNew(orig, self, args) { return envAnswer(orig.apply(self, args), args[0]); }
envNew.call1 = function (orig, self, user) { return envAnswer(orig.call(self, user), user); };
function mk() { return {isStaff: function (u) { return false; }, isStaffEnv: function (u) { return false; }}; }
var a = hookExport(mk(), "isStaff", staffOld), b = hookExport(mk(), "isStaff", staffNew);
var c = hookExport(mk(), "isStaffEnv", envOld), d = hookExport(mk(), "isStaffEnv", envNew);
var sink = 0;
function loop(o, k) { return function () { for (var i = 0; i < 100; i++) if (o[k](i & 1 ? me : other)) sink++; }; }
bench("old isStaff x100, off", loop(a, "isStaff"));
bench("new isStaff x100, off", loop(b, "isStaff"));
bench("old isStaffEnv x100, off", loop(c, "isStaffEnv"));
bench("new isStaffEnv x100, off", loop(d, "isStaffEnv"));
