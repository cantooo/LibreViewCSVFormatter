function controllaFile() {
	let inputFile = document.querySelector("#inputFile");

	if (inputFile.files.length == 0) {
		inputFile.style.borderColor = "red";
		return false;
	}
	else {
		let file = inputFile.files[0];

		if (!file.name.toLowerCase().endsWith(".csv")) {
			inputFile.style.borderColor = "red";
			return false;
		} else {
			inputFile.style.borderColor = "";
			return true;
		}
	}
}

function controllaInput() {
	let corretto = true;
	let file, date, time;

	const inputFile = document.querySelector("#inputFile");
	if (inputFile.files.length == 0) {
		inputFile.style.borderColor = "red";
		corretto = false;
	} else {
		file = inputFile.files[0];

		if (!file.name.toLowerCase().endsWith(".csv")) {
			inputFile.style.borderColor = "red";
			corretto = false;
		}
	}

	const inputDate = document.querySelector("#inputDate");
	if (inputDate.value == "") {
		inputDate.style.borderColor = "red";
		corretto = false;
	} else {
		date = inputDate.value;
	}

	const inputTime = document.querySelector("#inputTime");
	if (inputTime.value == "") {
		inputTime.style.borderColor = "red";
		corretto = false;
	} else {
		time = inputTime.value;
	}

	if (corretto) CSVFormat(file, new Date(date + "T" + time));
}

/**
 * This function eliminates unnnecessary rows and columns from the CSV file
 * and eliminates all the rows until the given datetime
 * @param {File} f LibreView CSV File
 * @param {Date} d Date Time
 */
function CSVFormat(f, d) {
	let reader = new FileReader();
	let data;

	// Lettura del file
	reader.readAsText(f);
	reader.addEventListener("load", function (e) {
		let text = e.target.result;

		// Divisione in righe
		data = text.split("\r\n");

		// Eliminazione prima e ultima riga
		data.splice(0, 1);
		data.splice(data.length - 1);

		// Divisione in colonne
		data[0] = data[0].split(",");

		// Eliminazione colonne non necessarie nella prima riga
		data[0].splice(7, 1);
		data[0].splice(12, 1);
		data[0].splice(15);
		data[0].splice(6, 8);
		data[0].splice(3, 1);
		data[0].splice(0, 2);

		// Parsing del documento
		for (let i = 1; i < data.length; i++) {
			// Divisione in colonne
			data[i] = data[i].split(",");

			// Eliminazione colonne non necessarie
			data[i].splice(15);
			data[i].splice(6, 8);
			data[i].splice(3, 1);
			data[i].splice(0, 2);

			// Formattazione della data in oggetto Date
			let date = data[i][0];
			data[i][0] = new Date(date.substring(6, 10) + "-" + date.substring(3, 5) + "-" + date.substring(0, 2) + "T" + date.substring(11));
		}

		// Ordinamento per data e ora, intestazione come prima riga
		data.sort(function (a, b) {
			if (typeof a[0] == "string") return -1;
			if (typeof b[0] == "string") return 1;
			if (a[0].getTime() < b[0].getTime()) return -1;
			return 1;
		});

		// Eliminazione righe non necessarie in base alla data fornita
		for (let i = 1; i < data.length; i++) {
			if (data[i][0].getTime() <= d.getTime()) {
				data.splice(i, 1);
				i--;
			}
		}

		/* Formattazione della data in stringa in un formato compatibile con
		 * Health CSV Importer */
		data.forEach((e, i) => {
			if (i == 0) return;
			e[0] = "".concat(e[0].getDate(), "/", e[0].getMonth() + 1, "/",
				e[0].getFullYear(), " ", e[0].getHours(), ":",
				e[0].getMinutes());
		});

		// Unione delle colonne
		data.forEach((e, i) => {
			data[i] = e.join();
		});

		// Unione delle righe
		data = data.join("\n");

		// Creazione file e download
		let file = new File([new Blob([data], { type: 'text/plain' })], "LibreViewFormatted.csv", { type: "text/plain" });
		let link = document.createElement("a");
		link.download = file.name;
		link.href = URL.createObjectURL(file);
		link.click();

		console.log(file);
	});
}