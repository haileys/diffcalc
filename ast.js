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
	if(left instanceof AST.Number && right instanceof AST.Number) {
		return new AST.Number(left.number * right.number);
	}
	return new AST.Multiplication(left, right);
};
AST.Multiplication.prototype.toTeX = function() {
    if((this.left instanceof AST.Number) && (this.right instanceof AST.X)) {
        return this.left.toTeX() + this.right.toTeX();
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
    if(left instanceof AST.Number && right instanceof AST.Number) {
        return new AST.Number(Math.pow(left.number, right.number));
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
	return this.toString();
}



AST.Number = function(number) {
	this.number = number;
};
AST.Number.prototype.derive = function() {
	return new AST.Number(0);
};
AST.Number.prototype.simplify = function() {
	return this;
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



AST.LogNatural = function(node) {
    this.node = node;
};
AST.LogNatural.prototype.derive = function() {
	return new AST.Division(this.node.derive(), this.node);
};
AST.LogNatural.prototype.simplify = function() {
	return new AST.LogNatural(this.node.simplify());
};
AST.LogNatural.prototype.toString = function() {
	return "ln(" + this.node.toString() + ")";
};
AST.LogNatural.prototype.toTeX = function() {
    return "\\log_{e}{" + this.node.toTeX() + "}";
};