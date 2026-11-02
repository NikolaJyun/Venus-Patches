// 3000-message channel window with 40 kept messages appended unsorted (what merge() leaves behind).
function makeWindow(n, kept) {
    var arr = [], base = 1100000000000000000;
    for (var i = 0; i < n; i++) arr.push({id: String(base + i * 7919 + 13)});
    for (var k = 0; k < kept; k++) arr.push({id: String(base + (k * 73 + 5) * 7919 + 13 + 1)});
    return arr;
}
var SRC = makeWindow(3000, 40);
function oldSort(array) {
    var ids = new Map();
    var idOf = function (message) {
        var id = ids.get(message);
        if (id === undefined) { var text = String(message.id); id = /^\d+$/.test(text) ? text : null; ids.set(message, id); }
        return id;
    };
    array.sort(function (a, b) {
        var left = idOf(a), right = idOf(b);
        if (left === null || right === null) return 0;
        return left.length - right.length || (left === right ? 0 : left < right ? -1 : 1);
    });
    return array;
}
function newSort(array) {
    // Decorate once: one regex test per message, no Map lookups inside the comparator.
    var n = array.length, items = new Array(n), numeric = true;
    for (var i = 0; i < n; i++) {
        var text = String(array[i].id), ok = /^\d+$/.test(text);
        if (!ok) numeric = false;
        items[i] = {m: array[i], id: ok ? text : null};
    }
    items.sort(function (a, b) {
        var left = a.id, right = b.id;
        if (left === null || right === null) return 0;
        return left.length - right.length || (left === right ? 0 : left < right ? -1 : 1);
    });
    for (var j = 0; j < n; j++) array[j] = items[j].m;
    return array;
}
var chk1 = oldSort(SRC.slice()), chk2 = newSort(SRC.slice()), same = true;
for (var q = 0; q < chk1.length; q++) if (chk1[q] !== chk2[q]) same = false;
print("identical result: " + same);
bench("old sort 3040", function () { return oldSort(SRC.slice()).length; });
bench("new sort 3040", function () { return newSort(SRC.slice()).length; });
