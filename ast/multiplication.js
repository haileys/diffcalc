AST.Multiplication = function(left, right) {
    this.left = left;
    this.right = right;
};

AST.Multiplication.prototype = new AST.BinaryOperation();
AST.Multiplication.prototype.constructor = AST.Multiplication;

AST.Multiplication.prototype.precedence = 2;

AST.Multiplication.prototype.operator = "*";

AST.Multiplication.prototype.operatorTeX = "\\cdot";

AST.Multiplication.prototype.derive = function() {
    return new AST.Addition(new AST.Multiplication(this.left.derive(), this.right), new AST.Multiplication(this.left, this.right.derive()));
};

AST.Multiplication.prototype.simplify = function() {
    var left = this.left.simplify();
    var right = this.right.simplify();
    if(right instanceof AST.Number) {
        var tmp = left;
        left = right;
        right = tmp;
    }
    if(left instanceof AST.Power && left.right instanceof AST.Number) {
        if(left.left.identical(right)) {
            return new AST.Power(right, new AST.Number(left.right.number + 1));
        }
        if(right instanceof AST.Power && right.right instanceof AST.Number) {
            if(right.left.identical(left.left)) {
                return new AST.Power(left.left, new AST.Number(right.right.number + left.right.number));
            }
        }
    }
    if(right instanceof AST.Power && right.right instanceof AST.Number) {
        if(right.left.identical(left)) {
            return new AST.Power(left, new AST.Number(right.right.number + 1));
        }
    }
    if(left.identical(right)) {
        return new AST.Power(left, new AST.Number(2)).simplify();
    }
    if(left instanceof AST.Number && left.number == 0) {
        return new AST.Number(0);
    }
    if(right instanceof AST.Number && right.number == 0) {
        return new AST.Number(0);
    }
    if(left instanceof AST.Number && left.number == 1) {
        return right;
    }
    if(right instanceof AST.Number && right.number == 1) {
        return left;
    }
    if((left instanceof AST.Negation) && (right instanceof AST.Negation)) {
        return new AST.Multiplication(left.node, right.node).simplify();
    }
    if(left instanceof AST.Negation) {
        return new AST.Negation(new AST.Multiplication(left.node, right)).simplify();
    }
    if(right instanceof AST.Negation) {
        return new AST.Negation(new AST.Multiplication(left, right.node)).simplify();
    }
    if(left instanceof AST.Number && right instanceof AST.Number) {
        return new AST.Number(left.number * right.number);
    }
    if(left instanceof AST.Multiplication) {
        var lr = left.right;
        left = left.left;
        return new AST.Multiplication(left, new AST.Multiplication(lr, right)).simplify();
    }
    if(left instanceof AST.Division && right instanceof AST.Division) {
        return new AST.Division(new AST.Multiplication(left.left, right.left), new AST.Multiplication(left.right, right.right)).simplify();
    }
    if(left instanceof AST.Division) {
        return new AST.Division(new AST.Multiplication(left.left, right), left.right).simplify();
    }
    if(right instanceof AST.Division) {
        return new AST.Division(new AST.Multiplication(left, right.left), right.right).simplify();
    }
    if(left instanceof AST.Number && right instanceof AST.Multiplication) {
        if(right.left instanceof AST.Number) {
            return new AST.Multiplication(new AST.Number(left.number * right.left.number), right.right).simplify();
        }
    }
    
    return new AST.Multiplication(left, right);
};

AST.Multiplication.prototype.toTeX = function() {
    if((this.left instanceof AST.Number) && !this.right.precedence) {
        return this.left.toTeX() + this.right.toTeX();
    }
    if((this.right instanceof AST.Number) && !this.left.precedence) {
        return this.right.toTeX() + this.left.toTeX();
    }
    return AST.BinaryOperation.prototype.toTeX.call(this);
};