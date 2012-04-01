AST = {};

AST.BinaryOperation = function() { };

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

// identical does not test for equality, it tests for identicalness
// for example: '2' and '1 + 1' are not identical, even though they
// are equal
AST.BinaryOperation.prototype.identical = function(other) {
    if(other instanceof this.constructor) {
        return this.left.identical(other.left) && this.right.identical(other.right);
    }
    return false;
};