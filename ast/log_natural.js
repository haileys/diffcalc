AST.LogNatural = function(node) {
    this.node = node;
};

AST.LogNatural.prototype.derive = function() {
    return new AST.Division(this.node.derive(), this.node);
};

AST.LogNatural.prototype.simplify = function() {
    var node = this.node.simplify();
    if((node instanceof AST.Number) && node.number == 1) {
        return new AST.Number(0);
    }
    if(node instanceof AST.E) {
        return new AST.Number(1);
    }
    if((node instanceof AST.Power) && (node.left instanceof AST.E)) {
        return node.right;
    }
    return new AST.LogNatural(node);
};

AST.LogNatural.prototype.toString = function() {
    return "ln(" + this.node.toString() + ")";
};

AST.LogNatural.prototype.toTeX = function() {
    return "\\log_{e}{\\left(" + this.node.toTeX() + "\\right)}";
};

AST.LogNatural.prototype.identical = function(other) {
    return other instanceof AST.LogNatural && this.node.identical(other.node);
};