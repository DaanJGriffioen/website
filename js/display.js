// Fetch data from the server
async function fetchData(name) {
  try {
      const response = await fetch(`/api/data/${name}`); // Assumes the server exposes a route at /api/data
      if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
      }
      const data = await response.json();
      console.log(data);
      displayData(data, name);
  } catch (error) {
      console.error('Failed to fetch data:', error);
  }
}

// Display data on the page
function displayData(data, name) {
  const container = document.getElementById(`table-${name}`);
  container.innerHTML = ''; // Clear existing content
  const table = document.createElement('table');
  table.className = "fl-table";
  
  var bodyRow = table.insertRow(0);
  var header = table.createTHead();
  var headRow = header.insertRow(0);


  var headCell;
  var bodyCell;

  var first = true;
  data.forEach(item => {
    for(const [key, value] of Object.entries(item)){
      if(first){
        headCell = headRow.insertCell(-1);
        headCell.outerHTML = '<th>'+ JSON.stringify(key).substring(1, key.length+1) + '</th>';
      }
      bodyCell = bodyRow.insertCell(-1);
      bodyCell.innerHTML = JSON.stringify(value);
    }
    first = false;
    bodyRow = table.insertRow(-1)
  });

  container.appendChild(table);
}

// Initialize the script
window.onload = () => {
  fetchData('daan');
  fetchData('thomas');
  fetchData('noah');
};
