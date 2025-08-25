const input = document.getElementById('numberInput');
let currentExpression = '';
let history = [];

// Новый обработчик событий для контроля ввода с клавиатуры
input.addEventListener('keydown', function(event) {
    const key = event.key;
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'Enter', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    
    // Проверяем, разрешена ли клавиша
    if (!allowedKeys.includes(key)) {
        event.preventDefault(); // Запрещаем ввод других символов
    }
    
    // Обработка клавиши Enter для вычисления
    if (key === 'Enter') {
        event.preventDefault(); // Предотвращаем стандартное поведение Enter (например, отправку формы)
        calculate();
    }
    
    // Обновляем currentExpression, если ввод разрешён
    setTimeout(() => {
        currentExpression = input.value;
    }, 0);
});

// Добавляет цифру, оператор или скобку в выражение
// Добавляет цифру, оператор или скобку в выражение
function appendToExpression(value) {
    if (currentExpression === 'Ошибка') {
        currentExpression = '';
    }
    
    // Новое условие: если текущее выражение '0' и новый символ не является оператором,
    // заменяем '0' на новый символ. Это предотвращает ввод "0123".
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

// Добавляет десятичную точку
// Добавляет десятичную точку
function addDecimal() {
    const parts = currentExpression.split(/[-+*/%]/);
    const lastPart = parts[parts.length - 1];

    if (!lastPart.includes('.')) {
        // Изменено: если lastPart пустой, добавляем '0.',
        // в противном случае, добавляем просто '.'
        if (lastPart === '') {
            currentExpression += '0.';
        } else if (lastPart === '0') {
             currentExpression += '.';
        } else {
            currentExpression += '.';
        }
    }
    updateDisplay();
}
// Очищает поле ввода
function clearInput() {
    currentExpression = '';
    updateDisplay();
}

// Удаляет один символ справа
// Удаляет один символ справа
function backspace() {
    // Удаляем последний символ
    currentExpression = currentExpression.slice(0, -1);
    
    // Новое условие: Если после удаления currentExpression пустая строка,
    // она такой и остаётся. Это позволяет полностью очистить поле.
    if (currentExpression === '') {
        updateDisplay();
        return;
    }
    
    updateDisplay();
}
// Вычисляет выражение
function calculate() {
    try {
        const result = evaluateExpression(currentExpression);
        currentExpression = result.toString();
    } catch (error) {
        currentExpression = 'Ошибка';
        setTimeout(() => clearInput(), 1500);
    }
    updateDisplay();
}

// Функция для обработки выражения без eval()
function evaluateExpression(expression) {
    expression = expression.replace(/(\d+(\.\d+)?)?%/g, '($1/100)');

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

// Функция для вычисления простых выражений (без скобок)
function evaluateSimpleExpression(expression) {
    const tokens = expression.match(/(\d+\.?\d*)|[+\-*/]/g);
    if (!tokens) return 0;

    for (let i = 1; i < tokens.length; i += 2) {
        const operator = tokens[i];
        if (operator === '*' || operator === '/') {
            const left = parseFloat(tokens[i - 1]);
            const right = parseFloat(tokens[i + 1]);
            let result;
            if (operator === '*') {
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
    for (let i = 1; i < tokens.length; i += 2) {
        const operator = tokens[i];
        const number = parseFloat(tokens[i + 1]);
        if (operator === '+') {
            result += number;
        } else if (operator === '-') {
            result -= number;
        }
    }

    return result;
}

// Обновляет дисплей
function updateDisplay() {
    // Если currentExpression - пустая строка, то ничего не выводим
    input.value = currentExpression;
}