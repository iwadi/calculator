const input = document.getElementById('numberInput');
let currentExpression = '';
let cursorPosition = 0;

function evaluateSimpleExpression(expression) {
    if (!expression) return 0;
    
    const tokens = expression.match(/(\d+\.?\d*)|[+\-*/]/g);
    if (!tokens) return 0;

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === '-' && (i === 0 || ['+', '-', '*', '/'].includes(tokens[i-1]))) {
            tokens[i+1] = '-' + tokens[i+1];
            tokens.splice(i, 1);
            i--;
        }
    }
    
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
        currentExpression = formatResult(result);
        cursorPosition = currentExpression.length;
    } catch (error) {
        currentExpression = 'Ошибка';
        cursorPosition = 0;
        setTimeout(() => clearInput(), 1500);
    }
    updateDisplay();
    input.setSelectionRange(cursorPosition, cursorPosition);
}

input.addEventListener('input', function(event) {
    cursorPosition = input.selectionStart;
    let value = input.value;
    value = value.replace(/\s/g, '');

    const allowedChars = /[0-9+\-*/().%]/;
    let filteredValue = '';
    for (let i = 0; i < value.length; i++) {
        if (allowedChars.test(value[i])) {
            filteredValue += value[i];
        }
    }

    if (value !== filteredValue) {
        input.value = filteredValue;
        value = filteredValue;
    }

    currentExpression = value;
    updateDisplay();
    input.setSelectionRange(cursorPosition, cursorPosition);
});

input.addEventListener('keydown', function(event) {
    const key = event.key;

    if (event.ctrlKey || event.metaKey) {
        return;
    }

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

input.addEventListener('paste', function(event) {
    setTimeout(() => {
        cursorPosition = input.selectionStart;
        let value = input.value;
        value = value.replace(/\s/g, '');
        
        const allowedChars = /[0-9+\-*/().%]/;
        let filteredValue = '';
        for (let i = 0; i < value.length; i++) {
            if (allowedChars.test(value[i])) {
                filteredValue += value[i];
            }
        }

        if (value !== filteredValue) {
            input.value = filteredValue;
            value = filteredValue;
        }

        currentExpression = value;
        updateDisplay();
        input.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
});

input.addEventListener('click', function(event) {
    cursorPosition = input.selectionStart;
});

input.addEventListener('keyup', function(event) {
    cursorPosition = input.selectionStart;
});

function appendToExpression(value) {
    if (currentExpression === 'Ошибка') {
        currentExpression = '';
        cursorPosition = 0;
    }

    currentExpression = currentExpression.slice(0, cursorPosition) + 
    value + 
    currentExpression.slice(cursorPosition);
    
    cursorPosition += value.length;
    updateDisplay();
    input.setSelectionRange(cursorPosition, cursorPosition);
}

function addDecimal() {
    if (currentExpression === 'Ошибка') {
        currentExpression = '';
        cursorPosition = 0;
    }

    const beforeCursor = currentExpression.slice(0, cursorPosition);
    const afterCursor = currentExpression.slice(cursorPosition);
    
    const currentNumber = beforeCursor.split(/[-+*/%]/).pop() + afterCursor.split(/[-+*/%]/)[0];
    
    if (!currentNumber.includes('.')) {
        currentExpression = beforeCursor + '.' + afterCursor;
        cursorPosition += 1;
        updateDisplay();
        input.setSelectionRange(cursorPosition, cursorPosition);
    }
}

function clearInput() {
    currentExpression = '';
    cursorPosition = 0;
    updateDisplay();
    input.setSelectionRange(0, 0);
}

function backspace() {
    if (currentExpression === 'Ошибка') {
        currentExpression = '';
        cursorPosition = 0;
    } else if (cursorPosition > 0) {
        currentExpression = currentExpression.slice(0, cursorPosition - 1) + 
        currentExpression.slice(cursorPosition);
        cursorPosition -= 1;
    }
    updateDisplay();
    input.setSelectionRange(cursorPosition, cursorPosition);
}

function formatResult(num) {
    if (typeof num !== 'number') return num.toString();
    
    if (num % 1 === 0) {
        return num.toString();
    } else {
        return parseFloat(num.toFixed(10)).toString();
    }
}