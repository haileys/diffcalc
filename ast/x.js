AST.X = function() { };

AST.X.prototype.derive = function() {
    return new AST.Number(1);
};

AST.X.prototype.simplify = function() {
    return this;
};

AST.X.prototype.toString = function() {
    return "x";
};

AST.X.prototype.toTeX = function() {
    return "x";
};

AST.X.prototype.identical = function(other) {
    return other instanceof AST.X;
};