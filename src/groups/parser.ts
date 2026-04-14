export enum TokenType {
  GENERATOR = 'GENERATOR',
  POWER = 'POWER',
  IDENTITY = 'IDENTITY',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACKET = 'LBRACKET',
  RBRACKET = 'RBRACKET',
  LANGLE = 'LANGLE',
  RANGLE = 'RANGLE',
  COMMA = 'COMMA',
  PIPE = 'PIPE',
  EQUALS = 'EQUALS',
  MINUS = 'MINUS',
  EOF = 'EOF',
}

export interface Token {
  type: TokenType
  value: string
  pos: number
}

interface ExpressionBase {
  kind: string
}

interface GeneratorExpr extends ExpressionBase {
  kind: 'generator'
  generator: string
}

interface IdentityExpr extends ExpressionBase {
  kind: 'identity'
}

interface PowerExpr extends ExpressionBase {
  kind: 'power'
  base: Expression
  power: number
}

interface SequenceExpr extends ExpressionBase {
  kind: 'sequence'
  expressions: Expression[]
}

interface CommutatorExpr extends ExpressionBase {
  kind: 'commutator'
  a: Expression
  b: Expression
}

type Expression = GeneratorExpr | IdentityExpr | PowerExpr | SequenceExpr | CommutatorExpr

export interface ParsedPresentation {
  generators: string[]
  relators: string[]
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let pos = 0

  while (pos < input.length) {
    const ch = input[pos]
    switch (ch) {
      case ' ':
      case '\t':
      case '\n':
        pos += 1
        break
      case '<':
        tokens.push({ type: TokenType.LANGLE, value: '<', pos })
        pos += 1
        break
      case '>':
        tokens.push({ type: TokenType.RANGLE, value: '>', pos })
        pos += 1
        break
      case '(':
        tokens.push({ type: TokenType.LPAREN, value: '(', pos })
        pos += 1
        break
      case ')':
        tokens.push({ type: TokenType.RPAREN, value: ')', pos })
        pos += 1
        break
      case '[':
        tokens.push({ type: TokenType.LBRACKET, value: '[', pos })
        pos += 1
        break
      case ']':
        tokens.push({ type: TokenType.RBRACKET, value: ']', pos })
        pos += 1
        break
      case ',':
        tokens.push({ type: TokenType.COMMA, value: ',', pos })
        pos += 1
        break
      case '|':
        tokens.push({ type: TokenType.PIPE, value: '|', pos })
        pos += 1
        break
      case '=':
        tokens.push({ type: TokenType.EQUALS, value: '=', pos })
        pos += 1
        break
      case '-':
        tokens.push({ type: TokenType.MINUS, value: '-', pos })
        pos += 1
        break
      case '1':
        tokens.push({ type: TokenType.IDENTITY, value: '1', pos })
        pos += 1
        break
      case '^': {
        pos += 1
        const powerStart = pos
        if (pos < input.length && input[pos] === '-') pos += 1
        while (pos < input.length && /\d/.test(input[pos])) pos += 1
        tokens.push({ type: TokenType.POWER, value: input.slice(powerStart, pos), pos })
        break
      }
      default:
        if (/[a-zA-Z]/.test(ch)) {
          tokens.push({ type: TokenType.GENERATOR, value: ch, pos })
          pos += 1
        } else {
          throw new Error(`Unexpected character '${ch}' at position ${pos}`)
        }
    }
  }

  tokens.push({ type: TokenType.EOF, value: '', pos })
  return tokens
}

class Parser {
  private readonly tokens: Token[]
  private pos = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  private peek(): Token {
    return this.tokens[this.pos] ?? this.tokens[this.tokens.length - 1]
  }

  private advance(): Token {
    const token = this.peek()
    if (this.pos < this.tokens.length - 1) this.pos += 1
    return token
  }

  private expect(tokenType: TokenType): Token {
    const token = this.advance()
    if (token.type !== tokenType) {
      throw new Error(`Expected ${tokenType}, got ${token.type} at position ${token.pos}`)
    }
    return token
  }

  parsePresentation(): ParsedPresentation {
    this.expect(TokenType.LANGLE)
    const generators = this.parseGeneratorList()
    this.expect(TokenType.PIPE)
    const relators = this.parseRelationList()
    this.expect(TokenType.RANGLE)
    return { generators, relators }
  }

  parseGeneratorList(): string[] {
    const generators: string[] = []
    while (this.peek().type === TokenType.GENERATOR) {
      generators.push(this.advance().value.toLowerCase())
      if (this.peek().type === TokenType.COMMA) this.advance()
    }
    return generators
  }

  parseRelationList(): string[] {
    const relators: string[] = []
    if (this.peek().type !== TokenType.RANGLE && this.peek().type !== TokenType.EOF) {
      relators.push(...this.parseChainedEquality())
      while (this.peek().type === TokenType.COMMA) {
        this.advance()
        if (this.peek().type !== TokenType.RANGLE && this.peek().type !== TokenType.EOF) {
          relators.push(...this.parseChainedEquality())
        }
      }
    }
    return relators
  }

  private parseChainedEquality(): string[] {
    const expressions = [this.parseExpression()]
    while (this.peek().type === TokenType.EQUALS) {
      this.advance()
      expressions.push(this.parseExpression())
    }

    const relators: string[] = []
    if (expressions.length === 1) {
      relators.push(this.evaluateExpression(expressions[0]))
    } else {
      for (let i = 0; i < expressions.length - 1; i++) {
        const left = this.evaluateExpression(expressions[i])
        const right = this.evaluateExpression(expressions[i + 1])
        relators.push(right === '' ? left : left + invertWord(right))
      }
    }
    return relators
  }

  private parseExpression(): Expression {
    return this.parseSequenceOrPower()
  }

  private parseSequenceOrPower(): Expression {
    const expressions: Expression[] = []
    while (
      [TokenType.GENERATOR, TokenType.LPAREN, TokenType.LBRACKET, TokenType.IDENTITY].includes(this.peek().type)
    ) {
      let expr = this.parseAtom()
      if (this.peek().type === TokenType.POWER) {
        const power = Number.parseInt(this.advance().value, 10)
        expr = { kind: 'power', base: expr, power }
      }
      expressions.push(expr)
    }

    if (expressions.length === 0) return { kind: 'identity' }
    if (expressions.length === 1) return expressions[0]
    return { kind: 'sequence', expressions }
  }

  private parseAtom(): Expression {
    switch (this.peek().type) {
      case TokenType.GENERATOR:
        return { kind: 'generator', generator: this.advance().value }
      case TokenType.IDENTITY:
        this.advance()
        return { kind: 'identity' }
      case TokenType.LPAREN:
        return this.parseGrouped()
      case TokenType.LBRACKET:
        return this.parseCommutator()
      default:
        throw new Error(`Unexpected token ${this.peek().type} at position ${this.peek().pos}`)
    }
  }

  private parseGrouped(): Expression {
    this.expect(TokenType.LPAREN)
    const expr = this.parseSequenceOrPower()
    this.expect(TokenType.RPAREN)
    return expr
  }

  private parseCommutator(): Expression {
    this.expect(TokenType.LBRACKET)
    const a = this.parseSequenceOrPower()
    this.expect(TokenType.COMMA)
    const b = this.parseSequenceOrPower()
    this.expect(TokenType.RBRACKET)
    return { kind: 'commutator', a, b }
  }

  private evaluateExpression(expr: Expression): string {
    switch (expr.kind) {
      case 'generator':
        return expr.generator
      case 'identity':
        return ''
      case 'power': {
        const baseWord = this.evaluateExpression(expr.base)
        if (expr.power === 0) return ''
        if (expr.power > 0) return baseWord.repeat(expr.power)
        return invertWord(baseWord).repeat(-expr.power)
      }
      case 'sequence':
        return expr.expressions.map((e) => this.evaluateExpression(e)).join('')
      case 'commutator': {
        const aWord = this.evaluateExpression(expr.a)
        const bWord = this.evaluateExpression(expr.b)
        return aWord + bWord + invertWord(aWord) + invertWord(bWord)
      }
    }
  }
}

export function invertWord(word: string): string {
  return word
    .split('')
    .reverse()
    .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
    .join('')
}

export function parseGeneratorListString(input: string): string[] {
  const parser = new Parser(tokenize(input))
  const generators = parser.parseGeneratorList()
  return generators
}

export function parseRelationListString(input: string): string[] {
  const parser = new Parser(tokenize(input))
  const relators = parser.parseRelationList()
  return relators
}

export function parsePresentationString(input: string): ParsedPresentation {
  const parser = new Parser(tokenize(input))
  return parser.parsePresentation()
}
