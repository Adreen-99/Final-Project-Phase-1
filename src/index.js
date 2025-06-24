// DOM elements
const themeBtn = document.getElementById('theme-btn');
const addBtn = document.getElementById('add-btn');
const searchInput = document.getElementById('search');
const formContainer = document.getElementById('form-container');
const entryForm = document.getElementById('entry-form');
const entriesContainer = document.getElementById('entries');
const titleInput = document.getElementById('title');
const dateInput = document.getElementById('date');
const contentInput = document.getElementById('content');

// Store entries
let entries = [];

// Set today's date as default
dateInput.valueAsDate = new Date();

// Event listeners
themeBtn.addEventListener('click', toggleDarkMode);
addBtn.addEventListener('click', showForm);
searchInput.addEventListener('input', searchEntries);
entryForm.addEventListener('submit', saveEntry);
document.getElementById('cancel-btn').addEventListener('click', hideForm);

// Load entries when page loads
window.addEventListener('load', loadEntries);

// Toggle dark/light mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    themeBtn.textContent = document.body.classList.contains('dark-mode') 
        ? 'Light Mode' 
        : 'Dark Mode';
}

// Show form to add new entry
function showForm() {
    formContainer.style.display = 'block';
    titleInput.value = '';
    dateInput.valueAsDate = new Date();
    contentInput.value = '';
}

// Hide form
function hideForm() {
    formContainer.style.display = 'none';
}

// Search entries
function searchEntries() {
    const searchText = searchInput.value.toLowerCase();
    const filtered = entries.filter(entry => 
        entry.title.toLowerCase().includes(searchText) || 
        entry.content.toLowerCase().includes(searchText)
    );
    displayEntries(filtered);
}

// Load entries from server
function loadEntries() {
    fetch('http://localhost:3000/entries')
        .then(response => response.json())
        .then(data => {
            entries = data;
            displayEntries(); // Display entries after loading
        })
        .catch(error => {
            console.error('Error loading entries:', error);
            entriesContainer.innerHTML = '<p>Could not load entries. Please try again.</p>';
        });
}

// Display entries on page
function displayEntries(entriesToShow) {
    entriesToShow = entriesToShow || entries;
    
    if (entriesToShow.length === 0) {
        entriesContainer.innerHTML = '<p>No entries found.</p>';
        return;
    }

    let entriesHTML = '';
    entriesToShow.forEach(entry => {
        entriesHTML += `
            <div class="entry-card">
                <h3>${entry.title}</h3>
                <div class="entry-date">${formatDate(entry.date)}</div>
                <p>${entry.content}</p>
                <div class="entry-actions">
                    <button class="edit-btn" data-id="${entry.id}">Edit</button>
                    <button class="delete-btn" data-id="${entry.id}">Delete</button>
                </div>
            </div>
        `;
    });

    entriesContainer.innerHTML = entriesHTML;

    // Add event listeners to buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editEntry(btn.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteEntry(btn.dataset.id));
    });
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Save new entry
function saveEntry(event) {
    event.preventDefault();
    
    const newEntry = {
        title: titleInput.value,
        date: dateInput.value,
        content: contentInput.value
    };

    fetch('http://localhost:3000/entries', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEntry)
    })
    .then(response => response.json())
    .then(data => {
        // Add new entry to our array
        entries.push(data);
        // Refresh the display with all entries including the new one
        displayEntries();
        hideForm();
    })
    .catch(error => {
        console.error('Error saving entry:', error);
        alert('Could not save the entry. Please try again.');
    });
}

// Edit entry
function editEntry(id) {
    const entry = entries.find(entry => entry.id == id);
    if (!entry) return;
    
    titleInput.value = entry.title;
    dateInput.value = entry.date;
    contentInput.value = entry.content;
    formContainer.style.display = 'block';

    // Update form submit handler for editing
    entryForm.onsubmit = function(e) {
        e.preventDefault();
        
        const updatedEntry = {
            title: titleInput.value,
            date: dateInput.value,
            content: contentInput.value
        };

        fetch(`http://localhost:3000/entries/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedEntry)
        })
        .then(() => {
            // Reload all entries from server to ensure we have latest data
            loadEntries();
            hideForm();
            // Reset form handler back to create new entries
            entryForm.onsubmit = saveEntry;
        })
        .catch(error => {
            console.error('Error updating entry:', error);
            alert('Could not update the entry. Please try again.');
        });
    };
}

// Delete entry
function deleteEntry(id) {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    fetch(`http://localhost:3000/entries/${id}`, {
        method: 'DELETE'
    })
    .then(() => {
        // Remove entry from our array
        entries = entries.filter(entry => entry.id != id);
        // Refresh the display
        displayEntries();
    })
    .catch(error => {
        console.error('Error deleting entry:', error);
        alert('Could not delete the entry. Please try again.');
    });
}