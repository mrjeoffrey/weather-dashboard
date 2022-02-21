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
		// Traverse DOM to show sections and clear #cityDetail
		$("#weatherContent").removeClass("hide");
		$("#cityDetail").empty();

		// Variables for Icons
		var iconCode = weatherResponse.weather[0].icon;
		var iconURL = `https://openweathermap.org/img/wn/${iconCode}.png`;

		// Template Literal to
		var currentCity = $(`
		<h4 id="cityDate" class="pb-n3">${weatherResponse.name} • ${today} <img src="${iconURL}" alt="${weatherResponse.weather[0].description}" /></h4>
		<p id="current-temp">Temperature: <strong>${weatherResponse.main.temp} °F </strong></p>
		<p id="current-wind">Wind Speed: <strong> ${weatherResponse.wind.speed} MPH </strong></p>
		<p id="current-humidity">Humidity: <strong>${weatherResponse.main.humidity}\%</strong></p>
		
	`);

		$("#cityDetail").append(currentCity);

		var lat = weatherResponse.coord.lat;
		var lon = weatherResponse.coord.lon;

		// Also grab UV index by modifying URL with lat lon
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
			var uvIndex = uvResponse.value;
			var uvIndexP = $(`
			<p>UV-Index: <span id="current-index" class="badge badge-info p-2">${uvIndex}</span></p>
			`);

			$("#cityDetail").append(uvIndexP);

			// run weeklyforcast function here to pass data
			weeklyForecast(lat, lon);
			// condition for UV index
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
	var forecastURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${APIkey}`;

	$.ajax({
		url: forecastURL,
		method: "GET",
	}).then(function (forecastResponse) {
		$("#fiveDayForecast").empty();

		for (let i = 1; i < 6; i++) {
			var cityInfo = {
				date: forecastResponse.daily[i].dt,
				icon: forecastResponse.daily[i].weather[0].icon,
				temp: forecastResponse.daily[i].temp.day,
				humidity: forecastResponse.daily[i].humidity,
			};

			var currentDate = moment.unix(cityInfo.date).format("MMM Do YYYY");
			var weatherIcon = `<img src="https://openweathermap.org/img/wn/${cityInfo.icon}.png" alt="${forecastResponse.daily[i].weather[0].main}" />`;

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

$("#searchButton").on("click", function (event) {
	event.preventDefault();

	var city = $("#cityInput").val().trim();
	currentWeather(city);

	$("#searchHistory").removeClass("hide");

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

	localStorage.setItem("city", JSON.stringify(searchHistoryList));

	$("#footer").removeClass("hide");
});

$(document).on("click", ".list-group-item", function () {
	var listCity = $(this).text();
	currentWeather(listCity);
});

$(document).ready(function () {
	var searchHistoryArr = JSON.parse(localStorage.getItem("city"));
	if (searchHistoryArr !== null) {
		var lastSearchIndex = searchHistoryArr.length - 1;
		var lastCitySearch = searchHistoryArr[lastSearchIndex];
		currentWeather(lastCitySearch);
		console.log(`Previous City Searched: ${lastCitySearch}`);
	}
});
