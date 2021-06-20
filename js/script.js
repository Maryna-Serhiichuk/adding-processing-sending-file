let type =['xls', 'xlsx'];

let sizeFile = 10000000; // 10 мб

let input = document.querySelector('#input-file');
let label = document.querySelector('.input-file');
let labelVal = label.innerHTML;

let fileData;

label.addEventListener('dragover', (event)=>{
	event.preventDefault();
});
label.addEventListener('drop', (event)=>{
	event.preventDefault();
	fileData = event.dataTransfer;
	validateFile();
});

let textBlock = document.querySelector('.input-text');

let wrap = document.querySelector('.wrapper');

let table = document.querySelector('.info table');

input.addEventListener('change', mechanicAdd, false);

function mechanicAdd(){
	fileData = this;
	validateFile();
}

function validateFile(e){
	// console.log(this.files);
	
	let nameFile = fileData.files[0].name;

	let validateType = nameFile.substring(nameFile.lastIndexOf(".")+1,nameFile.length).toLowerCase();

	if(fileData.files && fileData.files.length == 1){
		table.textContent = '';

		for(let i = 0; i < type.length; i++){
			if(type[i] == validateType){
				if(fileData.files[0].size > sizeFile){
					validateText(`Допустимый размер файла 10Мб, выберите другой файл`, false);
				} else {
					validateText(`Файл - "${nameFile}"`, false);
					handleFile(fileData);
				}
			} else {
				validateText(`Недопустимый тип файла ".${validateType}", выберите другой файл`, true);
			}
		}
	} else {
		validateText('Перетащите сюда файл или нажмите чтобы выбрать', false);
	}
}

function handleFile(e) {
	// console.log(e)
	var files = e.files, f = files[0];
	var reader = new FileReader();

	reader.onload = function(e) {

		var data = new Uint8Array(e.target.result);
		var workbook = XLSX.read(data, {type: 'array'});

		var first_sheet_name = workbook.SheetNames[0];

		var worksheet = workbook.Sheets[first_sheet_name];
		XLSX.utils.sheet_to_json(worksheet);

		let array = XLSX.utils.sheet_to_json(worksheet);
		getInfo(array);
		sendRequest(array);

	};
	reader.readAsArrayBuffer(f);

}

function sendRequest(data){

	let xhttp = new XMLHttpRequest();
	xhttp.open('POST', 'http://193.243.158.230:4500/api/import', true);

	xhttp.setRequestHeader("Authorization", "test-task");

	xhttp.onreadystatechange = () => {

		if(xhttp.readyState == 4 && xhttp.status == 200){
			resultArray : data
		}
	}
	xhttp.send( { resultArray : data } );
}

function validateText(message, bool){
	validateColor(bool);
	textBlock.textContent = message;
}
function validateColor(bool){
	if(bool == true){
		wrap.classList.add('error');
	} else {
		wrap.classList.remove('error');
	}
}

function getInfo(array){

	let dataObj = Object.keys(array[0]);;
	let dataArr = Object.values(array).map(v => Object.values(v));

	let title = document.createElement('tr');
	title.classList.add('title');

	for(let i = 0; i < dataObj.length; i++){
		table.append(title);

		title.innerHTML += addTitle(dataObj[i]);

	}

	for(let i = 0; i < dataArr.length; i++){

		let tr = document.createElement('tr');
		table.append(tr);

		for(let j = 0; j < dataArr[i].length; j++){
			tr.innerHTML += addText(dataArr[i][j]);
		}
	}

}

function addTitle(title){
	return `<td class="table__title table__item">${title}</td>`;
}

function addText(item){
	return `<td class="table__text table__item">${item}</td>`;
}