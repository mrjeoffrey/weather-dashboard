// GIVEN a weather dashboard with form inputs
// WHEN I search for a city
// THEN I am presented with current and future conditions for that city and that city is added to the search history

// WHEN I view current weather conditions for that city
// THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index

// WHEN I view the UV index
// THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe

// WHEN I view future weather conditions for that city
// THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, the wind speed, and the humidity

// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions for that city

// Access elements

var searchCityInput = $("#inputSearch");
var searchButton = $("#searchButton");
var searchHistoryList = $("#search-history");

var currentCityDate = $("#cityDate");
var currentTemp = $("#current-temp");
var currendWind = $("#current-wind");
var currentHumidity = $("#current-humidity");
var currentUVIndex = $("#current-index");
var currentDate = moment().format("L");

// instantiate city history
var citySearchHistory = [];

// Access OpenWeather API
var APIkey = "3803e9deb4e4613335fd77eb16454bc1";

// Request OpenWeather API based on user input
function currentWeatherRequest(citySearch) {
	// make AJAX api call
	var queryURL =
		"https://api.openweathermap.org/data/2.5/weather?q=" +
		citySearch +
		"&units=imperial&appid=" +
		APIkey;

	// initialize AJAX call for OpenWeather
	$.ajax({
		url: queryURL,
		method: "GET",
	}).then(function (response) {
		currentCityWeather(response);

		var lat = response.coord.lat;
		var lon = response.coord.lon;

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
		}).then(function (response) {
			currentUVIndex.text(response.value);
		});

		// Grab country code
		var countryCode = response.sys.country;
		// Grab forecastURL
		var forecastURL =
			"https://api.openweathermap.org/data/2.5/forecast?&units=imperial&appid=" +
			APIkey +
			"&lat=" +
			lat +
			"&lon=" +
			lon;

		// Initialize call for 5-day forecast
		$.ajax({
			url: forecastURL,
			method: "GET",
		}).then(function (response) {});
	});
}

// filters data into and appends to current city
function currentCityWeather(data) {
	console.log(data);
}
