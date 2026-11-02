// hideWalk runs on every render of a hooked component while Hide anything has spots removed. The array branch
// allocated a mapped array for every array it visited, even when nothing in it changed (the usual case).
var React = {cloneElement: function (node, props) { return {type: node.type, key: node.key, props: Object.assign({}, node.props, props)}; }};
var hidden = {"guild.boost": 1, "guild.invite": 1};
function spotHidden(key) { return hidden[key] === 1; }
function hideMarkFor(node, key) { return node; }
function classify(node) { return node.props && node.props.spot || null; }
function hideWalk_old(node, depth, classify, edit, gone) {
    if (!node || typeof node !== "object" || depth > 14) return node;
    if (Array.isArray(node)) {
        var changed = false;
        var next = node.map(function (child) { var value = hideWalk_old(child, depth + 1, classify, edit, gone); if (value !== child) changed = true; return value; });
        if (!changed) return node;
        var kept = next.filter(function (child) { return child !== null; });
        return kept.length && kept.every(function (child) { return child && child.props && child.props.accessibilityElementsHidden === true && child.props.children == null; }) ? [] : kept;
    }
    if (!node.props) return node;
    var key = classify(node);
    if (key) return (gone ? gone(key) : spotHidden(key)) ? null : edit ? hideMarkFor(node, key) : node;
    var children = node.props.children;
    if (children == null || typeof children !== "object") return node;
    var next2 = hideWalk_old(children, depth + 1, classify, edit, gone);
    if (next2 === children) return node;
    if (next2 === null || Array.isArray(next2) && !next2.length) return null;
    return React.cloneElement(node, {children: next2});
}
function hideWalk_new(node, depth, classify, edit, gone) {
    if (!node || typeof node !== "object" || depth > 14) return node;
    if (Array.isArray(node)) {
        // Nothing changes in most arrays: only copy once a child does.
        var next = null;
        for (var i = 0; i < node.length; i++) {
            var child = node[i], value = hideWalk_new(child, depth + 1, classify, edit, gone);
            if (value !== child && next === null) next = node.slice(0, i);
            if (next !== null) next.push(value);
        }
        if (next === null) return node;
        var kept = next.filter(function (child) { return child !== null; });
        return kept.length && kept.every(function (child) { return child && child.props && child.props.accessibilityElementsHidden === true && child.props.children == null; }) ? [] : kept;
    }
    if (!node.props) return node;
    var key = classify(node);
    if (key) return (gone ? gone(key) : spotHidden(key)) ? null : edit ? hideMarkFor(node, key) : node;
    var children = node.props.children;
    if (children == null || typeof children !== "object") return node;
    var next2 = hideWalk_new(children, depth + 1, classify, edit, gone);
    if (next2 === children) return node;
    if (next2 === null || Array.isArray(next2) && !next2.length) return null;
    return React.cloneElement(node, {children: next2});
}
function el(type, props, children) { return {type: type, key: null, props: Object.assign({children: children}, props)}; }
function row(i) { return el("View", {}, [el("Text", {}, "label " + i), el("Icon", {}, null), el("Pressable", {onPress: function () {}}, [el("Text", {}, "a"), el("Text", {}, "b")])]); }
function tree(n, withSpot) {
    var kids = [];
    for (var i = 0; i < n; i++) kids.push(row(i));
    if (withSpot) kids.splice(2, 0, el("Btn", {spot: "guild.boost"}, null));
    return el("View", {}, [el("View", {}, kids), el("View", {}, [el("Text", {}, "x")])]);
}
var plain = tree(12, false), withSpot = tree(12, true);
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
if (hideWalk_old(plain, 0, classify, false, null) !== plain || hideWalk_new(plain, 0, classify, false, null) !== plain) throw new Error("plain tree must come back untouched");
if (!same(hideWalk_old(withSpot, 0, classify, false, null), hideWalk_new(withSpot, 0, classify, false, null))) throw new Error("spot tree differs");
bench("old hideWalk, nothing hidden in the tree", function () { return hideWalk_old(plain, 0, classify, false, null); });
bench("new hideWalk, nothing hidden in the tree", function () { return hideWalk_new(plain, 0, classify, false, null); });
bench("old hideWalk, one spot removed", function () { return hideWalk_old(withSpot, 0, classify, false, null); });
bench("new hideWalk, one spot removed", function () { return hideWalk_new(withSpot, 0, classify, false, null); });
