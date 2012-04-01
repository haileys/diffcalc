AST.Sin = function Sin(node) {
    this.node = node;
};

AST.Sin.prototype = new AST.Function();
AST.Sin.prototype.constructor = AST.Sin;

AST.Sin.prototype.name = "sin";

AST.Sin.prototype.nameTeX = "\\sin";

AST.Sin.prototype.derive = function() {
    return new AST.Multiplication(new AST.Cos(this.node), this.node.derive());
};

AST.Sin.prototype.simplify = function() {
    var node = this.node.simplify();
    return new AST.Sin(node);
};