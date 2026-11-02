// PresenceStore getActivities(userId) / getUnfilteredActivities(userId): one argument, read per presence render.
// Game Time / Unique Games on (badgeNeedsGame), no game running: inject() returns the list as it is.
var settings = {badges: true, badgesGameTime: true}, features = {badges: true};
function enabled(key) { return !!settings[key] && !!features[key]; }
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
var badges = {current: null, extra: []};
function badgeNeedsGame() { return !!(enabled("badges") && (settings.badgesGameTime || settings.badgesUniqueGames)); }
function badgeEntries() { return [badges.current].concat(badges.extra).filter(Boolean); }
function inject(list) {
    var arr = Array.isArray(list) ? list : [];
    if (!badgeNeedsGame()) return arr;
    var missing = badgeEntries().filter(function (entry) { return !arr.some(function (a) { return a && a.application_id === entry.game.id; }); });
    return missing.length ? arr.concat(missing.map(function (entry) { return {name: entry.game.name}; })) : arr;
}
function hook(exports, key, operation) {
    var orig = exports[key], call1 = operation.call1;
    var patched = typeof call1 === "function" ?
        function (a) { return arguments.length === 1 ? call1(orig, this, a) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
var acts = [{application_id: "1"}, {application_id: "2"}];
function mk() { return {getActivities: function (id) { return acts; }}; }
var o = hook(mk(), "getActivities", function (orig, self, args) { return inject(orig.apply(self, args)); });
var presence = function (orig, self, args) { return inject(orig.apply(self, args)); };
presence.call1 = function (orig, self, id) { return inject(orig.call(self, id)); };
var n = hook(mk(), "getActivities", presence);
var sink = 0;
bench("old getActivities x100", function () { for (var i = 0; i < 100; i++) if (o.getActivities("42")) sink++; });
bench("new getActivities x100", function () { for (var i = 0; i < 100; i++) if (n.getActivities("42")) sink++; });
