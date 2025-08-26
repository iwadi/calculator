const input = document.getElementById('numberInput');
let currentExpression = '';
// let history = [];

function evaluateSimpleExpression(expression) {
    if (!expression) return 0;
    
    const tokens = expression.match(/(\d+\.?\d*)|[+\-*/]/g);
    if (!tokens) return 0;
    
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === '*' || tokens[i] === '/') {
            const left = parseFloat(tokens[i - 1]);
            const right = parseFloat(tokens[i + 1]);
            let result;
            
            if (isNaN(left) || isNaN(right)) {
                throw new Error('Неверное выражение');
            }
            
            if (tokens[i] === '*') {
                result = left * right;
            } else {
                if (right === 0) throw new Error('Деление на ноль');
                result = left / right;
            }
            
            tokens.splice(i - 1, 3, result.toString());
            i -= 2;
        }
    }
    
    let result = parseFloat(tokens[0]);
    if (isNaN(result)) throw new Error('Неверное выражение');
    
    for (let i = 1; i < tokens.length; i += 2) {
        const operator = tokens[i];
        const number = parseFloat(tokens[i + 1]);
        
        if (isNaN(number)) throw new Error('Неверное выражение');
        
        if (operator === '+') {
            result += number;
        } else if (operator === '-') {
            result -= number;
        } else {
            throw new Error('Неизвестный оператор: ' + operator);
        }
    }
    
    return result;
}

function evaluateExpression(expression) {
    if (!expression) return 0;
    
    expression = expression.replace(/(\d+(\.\d+)?)%/g, function(match) {
        return '(' + parseFloat(match) / 100 + ')';
    });
    
    while (expression.includes('(')) {
        const start = expression.lastIndexOf('(');
        const end = expression.indexOf(')', start);
        
        if (start === -1 || end === -1) {
            throw new Error('Неверные скобки');
        }
        
        const subExpression = expression.substring(start + 1, end);
        const subResult = evaluateSimpleExpression(subExpression);
        expression = expression.substring(0, start) + subResult + expression.substring(end + 1);
    }
    
    return evaluateSimpleExpression(expression);
}

function updateDisplay() {
    input.value = currentExpression;
}

function calculate() {
    try {
        if (currentExpression.trim() === '') return;
        
        const result = evaluateExpression(currentExpression);
        // history.push(`${currentExpression} = ${result}`);
        currentExpression = formatResult(result);
    } catch (error) {
        currentExpression = 'Ошибка';
        setTimeout(() => clearInput(), 1500);
    }
    updateDisplay();
}

input.addEventListener('input', function(event) {
    const value = input.value;
    const lastChar = value.slice(-1);

    const allowedChars = /[0-9+\-*/().%]/;
    if (!allowedChars.test(lastChar) && value !== '') {
        input.value = currentExpression;
        return;
    }
    
    if (currentExpression === '0' && /[0-9]/.test(lastChar)) {
        currentExpression = lastChar;
    } else {
        currentExpression = value;
    }

    updateDisplay();
});

input.addEventListener('keydown', function(event) {
    const key = event.key;

    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 
                        'Backspace', 'Enter', 'Delete', 'ArrowLeft', 'ArrowRight', 
                        'Home', 'End', '+', '-', '*', '/', '%', '(', ')', '.'];

    if (!allowedKeys.includes(key)) {
        event.preventDefault();
        return;
    }

    if (key === 'Enter') {
        event.preventDefault();
        calculate();
    }
});

function appendToExpression(value) {
    if (currentExpression === 'Ошибка') {
        currentExpression = '';
    }

    const isNewValueNumber = !['+', '-', '*', '/', '%', '(', ')', '.'].includes(value);
    if (currentExpression === '0' && isNewValueNumber) {
        currentExpression = value;
    } else {
        const lastChar = currentExpression.slice(-1);
        const isLastCharOperator = ['+', '-', '*', '/', '%'].includes(lastChar);
        const isNewValueOperator = ['+', '-', '*', '/', '%'].includes(value);

        if (isLastCharOperator && isNewValueOperator) {
            currentExpression = currentExpression.slice(0, -1) + value;
        } else {
            currentExpression += value;
        }
    }
    updateDisplay();
}

function addDecimal() {
    if (currentExpression === 'Ошибка') {
        currentExpression = '';
    }

    const parts = currentExpression.split(/[-+*/%]/);
    const lastPart = parts[parts.length - 1];

    if (lastPart === '' || ['+', '-', '*', '/', '%', '('].includes(currentExpression.slice(-1))) {
        currentExpression += '0.';
    } 

    else if (!lastPart.includes('.')) {
        currentExpression += '.';
    }
    updateDisplay();
}

function clearInput() {
    currentExpression = '';
    updateDisplay();
}

function backspace() {
    if (currentExpression === 'Ошибка') {
        currentExpression = '';
    } else {
        currentExpression = currentExpression.slice(0, -1);
    }
    updateDisplay();
}

function formatResult(num) {
    if (typeof num !== 'number') return num.toString();
    
    if (num % 1 === 0) {
        return num.toString();
    } else {
        // Rounding to 10 decimal places
        return parseFloat(num.toFixed(10)).toString();
    }
}