function compile(sourceCode) {
  analyzer = new SourceAnalyzer();
  return analyzer.getAnalysis();
}

//Formats the data in an array of 1024 strings into an 8x128 table
//then inserts the HTML code into element
function fillTable(table, data){
  let text = "<tr>";
  for(let i=0; i<1024; i++){
    text += "<td>" + i + "</td>";
    text += "<td>" + data[i] + "</td>";
    if(i%8 === 7)
      text += "</tr><tr>";  //New row
  }
  text += "</tr>";
  table.innerHTML = text;
}

//Converts input to ASCII binary and populates
//the source code part of the External Storage
function toBinary(sourceCode, fillTable){
  const table = document.getElementById('external-source');
  const externalStorage = new Array(1024);
  for(let i=0; i<sourceCode.length; i++){
    binaryChar = sourceCode.charCodeAt(i).toString(2);
    externalStorage[i] = binaryChar.padStart(8,"0");
  }
  externalStorage.fill("00000000", sourceCode.length);
  fillTable(table, externalStorage);
}

$(document).ready(function() {
  $('.button-compile').click(function(){
    const input = $('.editor-textbox').first().val();
    const output = compile(input);
    $('.output').first().text(output);
    toBinary(input,fillTable);
  })
})
