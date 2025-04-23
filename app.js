// List of valid categories (used in form validation)
const categories = ['Food', 'Travel', 'Bills'];

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

//Calculate total and per-category sums
const calculateSummary = (expenses) => {
  // calculate total by summing all expense amounts
  // reduce: Like adding numbers in a loop, start at 0
  // Add current expense's to running sum
  const total = expenses.reduce((sum, expense) =>  {
    return sum + expense.amount
  }, 0); // start at 0

  // Cal sums for each category (Food, Travel, Bills)
  // Build an object with category total
  const byCategory = expenses.reduce((acc, expense) => {
    // Add expense amount to its category's total
    // if category doesn't exist, start at 0
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {Food: 0, Travel: 0, Bills: 0});
  
// Return object with total and category sums
  return {total, byCategory};
}


// Display all sum expenses
const renderSummary = (expenses) => {
  const totalElement = document.querySelector('#summary p');
  totalElement.innerHTML = '';
  const categoryListElement = document.querySelector('#category-total');

  if (!totalElement || !categoryListElement) {
    showError('Something went wrong') // Check if element exist to avoid error
    return;
  }

  // Update total display
  totalElement.textContent = `Total: ${expenses.total.toFixed(2)}`
  categoryListElement.innerHTML = ''; // clear existing category list to prevent duplicate
  for ( const [category, amount] of Object.entries(expenses.byCategory)) {
    const listItem = document.createElement('li');
    // Set text with category and formated amount
    listItem.textContent = `${category}: N ${amount.toFixed(2)}` ;
    categoryListElement.appendChild(listItem); // Append <li> to <ul>
  }
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


const saveExpenses = (expenses) => {
  localStorage.setItem('expenses', JSON.stringify(expenses))
}

const loadExpenses = (expenses) => {
  JSON.parse(localStorage.getItem(expenses)) || [];
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

    // calculate and render summary
    renderSummary(calculateSummary(expenses))

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
    // calculate and render summary
    renderSummary(calculateSummary(expenses))
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



console.log('initial expenses:',  expenses)
