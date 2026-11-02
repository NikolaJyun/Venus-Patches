// Flux action logging (debug log is on by default): every dispatched action goes through dlogAction + dlog.
var DLOG_ACTION_VALUES = new Set(["section", "subsection", "state", "status", "theme", "systemTheme", "reason", "source", "context", "location",
    "connectionState", "idle", "afk", "optimistic", "isPushNotification", "authorizationStatus", "feedId", "enabled", "platform", "appState",
    "isBackground", "code", "errorCode", "readStateType", "mode", "kind", "count", "index", "version", "force", "silent", "local"]);
var DLOG_HIDDEN = /token|authori[sz]ation|password|secret|cookie|session|fingerprint|email|phone|ticket|nonce|captcha|mfa|^content$|^message$/i;

function dlogAction_old(action) {
    const bits = [action.type], rest = [];
    const keys = Object.keys(action);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key === "type") continue;
        const value = action[key], kind = typeof value;
        let show = false;
        if (bits.length < 9) {
            if (kind === "string") show = key.length >= 2 && key.charCodeAt(key.length - 2) === 73 && key.charCodeAt(key.length - 1) === 100 ?
                /^\d{15,21}$/.test(value) || DLOG_ACTION_VALUES.has(key) && value.length <= 40 : DLOG_ACTION_VALUES.has(key) && value.length <= 40;
            else if (kind === "boolean" || kind === "number") show = DLOG_ACTION_VALUES.has(key);
            if (show && DLOG_HIDDEN.test(key)) show = false;
        }
        if (show) bits.push(key + "=" + value);
        else rest.push(Array.isArray(value) ? key + "[" + value.length + "]" : key);
    }
    if (rest.length) bits.push("{" + rest.slice(0, 12).join(",") + (rest.length > 12 ? ",+" + (rest.length - 12) : "") + "}");
    return bits.join(" ");
}
// Per key: 0 = never shown, 1 = shown when it is a snowflake string (…Id), 2 = shown when it is a small value.
var dlogKeyKind = Object.create(null);
function dlogKeyOf(key) {
    var kind = dlogKeyKind[key];
    if (kind === undefined) {
        kind = DLOG_HIDDEN.test(key) ? 0 : (/Id$/.test(key) ? 1 : 0) | (DLOG_ACTION_VALUES.has(key) ? 2 : 0);
        dlogKeyKind[key] = kind;
    }
    return kind;
}
function dlogAction_new(action) {
    var text = action.type, rest = "", restCount = 0, shown = 1;
    var keys = Object.keys(action);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key === "type") continue;
        var value = action[key], kind = dlogKeyOf(key), t = typeof value;
        if (shown < 9 && kind !== 0 && (kind & 1 && t === "string" && /^\d{15,21}$/.test(value) ||
            kind & 2 && (t === "boolean" || t === "number" || t === "string" && value.length <= 40))) {
            text += " " + key + "=" + value; shown++;
        } else if (restCount++ < 12) rest += (restCount > 1 ? "," : "") + key + (Array.isArray(value) ? "[" + value.length + "]" : "");
    }
    if (restCount) text += " {" + rest + (restCount > 12 ? ",+" + (restCount - 12) : "") + "}";
    return text;
}
var actions = [
    {type:"MESSAGE_CREATE", channelId:"1012345678901234567", guildId:"1022345678901234567", message:{id:"1"}, optimistic:false, isPushNotification:false},
    {type:"TYPING_START", channelId:"1012345678901234567", userId:"1032345678901234567", timestamp:1730000000000},
    {type:"PRESENCE_UPDATES", updates:[1,2,3,4,5,6,7,8], guildId:"1022345678901234567"},
    {type:"CHANNEL_SELECT", guildId:"1022345678901234567", channelId:"1012345678901234567", messageId:null, jumpType:"ANIMATED", source:"sidebar", context:"x"},
    {type:"UPDATE_CHANNEL_DIMENSIONS", channelId:"1012345678901234567", scrollTop:123, scrollHeight:4000, offsetHeight:700},
    {type:"MESSAGE_ACK", channelId:"1012345678901234567", messageId:"1042345678901234567", manual:false, newMentionCount:0, local:true},
    {type:"LOAD_MESSAGES_SUCCESS", channelId:"1012345678901234567", messages:new Array(50), isBefore:false, isAfter:false, hasMoreBefore:true, hasMoreAfter:false, limit:50, jump:null, isStale:false, truncate:null}
];

bench("branch dlogAction x7", function(){ var n = 0; for (var i = 0; i < actions.length; i++) n += dlogAction_old(actions[i]).length; return n; });
bench("cached-kind dlogAction x7", function(){ var n = 0; for (var i = 0; i < actions.length; i++) n += dlogAction_new(actions[i]).length; return n; });
