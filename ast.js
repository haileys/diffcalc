AST = {};

AST.BinaryOperation = function() {
};
AST.BinaryOperation.prototype.toString = function() {
    var left = (this.precedence && this.precedence > this.left.precedence) ? "(" + this.left.toString() + ")" : this.left.toString();
    var right = (this.precedence && this.precedence > this.right.precedence) ? "(" + this.right.toString() + ")" : this.right.toString();
    return left + " " + this.operator + " " + right;
};
AST.BinaryOperation.prototype.toTeX = function() {
    var left = (this.precedence && this.precedence > this.left.precedence) ? "\\left(" + this.left.toTeX() + "\\right)" : this.left.toTeX();
    var right = (this.precedence && this.precedence > this.right.precedence) ? "\\left(" + this.right.toTeX() + "\\right)" : this.right.toTeX();
    return "{{" + left + "} " + (this.operatorTeX || this.operator) + " {" + right + "}}";
};



AST.Addition = function(left, right) {
    this.left = left;
    this.right = right;
};
AST.Addition.prototype = new AST.BinaryOperation();
AST.Addition.prototype.precedence = 1;
AST.Addition.prototype.operator = "+";
AST.Addition.prototype.derive = function() {
    return new AST.Addition(this.left.derive(), this.right.derive());
};
AST.Addition.prototype.simplify = function() {
    var left = this.left.simplify();
    var right = this.right.simplify();
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



AST.Subtraction = function(left, right) {
    this.left = left;
    this.right = right;
};
AST.Subtraction.prototype = new AST.BinaryOperation();
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



AST.Multiplication = function(left, right) {
    this.left = left;
    this.right = right;
};
AST.Multiplication.prototype = new AST.BinaryOperation();
AST.Multiplication.prototype.precedence = 2;
AST.Multiplication.prototype.operator = "*";
AST.Multiplication.prototype.operatorTeX = "\\times";
AST.Multiplication.prototype.derive = function() {
    return new AST.Addition(new AST.Multiplication(this.left.derive(), this.right), new AST.Multiplication(this.left, this.right.derive()));
};
AST.Multiplication.prototype.simplify = function() {
    var left = this.left.simplify();
    var right = this.right.simplify();
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
    if((left instanceof AST.Division) && (right instanceof AST.Division)) {
        return new AST.Division(new AST.Multiplication(left.left, right.left), new AST.Multiplication(left.right, right.right)).simplify();
    }
    if(left instanceof AST.Division) {
        return new AST.Division(new AST.Multiplication(left.left, right), left.right).simplify();
    }
    if(right instanceof AST.Division) {
        return new AST.Division(new AST.Multiplication(right.left, left), right.right).simplify();
    }
    if(left instanceof AST.Number && right instanceof AST.Number) {
        return new AST.Number(left.number * right.number);
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



AST.Division = function(left, right) {
    this.left = left;
    this.right = right;
};
AST.Division.prototype = new AST.BinaryOperation();
AST.Division.prototype.precedence = 0;
AST.Division.prototype.operator = "/";
AST.Division.prototype.operatorTeX = "\\over";
AST.Division.prototype.derive = function() {
    return new AST.Division(new AST.Subtraction(new AST.Multiplication(this.left.derive(), this.right), new AST.Multiplication(this.left, this.right.derive())), new AST.Power(this.right, new AST.Number(2)));
};
AST.Division.prototype.simplify = function() {
    var left = this.left.simplify();
    var right = this.right.simplify();
    if(left instanceof AST.Number) {
        if(left.number == 0) {
            return new AST.Number(0);
        }
    }
    if(right instanceof AST.Number) {
        if(right.number == 1) {
            return left;
        }
    }
    if((left instanceof AST.Number) && (right instanceof AST.Number)) {
        function gcd(a, b) {
            if(b == 0) {
                return a;
            } else {
                return gcd(b, a % b);
            }
        }
        var factor = gcd(left.number, right.number);
        return new AST.Division(new AST.Number(left.number / factor), new AST.Number(right.number / factor));
    }
    if((left instanceof AST.Negation) && (right instanceof AST.Negation)) {
        return new AST.Division(left.node, right.node).simplify();
    }
    if(left instanceof AST.Negation) {
        return new AST.Negation(new AST.Division(left.node, right)).simplify();
    }
    if(right instanceof AST.Negation) {
        return new AST.Negation(new AST.Division(left, right.node)).simplify();
    }
    return new AST.Division(left, right);
};



AST.Power = function(left, right) {
    this.left = left;
    this.right = right;
};
AST.Power.prototype = new AST.BinaryOperation();
AST.Power.prototype.precedence = 3;
AST.Power.prototype.operator = "^";
AST.Power.prototype.derive = function() {
    // charliesome: so d/dx(f(x)^g(x)) == [f(x)]^g(x) * (g'(x)ln(f(x))+g(x)*f'(x)/f(x)) ?
    // bgbn[laptop]: yes.
    
    function pow(a,b) { return new AST.Power(a,b); }
    function mul(a,b) { return new AST.Multiplication(a,b); }
    function div(a,b) { return new AST.Division(a,b); }
    function add(a,b) { return new AST.Addition(a,b); }
    function ln(x) { return new AST.LogNatural(x); }
    
    var f = this.left, g = this.right, fdash = f.derive(), gdash = g.derive();
    
    return mul(pow(f, g), add(mul(gdash, ln(f)), mul(g, div(fdash, f))));
};
AST.Power.prototype.simplify = function() {
    var left = this.left.simplify();
    var right = this.right.simplify();
    if(left instanceof AST.Number) {
        if(left.number == 1) {
            return left;
        }
    }
    if(right instanceof AST.Number) {
        if(right.number == 0) {
            return new AST.Number(1);
        }
        if(right.number == 1) {
            return left;
        }
    }
    if((left instanceof AST.Number) && (right instanceof AST.Number)) {
        return new AST.Number(Math.pow(left.number, right.number));
    }
    if((left instanceof AST.E) && (right instanceof AST.LogNatural)) {
        return right.node;
    }
    return new AST.Power(left, right);
};



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
    if(!this.node.precedence) {
        return "-{" + this.node.toTeX() + "}";
    } else {
        return "-({" + this.node.toTeX() + "})";
    }
}



AST.Number = function(number) {
    this.number = number;
};
AST.Number.prototype.derive = function() {
    return new AST.Number(0);
};
AST.Number.prototype.simplify = function() {
    if(this.number < 0) {
        return new AST.Negation(new AST.Number(-this.number));
    } else {
        return this;
    }
};
AST.Number.prototype.toString = function() {
    return this.number.toString();
};
AST.Number.prototype.toTeX = function() {
    return this.toString();
};



AST.X = function() {
};
AST.X.prototype.derive = function() {
    return new AST.Number(1);
};
AST.X.prototype.simplify = function() {
    return this;
};
AST.X.prototype.toString = function() {
    return "x";
};
AST.X.prototype.toTeX = function() {
    return "x";
};



AST.E = function() {
};
AST.E.prototype.derive = function() {
    return new AST.Number(0);
};
AST.E.prototype.simplify = function() {
    return this;
};
AST.E.prototype.toString = function() {
    return "e";
};
AST.E.prototype.toTeX = function() {
    return "e";
};



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



AST.Sin = function(node) {
    this.node = node;
};
AST.Sin.prototype.derive = function() {
    return new AST.Multiplication(new AST.Cos(this.node), this.node.derive());
};
AST.Sin.prototype.simplify = function() {
    var node = this.node.simplify();
    return new AST.Sin(node);
};
AST.Sin.prototype.toString = function() {
    return "sin(" + this.node.toString() + ")";
};
AST.Sin.prototype.toTeX = function() {
    return "\\sin\\left({" + this.node.toTeX() + "}\\right)";
};



AST.Cos = function(node) {
    this.node = node;
};
AST.Cos.prototype.derive = function() {
    return new AST.Multiplication(new AST.Negation(new AST.Sin(this.node)), this.node.derive());
};
AST.Cos.prototype.simplify = function() {
    var node = this.node.simplify();
    return new AST.Cos(node);
};
AST.Cos.prototype.toString = function() {
    return "cos(" + this.node.toString() + ")";
};
AST.Cos.prototype.toTeX = function() {
    return "\\cos\\left({" + this.node.toTeX() + "}\\right)";
};



AST.Tan = function(node) {
    this.node = node;
};
AST.Tan.prototype.derive = function() {
    return new AST.Multiplication(new AST.Division(new AST.Number(1), new AST.Power(new AST.Cos(this.node), new AST.Number(2))), this.node.derive());
};
AST.Tan.prototype.simplify = function() {
    var node = this.node.simplify();
    return new AST.Tan(node);
};
AST.Tan.prototype.toString = function() {
    return "tan(" + this.node.toString() + ")";
};
AST.Tan.prototype.toTeX = function() {
    return "\\tan\\left({" + this.node.toTeX() + "}\\right)";
};