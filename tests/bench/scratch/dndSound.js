// playInAppMessageSound(message) takes one argument (Discord 351.11) and runs for every in-app message sound.
// DND banners built in, status not Do Not Disturb (the common case).
var settings = {dndBanners: true}, features = {dndBanners: true};
var featureTable = Object.create(null);
function enabled(key) { return !!settings[key] && !!features[key]; }
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
function dndIsOn() { return false; }
function hook(exports, key, operation) {
    var orig = exports[key], call1 = operation.call1;
    var patched = typeof call1 === "function" ?
        function (a) { return arguments.length === 1 ? call1(orig, this, a) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
function dndOld(orig, self, args) { return enabled("dndBanners") && dndIsOn() ? undefined : orig.apply(self, args); }
function dndNew(orig, self, args) { return enabled("dndBanners") && dndIsOn() ? undefined : orig.apply(self, args); }
dndNew.call1 = function (orig, self, message) { return enabled("dndBanners") && dndIsOn() ? undefined : orig.call(self, message); };
function mk() { return {playInAppMessageSound: function (m) { return 1; }}; }
var o = hook(mk(), "playInAppMessageSound", dndOld), n = hook(mk(), "playInAppMessageSound", dndNew);
var message = {id: "1"}, sink = 0;
bench("old playInAppMessageSound x100", function () { for (var i = 0; i < 100; i++) sink += o.playInAppMessageSound(message); });
bench("new playInAppMessageSound x100", function () { for (var i = 0; i < 100; i++) sink += n.playInAppMessageSound(message); });
