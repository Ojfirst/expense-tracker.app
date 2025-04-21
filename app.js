// List of valid categories (used in form validation)
const categories = ['food', 'Travel', 'Bills'];

// Load expenses from localStorage, default to empty array
let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');

// PlaceHolder functions
const addEpense = (expenses, newExpense) => {

  return expenses;
}

const deleteExpense = (expenses, id) => {
  // to implement later
  return expenses
}

const calculateExpense = (expenses) => {
  return {total: 0, byCategory: {Food: 0, Travel: 0, Bill: 0}}
}

const renderExpenses = (expenses) => {}

const renderSummary = (expenses) => {}

const saveExpenses = (expenses) => {}