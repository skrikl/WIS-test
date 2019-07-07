const tableHeaders = ["Author", "Commit", "Message"];
const requestDataButton = document.querySelector(".submitButton");
const table = document.querySelector("table");
const paginationButtonsBar = document.querySelector(".paginationButtonsBar");
let commits = {};
let paginationLinks = [];

requestDataButton.addEventListener("click", function (event) {
  const userName = document.forms.wis.userName.value;
  const repositoryName = document.forms.wis.repositoryName.value;
  /* The API needs another search parameter in addition to repository, 
  so author-date was used for that reason */
  const requestDataUrl = `https://api.github.com/search/commits?q=repo:` +
                     `${userName}/${repositoryName}+author-date:>2000-01-01`;
  
  event.preventDefault();
  renderDataByUrl(requestDataUrl);
});

async function renderDataByUrl(url) {
  clearResults();
  
  commits = await getCommits(url);
  if (!commits) {
    return renderBadRequestMessage();
  }

  renderResultTableHeader(table);
  renderResultTableRows(table, commits);
  renderPaginationButtons(paginationLinks);
}

async function getCommits(url) {
  const headers = { "Accept": "application/vnd.github.cloak-preview" };

  const response = await fetch(url, { "headers": headers })
  if (!response.ok) { return false }

  getPaginationLinks(response);
  const result = await response.json();
  return result;
}

function getPaginationLinks(response) {
  const link = response.headers.get("link");
  if (!link) { return false }

  const links = link.split(",");
  paginationLinks = links.map(a => {
    return {
      url: a.split(";")[0].replace("<", "").replace(">", ""),
      title: a.split(";")[1],
    }
  })
  return true;
}

function renderPaginationButtons(links) {
  links.forEach(link => {
    const paginationButton = document.createElement("button");
    paginationButton.textContent = link.title;
    paginationButton.addEventListener("click", () => {
      renderDataByUrl(link.url)
    });
    paginationButtonsBar.appendChild(paginationButton);
    })
    paginationLinks = [];
  }

function clearResults() {
  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }
  while (paginationButtonsBar.firstChild) {
    paginationButtonsBar.removeChild(paginationButtonsBar.firstChild);
  }
}

function renderResultTableHeader(table) {
  let thead = table.createTHead();
  let row = thead.insertRow();

  for (let i = 0; i < tableHeaders.length; i++) {
    let th = document.createElement("th");
    let text = document.createTextNode(tableHeaders[i]);
    th.appendChild(text);
    th.classList.add(tableHeaders[i]);
    row.appendChild(th);
  }
  table.classList.add("table");
  row.classList.add("header");
}

function renderResultTableRows(table, commits) {
  for (commit of commits.items) {
    renderFirstCell();
    renderSecondCell();
    renderThirdCell();
  }
  addTableRowListeners();

  function renderFirstCell() {
    row = table.insertRow();
    row.classList.add("tableRow");
    cell = row.insertCell();
    cell.classList.add(tableHeaders[0]);
    text = document.createTextNode(commit.commit.author.name.substring(0,30));
    cell.appendChild(text);
  }

  function renderSecondCell() {
    cell = row.insertCell();
    cell.classList.add(tableHeaders[1]);
    text = document.createTextNode(commit.sha);
    cell.appendChild(text);
  }

  function renderThirdCell() {
    const 
    cell = row.insertCell();
    cell.classList.add(tableHeaders[2]);
    text = document.createTextNode(
      `${commit.commit.message.substring(0, 120)}...`
    );
    cell.appendChild(text);
  }
}

function renderBadRequestMessage() {
  let text = document.createTextNode('Request returned no data');
  paginationButtonsBar.appendChild(text);
}

function addTableRowListeners() {
  let newrow = document.getElementsByTagName('tr');
  [].forEach.call(newrow, function (elem) {
    elem.addEventListener('click', function (el) {
      const sha = this.children[1].innerHTML;
      for (commit of commits.items) {
        if (sha == commit.sha) renderCommitDetailsModal(commit, sha);
      }
    });
  });
}

function renderCommitDetailsModal(commit, sha) {
  let modalDiv = document.createElement('div');
  let url = `https://api.github.com/repos/${commit.repository.full_name}` + 
            `/commits/${sha}`;
  fetch(url).then(function (response) {
    return response.text().then(function (text) {
      let content = document.createTextNode(text);
      modalDiv.appendChild(content);
      modalDiv.classList.add("modalDiv");
      table.appendChild(modalDiv);
    })
  });
  modalDiv.addEventListener("click", hideModal);
}

function hideModal() {
  table.removeChild(document.querySelector('.modalDiv'));
}