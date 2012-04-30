function Parser(src) {
    this.src = src;

    this.tokens = {
        WHITESPACE:     /^\s+/,
        NUMBER:         /^(\d+(\.?\d*([eE][+-]?\d+)?)?|\.\d+([eE][+-]?\d+)?)/,
        FUNCTION:       /^(d\/dx|([a-z]+\'*))\(/i,
        VARIABLE:       /^([a-z]+\'*)/i,
        EQUALS:         /^=/,
        PLUS:           /^\+/,
        MINUS:          /^-/,
        TIMES:          /^\*/,
        DIVIDE:         /^\//,
        POWER:          /^\^/,
        OPEN_PAREN:     /^\(/,
        CLOSE_PAREN:    /^\)/,
        COMMA:          /^,/,
        END_OF_INPUT:   /^$/,
    };

    this.functions = {
        ln:     AST.LogNatural,
        sin:    AST.Sin,
        cos:    AST.Cos,
        tan:    AST.Tan,
        "d/dx": AST.Derivative
    };

    this.variables = {
        x: AST.X,
        e: AST.E
    }
};

Parser.Error = function(msg) {
    this.message = msg;
    this.name = "Parser.Error";
};
Parser.Error.prototype = new Error();

Parser.prototype.match_token = function() {
    for(var tok in this.tokens) {
        if(!this.tokens.hasOwnProperty(tok)) return;
        var re = this.tokens[tok];
        if(re.test(this.src)) {
            var m = this.tokens[tok].exec(this.src);
            this.src = this.src.substring(m[0].length);
            if(tok == "WHITESPACE") {
                // ignore
                return this.match_token();
            }
            return [tok, m];
        }
    }
    throw new Parser.Error("unexpected character '" + this.src[0] + "'");
};
Parser.prototype.next_token = function() {
    if(this._peek) {
        var p = this._peek;
        this._peek = null;
        return p;
    }
    this._peek = null;
    var tok = this.match_token();
    return tok;
};
Parser.prototype.peek_token = function() {
    if(!this._peek) {
        this._peek = this.next_token();
    }
    return this._peek;
};
Parser.prototype.expect_token = function(t) {
    var tok = this.next_token();
    if(tok[0] != t) {
        throw new Parser.Error("unexpected token '" + tok[0] + "'");
    }
    return tok;
}

Parser.prototype.parse = function() {
    var expr = this.expression();
    this.expect_token("END_OF_INPUT");
    return expr;
};
Parser.prototype.expression = function() {
    return this.additive_expression();
};
Parser.prototype.additive_expression = function() {
    var expr = this.multiplicative_expression();
    while(this.peek_token()[0] == "PLUS" || this.peek_token()[0] == "MINUS") {
        var type = this.next_token()[0];
        var r = this.multiplicative_expression();
        if(type == "PLUS") {
            expr = new AST.Addition(expr, r);
        } else {
            expr = new AST.Subtraction(expr, r);
        }
    }
    return expr;
};
Parser.prototype.multiplicative_expression = function() {
    var expr = this.power_expression();
    while(this.peek_token()[0] == "TIMES" || this.peek_token()[0] == "DIVIDE") {
        var type = this.next_token()[0];
        var r = this.power_expression();
        if(type == "TIMES") {
            expr = new AST.Multiplication(expr, r);
        } else {
            expr = new AST.Division(expr, r);
        }
    }
    return expr;
};
Parser.prototype.power_expression = function() {
    var expr = this.unary_expression();
    if(this.peek_token()[0] == "POWER") {
        this.next_token();
        expr = new AST.Power(expr, this.power_expression());
    }
    return expr;
};
Parser.prototype.unary_expression = function() {
    switch(this.peek_token()[0]) {
        case "MINUS":
            this.next_token();
            return new AST.Negation(this.unary_expression());
        case "VARIABLE":
            var name = this.next_token()[1][0];
            var variable = this.variables[name];
            if(!variable) {
                throw new Parser.Error("Undefined variable '" + name + "'");
            }
            return new variable();
        case "FUNCTION":
            var name = this.next_token()[1][1];
            var fn = this.functions[name];
            var expr = this.expression();
            this.expect_token("CLOSE_PAREN");
            if(fn) {
                return new fn(expr);
            } else {
                return new AST.UnknownFunction(name, expr);
            }
        case "OPEN_PAREN":
            this.next_token();
            expr = this.expression();
            this.expect_token("CLOSE_PAREN");
            return expr;
        case "NUMBER":
            var token = this.next_token();
            var n = Number(token[1][0]);
            return new AST.Number(n);
        default:
            throw new Parser.Error("unexpected token '" + this.peek_token()[0] + "'");
    }
};