const tableHeaders = ["Author", "Commit", "Message"];
const requestDataButton = document.getElementById("submit");
const table = document.querySelector("table");
let commits = {};

requestDataButton.addEventListener("click", function (event) {
  const userName = document.forms.wis.userName.value;
  const repositoryName = document.forms.wis.repositoryName.value;
  event.preventDefault();
  renderData(userName, repositoryName);
});

async function renderData(userName, repositoryName) {
  clearResults();

  commits = await getCommits(userName, repositoryName);
  if (!commits) {
    return handleBadRequest();
  }

  renderTableHead(table);
  renderTableCells(table, commits);
  // Add listeners to each table row
}

function clearResults() {
  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }
}

async function getCommits(userName, repositoryName) {
  const urlBoilerplate = "https://api.github.com/search/commits?q=";
  /* The API needs another search parameter in addition to repository, 
  so author-date was used for that reason */
  const url = `${urlBoilerplate}repo:${userName}/${repositoryName}` +
    `+author-date:>2000-01-01`;
  const headers = { "Accept": "application/vnd.github.cloak-preview" };

  const response = await fetch(url, { "headers": headers })
  if (!response.ok) { return false }
  const result = await response.json();
  return result;
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
    text = document.createTextNode(commit.commit.message.substring(0, 80));
    cell.appendChild(text);
  }
}

function handleBadRequest() {
  let row = table.insertRow();
  let cell = row.insertCell();
  let text = document.createTextNode('Request returned no data');
  cell.appendChild(text);
}

function handleTableRowClick() {
  alert("click");
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
            let url = `https://api.github.com/repos/skrikl/ljs/commits/${sha}`;
            fetch(url).then(function (response) {
              return response.text().then(function (text) {
                let content = document.createTextNode(text);
                coverDiv.appendChild(content);
                // coverDiv.innerHTML = JSON.stringify(text, null, "\t");
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
//
/* function getData(pageId) {
  console.log(pageId);
  var myRequest = new Request(pageId + '.txt');
  fetch(myRequest).then(function(response) {
    return response.text().then(function(text) {
      myArticle.innerHTML = text;
    });
  });
} */
//
function hideCover() {
  document.body.removeChild(document.getElementById('cover-div'));
}