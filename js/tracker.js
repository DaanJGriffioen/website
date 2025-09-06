function getSelectValue(id) {
  let element = document.getElementById(String(id));
  if(element.selectedIndex == 0){
      document.getElementById("alert-track");
      return null;
  }
  return element.options[element.selectedIndex].text;
}

async function fetchData() {
  try {
    const response = await fetch(`/api/excercise`); // Assumes the server exposes a route at /api/data
    if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
    }
    const data = await response.json();
    return (data);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}

async function dropdown(type){
  var array = [];
  var elements = "";
  // Just for testing
  /*********************/
  if(type === 0){
    array = ['Daan', 'Thomas', 'Noah'];
    elements = "<option value =\"\">Kies je naam</option>\n";
  }
  if(type === 1){
    array = await fetchData();
    var abc = [];
    for(var i = 0; i < array.length; i+=1){
      abc.push(Object.values(array[i]).toString());
    }
    console.log(abc);
    array = abc;

    elements = "<option value =\"\">Kies je oefening</option>\n";
  }

  /*********************/
  for (let index = 0; index < array.length; index++) {
    elements += `<option value ="${index}">${array[index]}</option>\n`;
  }
  if(type === 0)
    document.getElementById('naam-dd').innerHTML = elements;
  if(type === 1)
    document.getElementById('exc-dd').innerHTML = elements;
}