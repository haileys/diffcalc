AST.Cos = function Cos(node) {
    this.node = node;
};

AST.Cos.prototype = new AST.Function();
AST.Cos.prototype.constructor = AST.Cos;

AST.Cos.prototype.name = "cos";

AST.Cos.prototype.nameTeX = "\\cos";

AST.Cos.prototype.derive = function() {
    return new AST.Multiplication(new AST.Negation(new AST.Sin(this.node)), this.node.derive());
};

AST.Cos.prototype.simplify = function() {
    var node = this.node.simplify();
    return new AST.Cos(node);
};