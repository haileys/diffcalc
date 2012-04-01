AST.Tan = function(node) {
    this.node = node;
};

AST.Tan.prototype = new AST.Function();
AST.Tan.prototype.constructor = AST.Tan;

AST.Tan.prototype.name = "tan";

AST.Tan.prototype.nameTeX = "\\tan";

AST.Tan.prototype.derive = function() {
    return new AST.Multiplication(new AST.Division(new AST.Number(1), new AST.Power(new AST.Cos(this.node), new AST.Number(2))), this.node.derive());
};

AST.Tan.prototype.simplify = function() {
    var node = this.node.simplify();
    return new AST.Tan(node);
};