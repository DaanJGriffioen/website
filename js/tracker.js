// import { mysql } from 'mysql';

function  getSelectValue(id) {
  let element = document.getElementById(String(id));
  if(element.selectedIndex == 0){
      document.getElementById("alert-track").innerHTML = "Dropdown niet goed ingevuld!";
      return null;
  }
  return element.options[element.selectedIndex].text;
}

function dropdown(type){
  var array = [];
  var elements = "";
  // Just for testing
  /*********************/
  if(type === 0){
    array = ['Daan', 'Thomas', 'Noah'];
    elements = "<option value =\"\">Kies je naam</option>\n";
  }
  if(type === 1){
    array = ['Bench', 'Touwen', 'LegPress', 'Pec Fly'];
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

function sendSets(){
  console.log("LOADEDEDED");
  console.log("1 " + document.getElementById("gewicht").value);
  console.log("2 " + getSelectValue('exc-dd'));
  console.log("3 " + document.getElementById("reps").value);
  console.log("4 " + document.getElementById("sets").value);
  console.log("5 " + getSelectValue("naam-dd"));
  
  let weight = document.getElementById("gewicht").value;
  let repetitions =  document.getElementById("reps").value
  let sets =  document.getElementById("sets").value
  let excercise = getSelectValue("exc-dd")



}