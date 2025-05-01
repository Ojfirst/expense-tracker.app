// Define valid categories for expenses
const categories = ["Food", "Travel", "Bills"];

// Load expenses from localStorage with error handling
let expenses = [];
try {
  // Get "expenses" key from localStorage, default to "[]" if null
  const stored = localStorage.getItem("expenses");
  // Parse JSON to array, or use empty array if invalid
  expenses = stored ? JSON.parse(stored) : [];
} catch (error) {
  // Log error if JSON parsing fails (e.g., corrupted data)
  showError("Failed to load expenses from localStorage:", error);
  // Fallback to empty array
  expenses = [];
}

// Add expense
const addExpense = (expenses, newExpense) => {
  // Validate: Ensure amount is positive, description non-empty, category valid
  if (
    !newExpense.amount ||
    newExpense.amount <= 0 ||
    !newExpense.description.trim() ||
    !categories.includes(newExpense.category)
  ) {
    // Return unchanged array if invalid
    return expenses;
  }
  // Create expense with ID and date
  const expense = {
    id: Date.now(), // Unique ID from timestamp
    amount: newExpense.amount,
    description: newExpense.description,
    category: newExpense.category,
    date: new Date().toISOString().split("T")[0], // Format: "2025-04-23"
  };
  // Return new array with expense added (immutable, FP)
  return [...expenses, expense];

};

// Delete an expense by ID
const deleteExpense = (expenses, id) => {
  // Filter out expense with matching ID, return new array (pure, FP)
  return expenses.filter((expense) => expense.id !== id);
};

// Calculate total and per-category sums
const calculateSummary = (expenses) => {
  // Calculate total by summing all expense amounts
  const total = expenses.reduce((sum, expense) => {
    // Add current expense's amount to running sum
    return sum + expense.amount;
  }, 0); // Start at 0

  
  // Calculate sums for each category
  const byCategory = expenses.reduce((acc, expense) => {
    // Add amount to category's total,  start at 0 if undefined
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc; // Return updated accumulator     
  }, { Food: 0, Travel: 0, Bills: 0 }); // Start with zeros

  // Calculate count for each category
  const countByCategory = expenses.reduce((acc, expense) => {
    const newAcc = {...acc}; // create new object to avoid mutating acc
    //Add count to category's total, start with zeros
    newAcc[expense.category] = (newAcc[expense.category] || 0) + 1;
    return  newAcc; // Return update accumulator
  }, {Food: 0, Travel: 0, Bills: 0} ); // Start with zeros



  // TODO
  const avgByCategory = Object.keys(byCategory).reduce((acc, category) => {
    const newAcc = {...acc}; // New object for immutability
    const count = countByCategory[category] || 1; //Avoid division by zero
    // Calculate average: 0 if no expense, else total / count
    newAcc[category] = count === 0 ? 0 : byCategory[category] / count;
    return newAcc; // Update accumulator
  }, {Food: 0, Travel: 0, Bills: 0}); // At zero for all category

  // Return total and category sums
  return { total, byCategory, countByCategory, avgByCategory};
};

// Display summary in DOM
const renderSummary = (summary) => {
  // Select <p> for total and <ul> for category totals
  const totalElement = document.querySelector("#summary p");
  const categoryListElement = document.querySelector("#category-totals"); // Fixed ID
  // Check if elements exist
  if (!totalElement || !categoryListElement) {
    // Show error if elements missing
    showError("Summary elements not found");
    return;
  }
  // Update total with Naira formatting
  totalElement.textContent = `Total: N ${summary.total.toFixed(2)}`;
  // Clear category list to prevent duplicates
  categoryListElement.innerHTML = "";
  // Loop through byCategory object


  for (const [category, amount] of Object.entries(summary.byCategory)) {
    // Create <li> for each category
    const listItem = document.createElement("li");
    const count = summary.countByCategory[category] || 0; // Get count
    const avg = summary.avgByCategory[category] || 0; // Get avg expense by category
    // Set text with category and formatted amount
    listItem.textContent = `${category}: N ${amount.toFixed(2)}  (Entries: ${count},  Avg: N ${avg.toFixed(2)})`;
    // Append <li> to <ul>
    categoryListElement.appendChild(listItem);
  }

  // Object.keys(summary.byCategory).forEach((category) => {
  //   const amount = summary.byCategory[category];
  
  //   const listItem = document.createElement("li");
  //     // Set text with category and formatted amount
  //     listItem.textContent = `${category}: N ${amount.toFixed(2)}`;
  //     // Append <li> to <ul>
  //     categoryListElement.appendChild(listItem);
  // })
};




// Update Expenses by ID
const updateExpense = (expenses, updatedExpense) => {
  // Validation updatedExpense
  if (
    !updatedExpense.amount ||
    updatedExpense.amount <= 0 ||
    !updatedExpense.description.trim() ||
    !['Food', 'Travel', 'Bills'].includes(updatedExpense.category)
  ) {
    return expenses;
  }

  // map expenses, updating the matching ID
  const newExpenses = expenses.map((expense) =>
    expense.id === updatedExpense.id 
    ? {
      ...expense,
      id: Date.now(), // Unique ID from timestamp
      amount: updatedExpense.amount,
      description: updatedExpense.description,
      category: updatedExpense.category,
      date: new Date().toISOString().split('T')[0], // Update date
    } 
    : expense
  );

  return newExpenses
};




// Display expenses in table
const renderExpenses = (expenses) => {
  // Select <tbody> for expense rows
  const expenseList = document.getElementById("expense-data");
  // Check if element exists
  if (!expenseList) {
    // Show error if table body missing
    showError("Table body #expense-data not found");
    return;
  }
  // Clear table to prevent duplicates
  expenseList.innerHTML = "";
  // Loop through expenses to create rows
  expenses.forEach((expense) => {
    // Create new <tr> per expense
    const expensesItem = document.createElement("tr");
    // Add CSS class for styling
    expensesItem.setAttribute("class", "expenses-item");
    // Set row HTML with expense data (matches thead)
    expensesItem.innerHTML = `
      <td>${expense.id}</td>
      <td>N ${expense.amount.toFixed(2)}</td>
      <td>${expense.description}</td>
      <td>${expense.category}</td>
      <td>${expense.date}</td>
      <td>
      <button data-id="${expense.id}" class='edit-btn btn-ty1'><i class="fa-solid fa-pen"></i></button>
      <button data-id="${expense.id}" class='delete-btn'><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    // Append row to <tbody>
    expenseList.appendChild(expensesItem);
  });
};

// Save expenses to localStorage
const saveExpenses = (expenses) => {
  try {
    // Convert expenses to JSON and save to "expenses" key
    localStorage.setItem("expenses", JSON.stringify(expenses));
  } catch (error) {
    // Log error if saving fails (e.g., localStorage disabled)
    console.error("Failed to save expenses to localStorage:", error);
    // Show user-friendly error
    showError("Could not save expenses");
  }
};

// Handle form submission
const expenseForm = document.querySelector("#expense-form");
if (expenseForm) {
  // Add submit listener
  expenseForm.addEventListener("submit", (event) => {
    // Prevent page reload
    event.preventDefault();
    // Select input elements
    const amountInput = document.querySelector("#amount-input");
    const descriptionInput = document.querySelector("#description-input"); // Fixed typo
    const categoryInput = document.querySelector("#category-input");
    // Check if inputs exist
    if (!amountInput || !descriptionInput || !categoryInput) {
      // Show error if inputs missing
      showError("Form inputs not found");
      return;
    }
    // Get input values
    const newExpense = {
      amount: amountInput.valueAsNumber,
      description: descriptionInput.value,
      category: categoryInput.value,
    };
    // Add expense
    const updatedExpenses = addExpense(expenses, newExpense);
    // Check if expense was added
    if (updatedExpenses !== expenses) {
      // Update global expenses
      expenses = updatedExpenses;
      // Save to localStorage
      saveExpenses(expenses);
      // Update table and summary
      renderExpenses(expenses);
      renderSummary(calculateSummary(expenses));
      
      // Clear inputs
      amountInput.value = "";
      descriptionInput.value = "";
      // Keep category as-is
    } else {
      // Show error for invalid input
      showError("Please enter a valid amount, description, and category.");
    }
  });
} else {
  // Log error if form not found
  console.error("Form #expense-form not found");
  // Show user-friendly error
  showError("Form not found");
}

// Handle delete button clicks
const table = document.querySelector("#expense-table");
if (table) {
  // Add click listener for event delegation
  table.addEventListener("click", (e) => {
    // Check if clicked element is a button
    const deleteButton = e.target.closest('.delete-btn');
    if (deleteButton) {
      // Get expense ID
      const id = Number(deleteButton.dataset.id);
      console.log('Delete id:', id, 'Target:', e.target)
      // Delete expense
      expenses = deleteExpense(expenses, id);
      // Save to localStorage
      saveExpenses(expenses);
      // Update table and summary
      renderExpenses(expenses);
      renderSummary(calculateSummary(expenses));
    }
  });
} else {
  // Log error if table not found
  console.error("Table #expense-table not found");
  // Show user-friendly error
  showError("Table not found");
}

// Display error message
const showError = (message) => {
  // Select error message element
  const errorEl = document.getElementById("error-message");
  // Check if element exists
  if (errorEl) {
    // Set error message text
    errorEl.textContent = message;
    // Show error by removing hidden class
    errorEl.classList.remove("hidden");
    // Hide error after 3 seconds
    setTimeout(() => {
      // Check if element still exists before modifying
      if (errorEl) {
        errorEl.classList.add("hidden");
      }
    }, 3000);
  } else {
    // Fallback to alert if element missing
    console.error("Error element #error-message not found");
    alert(message);
  }
};

// Initial render to display saved expenses
// Check if DOM elements exist
if (
  document.getElementById("expense-data") &&
  document.querySelector("#summary p") &&
  document.querySelector("#category-totals")
) {
  // Render table with saved expenses
  renderExpenses(expenses);
  // Render summary with calculated totals
  renderSummary(calculateSummary(expenses));
} else {
  // Show error if elements missing
  showError("Required DOM elements not found");
}




// handle Edit button clicks
const initEditFeature = () => {
  const editForm = document.querySelector('#edit-expense-form');
  if (!editForm) {
    showError('Edit form not found');
    return;
  }

  // Handle edit button clicks
  const table = document.querySelector('#expense-table');
  if (table) {
    table.addEventListener('click', (e) => {
      // Check if clicked element is .edit-btn or inside it (e.g., <i>)
      const editButton = e.target.closest('.edit-btn');
      if (editButton) {
        const  id = Number(editButton.dataset.id);
        const expense = expenses.find((exp) => exp.id === id);
        if (expense) {
          // Populate form
          document.querySelector('#edit-amount-input').value = expense.amount;
          document.querySelector('#edit-description-input').value = expense.description;
          document.querySelector('#edit-category-input').value = expense.category;
          editForm.dataset.id = id; // Store ID in form
          editForm.classList.remove('hidden');
          expenseForm.classList.add('hidden');
        } else {
          showError('Expense not found')
        }
      }
    });
  }


  // Handle for submission
  editForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const updatedExpense = {
      id: Number(editForm.dataset.id),
      amount: document.querySelector('#edit-amount-input').valueAsNumber,
      description: document.querySelector('#edit-description-input').value,
      category: document.querySelector('#edit-category-input').value,
    };

    const newExpenses = updateExpense(expenses, updatedExpense)
    if (newExpenses !== expenses) {
      expenses = newExpenses;
      saveExpenses(expenses);
      renderExpenses(expenses);
      renderSummary(calculateSummary(expenses));
      showError('Expense updated');
      editForm.classList.add('hidden'); // Hide form
      expenseForm.classList.remove('hidden');
    } else {
      showError('Please enter a valid amount, description, and category')
    }
  });

  // Cancel button click
  const cancelButton = document.querySelector('#cancel-btn');
  if (cancelButton) {
    cancelButton.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Edit button clicked')
      editForm.classList.add('hidden');
      expenseForm.classList.remove('hidden');

      // Reset form
      const amountInput = document.querySelector('#edit-amount-input');
      const descriptionInput = document.querySelector('#edit-amount-input');
      const categoryInput = document.querySelector('#edit-amount-input');
      if (amountInput && descriptionInput && categoryInput) {
        amountInput.value = '';
        descriptionInput.value = '';
        categoryInput.value = 'Food';
      }
    });
  } else {
    console.warn('cancel button not found')
  }
};


// Filter expense by category (pure function)
const filterExpenses = (expenses, category) => {
  if (category === 'All') return expenses;
  return expenses.filter((expense )=> expense.category === category);
}

// Render filter expenses and summary
const renderFilteredExpenses = (category) => {
  const filteredExpenses = filterExpenses(expenses, category);

  if (!filteredExpenses) return expenses;
  renderExpenses(filteredExpenses);
  renderSummary(calculateSummary(filteredExpenses));
}

// Initialized filter 
const initFilter = () => {
  // Holds value selected
  const filterSelect = document.querySelector('#filter-category'); 
  const ResetFilterSelect = document.querySelector('#reset-filter-btn');
  if (!filterSelect){
    showError('Selection not found');
    return;
  }
  filterSelect.addEventListener('change', (e) => {
    renderFilteredExpenses(e.target.value);
  });

  // Reset filter
  if (ResetFilterSelect) {
    ResetFilterSelect.addEventListener('click', (e) => {
      e.preventDefault();
      filterSelect.value = 'All';
      renderFilteredExpenses('All');
    })
  } else {
    showError('Something went wrong!')
  }
};

// Initialize filter feature after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  initEditFeature();
  initFilter();
})
