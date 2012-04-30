AST.UnknownFunction = function UnknownFunction(name, node) {
    this.name = name;
    this.node = node;
};

AST.UnknownFunction.prototype = new AST.Function();
AST.UnknownFunction.prototype.constructor = AST.UnknownFunction;

AST.UnknownFunction.prototype.derive = function() {
    return new AST.Multiplication(new AST.UnknownFunction(this.name + "'", this.node), this.node.derive());
};

AST.UnknownFunction.prototype.simplify = function() {
    var node = this.node.simplify();
    return new AST.UnknownFunction(this.name, node);
};

AST.UnknownFunction.prototype.identical = function(other) {
    return (other instanceof AST.UnknownFunction) && this.name = other.name && this.node.identical(other.node);
};