//Removes unnecessary whitespaces and newlines
//Maybe makes parsing easier or more robust
function tokenize(sourceCode){
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";
  const numbers = "1234567890";
  let tokensArray = [];
  let token = "";
  sourceCode.trimStart();
  sourceCode.trimEnd();
  for(let i=0; i<sourceCode.length; i++){
    if(alphabet.includes(sourceCode[i])){
      //It's a letter
      token += sourceCode[i];
      if(!alphabet.includes(sourceCode[i+1])){
        //The next char is not a letter
        tokensArray.push(token);
        token = "";
      }
    }
    else if(numbers.includes(sourceCode[i])){
      //It's a number
      token += sourceCode[i];
      if(!numbers.includes(sourceCode[i+1])){
        //The next char is not a number
        tokensArray.push(token);
        token = "";
      }
    }
    else if(sourceCode[i] != ' ' && sourceCode[i] != '\n' && sourceCode[i] != ',')
        //It's a symbol
        if(sourceCode[i+1] === '='){
          tokensArray.push(sourceCode[i] + '=');
          i++;
        }
        else
          tokensArray.push(sourceCode[i]);
  }
  return tokensArray;
}

function isNumber(string) {
  if (string.length == 0) { return false; }
  const nan = isNaN(Number(string))
  return !nan;
}

function parseOperand(string) {
  if (isNumber(string)) {
    return new Operand({type: "immediate", value: Number(string)});
  }

  return new Operand({type: "variable", value: string});
}

class Parser{
  constructor(sourceCode){
    this.declarations = 0;
    this.source = sourceCode;
    this.symbolTable = [];
    this.functions = [];
    this.tables = [];

    this.loopCount = 0;
    this.ifCount = 0;
  }

  makeDeclaration(declarationLine){
    //int i = 0
    if(declarationLine[2] === '='){
      if(Number(declarationLine[3]) != Number.NaN){
        this.declarations++;
        this.symbolTable[declarationLine[1]] = -(this.declarations*4);
        return new Declaration({
          destination: new Operand({type: "variable", value: declarationLine[1]}),
          value: new Operand({type: "immediate", value: declarationLine[3]})
        });
      }
      //int i = x
      else{
        this.declarations++;
        this.symbolTable[declarationLine[1]] = -(this.declarations*4);
        return new Declaration({
          destination: new Operand({type: "variable", value: declarationLine[1]}),
          value: new Operand({type: "variable", value: declarationLine[3]})
        });
      }
    }
    //int i[3] = {0,1,2}
    else if(declarationLine[2] === '['){
      let arrayValues = declarationLine.slice(7,declarationLine.length-1);
      while(arrayValues.length < Number(declarationLine[3])){
        arrayValues.push('0');
      }
      this.declarations += Number(declarationLine[3]);
      for(let i=0; i<arrayValues.length; i++){
        let symbolName = `${declarationLine[1]}[${i}]`;;
        this.symbolTable[symbolName] = -((this.declarations-i)*4);
      }
      return ArrayDeclaration({
        destination: declarationLine[1],
        size: arrayValues.length,
        values: arrayValues
      });
    }
  }

  makeAssignment(assignmentLine){
    //i = 1 || i = x
    if(assignmentLine[1] === '='){
      if(assignmentLine.length === 3){
        return new Assignment({
          desination: parseOperand(assignmentLine[0]),
          operand: parseOperand(assignmentLine[2])
        });
      }
      //i = a + b || i = a + 1
      if ('+-'.includes(assignmentLine[3])){
        return new Assignment({
          destination: parseOperand(assignmentLine[0]),
          operand: new BinaryExpression({
            operator: assignmentLine[3],
            operand1: parseOperand(assignmentLine[2]),
            operand2: parseOperand(assignmentLine[4]),
          }),
        });
      }
    }
    //i++ || i--
    else if(assignmentLine[1] === assignmentLine[2]){
      return new Assignment({
        destination: new Operand({type: 'variable', value: assignmentLine[0]}),
        operand: new BinaryExpression({
          operator: assignmentLine[1],
          operand1: new Operand({type: 'variable', value: assignmentLine[0]}),
          operand2: new Operand({type: 'immediate', value: 1}),
        }),
      })
    }
    //else syntaxError
  }

  makeIfStatement(condition, statements){
    return new If({
      condition: new BinaryExpression({
        operator: condition[1],
        operand1: parseOperand(condition[0]),
        operand2: parseOperand(condition[2])
      }),
      statements: this.readStatements(statements),
      id: this.ifCount++
    });
  }

  makeForLoop(header, statements){
    let init = [];
    let term = [];
    let inc = [];
    let semicolonIndex;
    for(let i=0; i<header.length; i++){
      if(header[i] != ';')
        init.push(header[i]);
      else {
        header.splice(0, i+1);
        break;
      }
    }
    for(let i=0; i<header.length; i++){
      if(header[i] != ';')
        term.push(header[i]);
      else {
        header.splice(0, i+1);
        break;
      }
    }
    for(let i=0; i<header.length; i++) {
      inc.push(header[i]);
    }

    return new ForLoop({
      declaration: this.makeDeclaration(init),
      condition: new BinaryExpression({
        operator: term[1],
        operand1: new Operand({type: 'variable', value: term[0]}),
        operand2: parseOperand(term[2])
      }),
      update: this.makeAssignment(inc),
      statements: this.readStatements(statements),
      id: this.loopCount++
    });
  }

  readStatements(source){
    let instruction = [];
    while (source.length > 0) {
      let keyword = source[0];
      switch(keyword){
        case 'int':{
          let declarationLine = [];
          let semicolonIndex;
          for(let i=0; i<source.length; i++){
            if(source[i] != ";")
              declarationLine.push(source[i]);
            else{
              semicolonIndex = i;
              break;
            }
          }
          source.splice(0,semicolonIndex+1);
          instruction.push(this.makeDeclaration(declarationLine));
          break;
        }
        case 'if':{
          let condition = [];
          let statements = [];
          if(source[1] === '('){
            for(let i=2; i<source.length; i++){
              if(source[i] != ')')
                condition.push(source[i]);
              else {
                source.splice(0,i+1);
                break;
              }
            }
          }
          //else syntaxError
          if(source[0] === '{'){
            let curlyBraces = 0;
            for(let i=1; i<source.length; i++){
              if(source[i] === '{')
                curylBraces++;
              else if(source[i] === '}'){
                if(curlyBraces > 0)
                  curlyBraces--;
                else{
                  statements = source.slice(1,i);
                  source.splice(0,i+1);
                  break;
                }
              }
            }
          }
          //else syntaxError
          instruction.push(this.makeIfStatement(condition, statements));
          break;
        }
        case 'for':{
          let header = [];
          let statements = [];
          if(source[1] === '('){
            for(let i=2; i<source.length; i++){
              if(source[i] != ')')
                header.push(source[i]);
              else {
                source.splice(0,i+1);
                break;
              }
            }
          }
          //else syntaxError
          if(source[0] === '{'){
            let curlyBraces = 0;
            for(let i=1; i<source.length; i++){
              if(source[i] === '{')
                curlyBraces++;
              else if(source[i] === '}')
                if(curlyBraces > 0)
                  curlyBraces--;
                else{
                  statements = source.slice(1,i);
                  source.splice(0,i+1);
                  break;
                }
              }
            }
          //else syntaxError
          instruction.push(this.makeForLoop(header,statements));
          break;
        }
        case 'return':{
          instruction.push(new Return({operand: parseOperand(source[1])}));
          source.splice(0,3);
          break;
        }
        default:{
          let statement = [];
          for(let i=0; i<source.length; i++){
            if(source[i] != ';')
              statement.push(source[i]);
            else{
              source.splice(0,i+1);
              break;
            }
          }
          instruction.push(this.makeAssignment(statement));
          break;
        }
      }
    }
    return instruction;
  }

  makeFunction(){
    while(this.source.length > 0){
      //int funcName(int x, int a[5], int y, int z)
      const funcName = this.source[1];
      let funcArgs = [];
      let funcStatements = [];
      if(this.source[2] === '('){
        let currentOrder = 0;
        for(let i=3; i<this.source.length; i+=2){
          if(this.source[i] != ')'){
            this.declarations++;
            this.symbolTable[this.source[i+1]] = -(this.declarations*4);
            funcArgs.push(new Argument({
              variableName: this.source[i+1],
              order: currentOrder
            }));
            currentOrder++;
            if(this.source[i+2] === '[')
              i+=3;
          }
          else{
            this.source.splice(0,i+1);
            break;
          }
        }
      }
      let functionCode;
      if(this.source.shift() === '{'){
        let openBraces = 0;
        for(let i=0; i < this.source.length; i++){
          if(this.source[i] === '{')
            openBraces++;
          else if(this.source[i] === '}'){
            if(openBraces > 0)
              openBraces--;
            else{
              functionCode = this.source.slice(0,i);
              this.source.splice(0,i+1);
              break;
            }
          }
        }
      }
      //else syntaxError;
      funcStatements = this.readStatements(functionCode);
      this.functions.push(new Function({
        name: funcName,
        args: funcArgs,
        statements: funcStatements
      }));
      this.tables.push(this.symbolTable);
      this.symbolTable = [];
      this.declarations = 0;
    }
    return this;
  }
}