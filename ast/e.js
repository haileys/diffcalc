AST.E = function() { };

AST.E.prototype.derive = function() {
    return new AST.Number(0);
};

AST.E.prototype.simplify = function() {
    return this;
};

AST.E.prototype.toString = function() {
    return "e";
};

AST.E.prototype.toTeX = function() {
    return "e";
};

AST.E.prototype.identical = function(other) {
    return other instanceof AST.E;
};