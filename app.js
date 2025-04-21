// List of valid categories (used in form validation)
const categories = ['food', 'Travel', 'Bills'];

// Load expenses from localStorage, default to empty array
let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');

// Add expense
const addExpense = (expenses, newExpense) => {
  // Validate newExpense
  if (
    !newExpense.amount ||
    newExpense.amount <= 0 ||
    !newExpense.description.trim() ||
    !categories.includes(newExpense.category)
  ) {
    return expenses; // Return unchange if invalid
  }

  // Create expense with id & date 
  const expense = {
    id: Date.now(),
    amount: newExpense.amount,
    description: newExpense.description,
    category: newExpense.category,
    date: new Date().toISOString().split('T')[0]
  };
  // Return new array
  return [...expenses, expense];
}

// Delete an expense by ID
const deleteExpense = (expenses, id) => {
  return expenses.filter((expense) => expense.id !== id);
}

const calculateExpense = (expenses) => {
  return {total: 0, byCategory: {Food: 0, Travel: 0, Bill: 0}}
}

// Display Expenses
const renderExpenses = (expenses) => {
  const expenseList = document.getElementById('expense-data'); // tbody
  expenseList.innerHTML = ''; // clear table

  expenses.forEach((expense) => {
    const expensesItem = document.createElement('tr'); // Create new row per expense
    expensesItem.setAttribute('class', 'expenses-item');
    expensesItem.innerHTML = `
    <td>${expense.id}</td>
    <td>N ${expense.amount.toFixed(2)}</td>
    <td>${expense.description}</td>
    <td>${expense.category}</td>
    <td>${expense.date}</td>
    <td><button data-id='${expense.id}'>Delete</button</td>
    `;

    expenseList.appendChild(expensesItem);  // AppendChild each row to HTML(tbody)
  })
}

const renderSummary = (expenses) => {}

// Save Expense to localStorage
const saveExpenses = (expenses) => {
  localStorage.setItem('expenses', JSON.stringify(expenses))
}


// Handle for submission 
const expenseForm = document.querySelector('#expense-form')
expenseForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent page from reloading
  
  const amountInput = document.querySelector('#amount-input');
  const descriptionInput = document.querySelector('#discription-input');
  const categoryInput = document.querySelector('#category-input');

  // Get input Value
  const newExpense = {
    amount : amountInput.valueAsNumber,
    description : descriptionInput.value,
    category : categoryInput.value
  }

  // Add expense
  const updatedExpenses = addExpense(expenses, newExpense);

  // Check if expense was added (not valid)
  if (updatedExpenses !== expenses) {
    expenses = updatedExpenses;
    saveExpenses(expenses);
    renderExpenses(expenses);

    // Clear inputs
    amountInput.value = '';
    descriptionInput.value = '';
    // keep category as-is
  } else {
    showError('Plese enter a valid amount, description and category.')
  }
})


// Handle delete button clicks
const table = document.querySelector('#expense-table');
table.addEventListener('click', (e) => {
  if (e.target.matches('button')) {
    const id = Number(e.target.dataset.id)
    expenses = deleteExpense(expenses, id);
    saveExpenses(expenses);
    renderExpenses(expenses);
  } 
})


// Display error message!
const showError = (message) => {
  const errorEl = document.getElementById('error-message');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');

  setTimeout(() => {
      errorEl.classList.add('hidden')
  }, 3000);
}