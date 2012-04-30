AST.Derivative = function Sin(node) {
    this.node = node;
};

AST.Derivative.prototype = new AST.Function();
AST.Derivative.prototype.constructor = AST.Derivative;

AST.Derivative.prototype.name = "d/dx";

AST.Derivative.prototype.nameTeX = "{d \\over dx}";

AST.Derivative.prototype.derive = function() {
    return this.node.derive().derive();
};

AST.Derivative.prototype.simplify = function() {
    return this.node.simplify().derive().simplify();
};