AST.Subtraction = function(left, right) {
    this.left = left;
    this.right = right;
};

AST.Subtraction.prototype = new AST.BinaryOperation();
AST.Subtraction.prototype.constructor = AST.Subtraction;

AST.Subtraction.prototype.precedence = 1;

AST.Subtraction.prototype.operator = "-";

AST.Subtraction.prototype.derive = function() {
    return new AST.Subtraction(this.left.derive(), this.right.derive());
};

AST.Subtraction.prototype.simplify = function() {
    var left = this.left.simplify();
    var right = this.right.simplify();
    if(left instanceof AST.Number && left.number == 0) {
        return new AST.Negation(right).simplify();
    }
    if(right instanceof AST.Number && right.number == 0) {
        return left;
    }
    if(left instanceof AST.Number && right instanceof AST.Number) {
        return new AST.Number(left.number - right.number);
    }
    if(right instanceof AST.Negation) {
        return new AST.Addition(left, right.node).simplify();
    }
    return new AST.Subtraction(left, right);
};