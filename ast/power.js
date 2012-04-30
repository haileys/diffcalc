AST.Power = function(left, right) {
    this.left = left;
    this.right = right;
};

AST.Power.prototype = new AST.BinaryOperation();
AST.Power.prototype.constructor = AST.Power;

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
    if(left instanceof AST.Power) {
        return new AST.Power(left.left, new AST.Multiplication(left.right, right)).simplify();
    }
    if(left instanceof AST.Multiplication && right instanceof AST.Number) {
        return new AST.Multiplication(new AST.Power(left.left, right), new AST.Power(left.right, right)).simplify();
    }
    return new AST.Power(left, right);
};

AST.Power.prototype.toTeX = function() {
    if(this.right instanceof AST.Number) {
        if(this.left.toTeXWithPower) {
            return this.left.toTeXWithPower(this.right.number);
        }
    }
    return AST.BinaryOperation.prototype.toTeX.call(this);
};