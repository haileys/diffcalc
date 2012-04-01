AST.Addition = function(left, right) {
    this.left = left;
    this.right = right;
};

AST.Addition.prototype = new AST.BinaryOperation();
AST.Addition.prototype.constructor = AST.Addition;

AST.Addition.prototype.precedence = 1;

AST.Addition.prototype.operator = "+";

AST.Addition.prototype.derive = function() {
    return new AST.Addition(this.left.derive(), this.right.derive());
};

AST.Addition.prototype.simplify = function() {
    var left = this.left.simplify();
    var right = this.right.simplify();
    if(left.identical(right)) {
        return new AST.Multiplication(new AST.Number(2), left).simplify();
    }
    if(left instanceof AST.Number && left.number == 0) {
        return right;
    }
    if(right instanceof AST.Number && right.number == 0) {
        return left;
    }
    if(left instanceof AST.Number && right instanceof AST.Number) {
        return new AST.Number(left.number + right.number);
    }
    if(right instanceof AST.Negation) {
        return new AST.Subtraction(left, right.node).simplify();
    }
    return new AST.Addition(left, right);
};