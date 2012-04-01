AST.Negation = function(node) {
    this.node = node;
};

AST.Negation.prototype.derive = function() {
    return new AST.Negation(this.node.derive());
};

AST.Negation.prototype.simplify = function() {
    if(this.node instanceof AST.Negation) {
        return this.node.simplify();
    }
    if(this.node instanceof AST.Number) {
        return new AST.Number(-this.node.number);
    }
    return new AST.Negation(this.node.simplify());
};

AST.Negation.prototype.toString = function() {
    if(!this.node.precedence) {
        return "-" + this.node;
    } else {
        return "-(" + this.node + ")";
    }
};

AST.Negation.prototype.toTeX = function() {
    if(this.node instanceof AST.Addition || this.node instanceof AST.Subtraction) {
        return "-\\left({" + this.node.toTeX() + "}\\right)";
    } else {    
        return "-{" + this.node.toTeX() + "}";
    }
};

AST.Negation.prototype.identical = function(other) {
    return other instanceof AST.Negation && this.node.identical(other.node);
};