AST.Division = function(left, right) {
    this.left = left;
    this.right = right;
};

AST.Division.prototype = new AST.BinaryOperation();
AST.Division.prototype.constructor = AST.Division;

AST.Division.prototype.precedence = 0;

AST.Division.prototype.operator = "/";

AST.Division.prototype.operatorTeX = "\\over";

AST.Division.prototype.derive = function() {
    return new AST.Division(new AST.Subtraction(new AST.Multiplication(this.left.derive(), this.right), new AST.Multiplication(this.left, this.right.derive())), new AST.Power(this.right, new AST.Number(2)));
};

AST.Division.prototype.simplify = function() {
    var left = this.left.simplify();
    var right = this.right.simplify();
    
    function gcd(a, b) {
        if(b == 0) {
            return a;
        } else {
            return gcd(b, a % b);
        }
    }
    
    if((left instanceof AST.Number) && (right instanceof AST.Number)) {
        var factor = gcd(left.number, right.number);
        if(right.number == factor) {
            return new AST.Number(left.number / factor);
        } else {
            return new AST.Division(new AST.Number(left.number / factor), new AST.Number(right.number / factor));
        }
    }
    
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

    if(right instanceof AST.Division) {
        return new AST.Multiplication(left, new AST.Division(right.right, right.left)).simplify();
    }
    
    if(left instanceof AST.Division) {
        return new AST.Division(left.left, new AST.Multiplication(left.right, right));
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

    return this.removeCommonFactors();
};

AST.Division.prototype.removeCommonFactors = function() {
    var left = this.left.simplify();
    var right = this.right.simplify();
    
    var top_muls = []
    var bottom_muls = [];
    for(var top = left; top instanceof AST.Multiplication; top = top.right) {
        top_muls.push(top.left);
    }
    top_muls.push(top);
    
    for(var bottom = right; bottom instanceof AST.Multiplication; bottom = bottom.right) {
        bottom_muls.push(bottom.left);
    }
    bottom_muls.push(bottom);
    
    for(var i = 0; i < top_muls.length; i++) {
        for(var j = 0; j < bottom_muls.length; j++) {
            if(top_muls[i] instanceof AST.Sin && bottom_muls[j] instanceof AST.Cos && top_muls[i].node.identical(bottom_muls[j].node)) {
                top_muls[i] = new AST.Tan(top_muls[i].node);
                bottom_muls[j] = new AST.Number(1);
            }
            if(top_muls[i] instanceof AST.Power && top_muls[i].right instanceof AST.Number && top_muls[i].left.identical(bottom_muls[j])) {
                top_muls[i] = new AST.Power(top_muls[i].left, new AST.Number(top_muls[i].right.number - 1)).simplify();
                bottom_muls[j] = new AST.Number(1);
            }
            if(top_muls[i].identical(bottom_muls[j])) {
                top_muls[i] = new AST.Number(1);
                bottom_muls[j] = new AST.Number(1);
            }
        }
    }
    
    var top = top_muls.reduceRight(function(b, a) { return new AST.Multiplication(b, a); }).simplify();
    var bottom = bottom_muls.reduceRight(function(b, a) { return new AST.Multiplication(b, a); }).simplify();
    
    if(bottom instanceof AST.Number && bottom.number == 1) {
        return top;
    }
    
    return new AST.Division(top, bottom);
};