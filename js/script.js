// Access OpenWeather API
var APIkey = "3803e9deb4e4613335fd77eb16454bc1";
var today = moment().format("MMM Do YYYY");

// instantiate city history
var searchHistoryList = [];

// Request OpenWeather API based on user input
function currentWeather(cityInput) {
	// make AJAX api call
	var queryURL =
		"https://api.openweathermap.org/data/2.5/weather?q=" +
		cityInput +
		"&units=imperial&appid=" +
		APIkey;

	// initialize AJAX call for OpenWeather
	$.ajax({
		url: queryURL,
		method: "GET",
	}).then(function (weatherResponse) {
		console.log(weatherResponse);

		// Traverse DOM to show sections and clear #cityDetail
		$("#weatherContent").removeClass("hide");
		$("#cityDetail").empty();

		// Variables for Icons
		var iconCode = weatherResponse.weather[0].icon;
		var iconURL = `https://openweathermap.org/img/wn/${iconCode}.png`;

		// Using template literals to populate the city searched for.
		var currentCity = $(`
		<h4 id="cityDate" class="pb-n3">${weatherResponse.name} • ${today} <img src="${iconURL}" alt="${weatherResponse.weather[0].description}" /></h4>
		<p id="current-temp">Temperature: <strong>${weatherResponse.main.temp} °F </strong></p>
		<p id="current-wind">Wind Speed: <strong> ${weatherResponse.wind.speed} MPH </strong></p>
		<p id="current-humidity">Humidity: <strong>${weatherResponse.main.humidity}\%</strong></p>
		
	`);

		// Append city weather information to html
		$("#cityDetail").append(currentCity);

		// Grab lat lon coords
		var lat = weatherResponse.coord.lat;
		var lon = weatherResponse.coord.lon;

		// Also grab URL for UV index by modifying URL with lat lon
		var UVurl =
			"https://api.openweathermap.org/data/2.5/uvi?&lat=" +
			lat +
			"&lon=" +
			lon +
			"&appid=" +
			APIkey;

		// initialize AJAX call for UV Index
		$.ajax({
			url: UVurl,
			method: "GET",
		}).then(function (uvResponse) {
			// Use template literal for UVI response
			var uvIndex = uvResponse.value;
			var uvIndexP = $(`
			<p>UV-Index: <span id="current-index" class="badge badge-info p-2">${uvIndex}</span></p>
			`);

			// append UVi to html
			$("#cityDetail").append(uvIndexP);

			// run weeklyforcast function here to pass data
			weeklyForecast(lat, lon);

			// conditions for UV index
			if (uvIndex >= 0 && uvIndex <= 2) {
				$("#current-index").removeClass("badge-info").addClass("badge-success");
			} else if (uvIndex >= 3 && uvIndex <= 7) {
				$("#current-index").removeClass("badge-info").addClass("badge-warning");
			} else if (uvIndex >= 8 && uvIndex <= 10) {
				$("#current-index").removeClass("badge-info").addClass("badge-danger");
			} else {
				$("#current-index").removeClass("badge-info").addClass("badge-dark");
			}
		});
	});
}

// function for fiveDayForecast
function weeklyForecast(lat, lon) {
	//Pass Lat & Lon to forecast URL
	var forecastURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${APIkey}`;

	// initialize AJAX call for forecast
	$.ajax({
		url: forecastURL,
		method: "GET",
	}).then(function (forecastResponse) {
		console.log(forecastResponse);

		// Clear 5-day forecast cards
		$("#fiveDayForecast").empty();

		// for loop to iterate through next 5 days forecast
		for (let i = 1; i < 6; i++) {
			// assign data points to var
			var cityInfo = {
				date: forecastResponse.daily[i].dt,
				icon: forecastResponse.daily[i].weather[0].icon,
				temp: forecastResponse.daily[i].temp.day,
				humidity: forecastResponse.daily[i].humidity,
			};

			// grab day
			var currentDate = moment.unix(cityInfo.date).format("MMM Do YYYY");

			//grab weather icon
			var weatherIcon = `<img src="https://openweathermap.org/img/wn/${cityInfo.icon}.png" alt="${forecastResponse.daily[i].weather[0].main}" />`;

			// use template literal for cards
			var forecastCard = $(`
		<div class="card">
              <div class="card-header bg-dark">
                <h6 class="my-0 font-weight-normal text-white">${currentDate}</h6> 
              </div>
              <div class="mb-2 mt-2">
                <h3 class="mt-1">${weatherIcon}</h3>
                <ul class="list-unstyled">
                  <li>Temp: <strong>${cityInfo.temp} °F</strong></li>
                  <li>Humidity: <strong>${cityInfo.humidity}\%</strong></li>
                </ul>
              </div>
            </div>
		`);

			// Add forecast cards to fiveday forecast section
			$("#fiveDayForecast").append(forecastCard);
		}
	});
}

// Search Button
$("#searchButton").on("click", function (event) {
	// prevents clearing field
	event.preventDefault();

	// assign user input to variable
	var city = $("#cityInput").val().trim();

	// run through function
	currentWeather(city);

	// show history list
	$("#searchHistory").removeClass("hide");

	// check if list doesn't have city, then add to list
	if (!searchHistoryList.includes(city)) {
		searchHistoryList.push(city);
		var cityItem = $(`
		<a href="#">
		<li class="list-group-item d-flex justify-content-between lh-condensed">
		  <span>${city}</span>
		</li>
	  </a>
		`);

		$("#searchHistory").append(cityItem);
	}

	// store to local storage via city key
	localStorage.setItem("city", JSON.stringify(searchHistoryList));

	// show footer
	// $("#footer").removeClass("hide");
});

// make search history list clickable and run through function
$(document).on("click", ".list-group-item", function () {
	var listCity = $(this).text();
	currentWeather(listCity);
});

// show previous city searched
$(document).ready(function () {
	var searchHistoryArr = JSON.parse(localStorage.getItem("city"));
	if (searchHistoryArr !== null) {
		var lastSearchIndex = searchHistoryArr.length - 1;
		var lastCitySearch = searchHistoryArr[lastSearchIndex];
		currentWeather(lastCitySearch);
		console.log(`Previous City Searched: ${lastCitySearch}`);
	}
});
