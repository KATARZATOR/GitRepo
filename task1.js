const searchInput = document.getElementById('search');
const autocompleteList = document.getElementById('autocomplete-list');
const repoList = document.getElementById('repo-list');
const repoListContainer = document.getElementById('repo-list-container');
let debounceTimeout;

function debounce(func, delay) {
    return function(...args) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => func.apply(this, args), delay);
    };
}

async function fetchRepositories(query) {
    if (!query.trim()) return;

    const response = await fetch(`https://api.github.com/search/repositories?q=${query}`);
    const data = await response.json();

    return data.items.slice(0, 5); 
}

function updateAutocompleteList(repositories) {
    autocompleteList.innerHTML = ''; 
    if (repositories.length === 0) {
        autocompleteList.classList.add('hidden');
        return;
    }

    repositories.forEach(repo => {
        const listItem = document.createElement('li');
        listItem.classList.add('autocomplete-item');
        listItem.textContent = repo.name;
        listItem.addEventListener('click', () => {
            addRepoToList(repo);
            searchInput.value = ''; 
            autocompleteList.classList.add('hidden'); 
        });
        autocompleteList.appendChild(listItem);
    });

    autocompleteList.classList.remove('hidden');
}

function addRepoToList(repo) {
    const listItem = document.createElement('li');
    listItem.classList.add('repo-item');
    listItem.innerHTML = `
        <div>
            <span>Name: ${repo.name}</span>
            <span>Owner: ${repo.owner.login}</span>
            <span>Stars: ${repo.stargazers_count}</span>
        </div>
        <button class="remove-btn"></button> 
    `;

    const removeBtn = listItem.querySelector('.remove-btn');
    removeBtn.addEventListener('click', () => {
        listItem.remove(); 
        checkIfRepoListEmpty(); 
        removeBtn.removeEventListener('click', () => {}); 
    });

    repoList.appendChild(listItem);
    repoListContainer.style.display = 'block'; 
}

function checkIfRepoListEmpty() {
    if (repoList.children.length === 0) {
        repoListContainer.style.display = 'none';
    }
}

searchInput.addEventListener('input', debounce(async (event) => {
    const query = event.target.value;

    if (!query.trim()) {
        autocompleteList.classList.add('hidden');
        return;
    }

    const repositories = await fetchRepositories(query);
    updateAutocompleteList(repositories);
}, 400));

document.addEventListener('click', (e) => {
    if (!e.target.closest('#search') && !e.target.closest('#autocomplete-list')) {
        autocompleteList.classList.add('hidden');
    }
});