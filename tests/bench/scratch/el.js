// el(): Venus's React.createElement wrapper, called for every element Venus draws (2 to 4 arguments is the usual shape).
var React = {createElement: function (type, props, a, b) { return {type: type, props: props, a: a, b: b, n: arguments.length}; }};
function elOld() { return React.createElement.apply(React, arguments); }
function elNew(type, props, a, b) {
    var n = arguments.length;
    return n === 2 ? React.createElement(type, props) : n === 3 ? React.createElement(type, props, a) : n === 4 ? React.createElement(type, props, a, b) : React.createElement.apply(React, arguments);
}
var T = {}, P = {x: 1}, C1 = {}, C2 = {};
bench("old el(type, props) x100", function () { for (var i = 0; i < 100; i++) elOld(T, P); });
bench("new el(type, props) x100", function () { for (var i = 0; i < 100; i++) elNew(T, P); });
bench("old el(type, props, child) x100", function () { for (var i = 0; i < 100; i++) elOld(T, P, C1); });
bench("new el(type, props, child) x100", function () { for (var i = 0; i < 100; i++) elNew(T, P, C1); });
bench("old el(type, props, 2 children) x100", function () { for (var i = 0; i < 100; i++) elOld(T, P, C1, C2); });
bench("new el(type, props, 2 children) x100", function () { for (var i = 0; i < 100; i++) elNew(T, P, C1, C2); });
