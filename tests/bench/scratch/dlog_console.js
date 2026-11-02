var settings = {debugLog: true}, debugLog = {lines: [], early: [], counts: {E: 0, W: 0, I: 0, D: 0}, dropped: 0};
var DEBUG_LOG_MAX = 4000;
function dlogText(value) {
    if (value == null) return String(value);
    if (typeof value === "string") return value.length > 2000 ? value.slice(0, 2000) + "..." : value;
    if (typeof value === "object" && typeof value.message === "string")
        return String(value.name || "Error") + ": " + value.message;
    if (typeof value === "object") { try { var t = JSON.stringify(value); return t && t.length > 2000 ? t.slice(0, 2000) + "..." : String(t); } catch (_) { return "x"; } }
    return String(value);
}
function dlog(level, tag) {
    if (!settings.debugLog) return;
    var text = "";
    for (var i = 2; i < arguments.length; i++) text += (i > 2 ? " " : "") + dlogText(arguments[i]);
    var line = ("12:00:00.000" + " " + level + " [" + tag + "] " + text).slice(0, 2400);
    debugLog.lines.push(line);
    if (debugLog.counts[level] !== undefined) debugLog.counts[level]++;
    if (debugLog.lines.length > DEBUG_LOG_MAX + 200) { var extra = debugLog.lines.length - DEBUG_LOG_MAX; debugLog.lines.splice(0, extra); debugLog.dropped += extra; }
}
var original = function () { return undefined; };
var oldHook = function () {
    try { if (settings.debugLog) dlog.apply(null, ["I", "console.log"].concat(Array.prototype.slice.call(arguments))); } catch (_) {}
    return original.apply(this, arguments);
};
var newHook = function () {
    try {
        if (settings.debugLog) {
            var n = arguments.length;
            if (n === 1) dlog("I", "console.log", arguments[0]);
            else if (n === 2) dlog("I", "console.log", arguments[0], arguments[1]);
            else dlog.apply(null, ["I", "console.log"].concat(Array.prototype.slice.call(arguments)));
        }
    } catch (_) {}
    return original.apply(this, arguments);
};
function run(h) { h("[Metro] loaded module"); h("fetch", "ok"); h("a", "b", 3); h("[ReactNative] state"); debugLog.lines.length = 0; }
bench("old console hook x4", function () { run(oldHook); });
bench("new console hook x4", function () { run(newHook); });
