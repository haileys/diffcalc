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

AST.Number.prototype.identical = function(other) {
    return other instanceof AST.Number && other.number === this.number;
};