const tableHeaders = ["Author", "Commit", "Message"];
const requestDataButton = document.getElementById("submit");
const table = document.querySelector("table");
let commits = {};
let paginationLinks = [];

requestDataButton.addEventListener("click", function (event) {
  const userName = document.forms.wis.userName.value;
  const repositoryName = document.forms.wis.repositoryName.value;
  event.preventDefault();
  renderData(userName, repositoryName);
});

async function renderData(userName, repositoryName, NEWurl) {
  clearResults();
  
  commits = await getCommits(userName, repositoryName, NEWurl);
  if (!commits) {
    return renderBadRequestMessage();
  }

  renderTableHead(table);
  renderTableCells(table, commits);
  renderPaginationButtons(paginationLinks);
  // Add listeners to each table row
}

async function getCommits(userName, repositoryName, NEWurl) {
  const urlBoilerplate = "https://api.github.com/search/commits?q=";
  /* The API needs another search parameter in addition to repository, 
  so author-date was used for that reason */
  let url = `${urlBoilerplate}repo:${userName}/${repositoryName}` +
    `+author-date:>2000-01-01`;
  const headers = { "Accept": "application/vnd.github.cloak-preview" };

  // TEMP
  if (NEWurl) {
    url = NEWurl;
  }

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

function renderPaginationButtons(paginationLinks) {
  paginationLinks.forEach(link => {
    const paginationButton = document.createElement("button");
    paginationButton.textContent = link.title;
    paginationButton.addEventListener("click", e => renderData(null, null, link.url));
    table.appendChild(paginationButton);
    })
};


function clearResults() {
  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }
}




function renderTableHead(table) {
  let thead = table.createTHead();
  let row = thead.insertRow();

  for (let i = 0; i < tableHeaders.length; i++) {
    let th = document.createElement("th");
    let text = document.createTextNode(tableHeaders[i]);
    th.appendChild(text);
    row.appendChild(th);
  }
}

function renderTableCells(table, commits) {
  for (commit of commits.items) {
    let row, cell, text;
    renderFirstCell();
    renderSecondCell();
    renderThirdCell();
  }
  addlisteners();
  function renderFirstCell() {
    row = table.insertRow();
    cell = row.insertCell();
    text = document.createTextNode(commit.commit.author.name);
    cell.appendChild(text);
  }

  function renderSecondCell() {
    cell = row.insertCell();
    text = document.createTextNode(commit.sha);
    cell.appendChild(text);
  }

  function renderThirdCell() {
    cell = row.insertCell();
    text = document.createTextNode(
      `${commit.commit.message.substring(0, 80)}...`
    );
    cell.appendChild(text);
  }
}

function renderBadRequestMessage() {
  let row = table.insertRow();
  let cell = row.insertCell();
  let text = document.createTextNode('Request returned no data');
  cell.appendChild(text);
}

function addlisteners() {
  let newrow = document.getElementsByTagName('tr');
  [].forEach.call(newrow, function (elem) {
    elem.addEventListener('click', function (el) {
      const sha = this.children[1].innerHTML;
      for (commit of commits.items) {
        if (sha == commit.sha) {
          showCover();
          function showCover() {
            let coverDiv = document.createElement('div');
            coverDiv.id = 'cover-div';
            let url = `https://api.github.com/repos/${commit.repository.full_name}/commits/${sha}`;
            fetch(url).then(function (response) {
              return response.text().then(function (text) {
                let content = document.createTextNode(text);
                coverDiv.appendChild(content);
                document.body.appendChild(coverDiv);
              })
            });
            coverDiv.addEventListener("click", hideCover);
          }
        }
      }
    })
  });
}

function hideCover() {
  document.body.removeChild(document.getElementById('cover-div'));
}