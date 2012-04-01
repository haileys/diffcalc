AST.Function = function() { };

AST.Function.prototype.toString = function() {
    return this.name + "(" + this.node.toString() + ")";
};

AST.Function.prototype.toTeX = function() {
    return (this.nameTeX || this.name) + "\\left({" + this.node.toTeX() + "}\\right)";
};

AST.Function.prototype.toTeXWithPower = function(power) {
    return (this.nameTeX || this.name) + "^{" + power + "}\\left({" + this.node.toTeX() + "}\\right)";
};

AST.Function.prototype.identical = function(other) {
    return (other instanceof this.constructor) && this.node.identical(other.node);
};