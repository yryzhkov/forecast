$(function() {
	var DEG = 'C';	 // Темп. в градусах Цельсія
	var weatherTable = $('#weather'),
        weatherError = $('#error'),
		location = $('p.location');
	// Перевірка підтримки геолокації
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
	}
	else {
		showError("Your browser does not support Geolocation!");
	}
	// Визначення місцезнаходження і прогноз OpenWeatherMap
	function locationSuccess(position) {
		try {
			// Отримання кешу
			var cache = localStorage.weatherCache && JSON.parse(localStorage.weatherCache);
			var d = new Date();

			// Перевірка кешу на затримку 30хв
			if (cache && cache.timestamp && cache.timestamp > d.getTime() - 30*60*1000 ) {
				var offset = d.getTimezoneOffset()*60*1000;
				var city = cache.data.city.name;
				var country = cache.data.city.country;

				$.each(cache.data.list, function() {
					// Присвоювання місцевого часу
					var localTime = new Date(this.dt*1000 + offset);

					addWeather(
						this.weather[0].icon,
						moment(localTime).calendar(),	// Форматування часу з moment.js
						this.weather[0].main,
                        '<b>'+ convertTemperature(this.main.temp) + '°' + DEG + '</b>',
                        this.main.pressure
                        
					);

				});

				// Вивід місцезнаходження
				location.html('Визначене місцезнаходження: '+ city +', <b>'+ country +'</b>');
			}

			else{
				// Новий запит якщо кеш відсутній або застарів
				var weatherAPI = 'http://api.openweathermap.org/data/2.5/forecast?lat='+position.coords.latitude+
									'&lon='+position.coords.longitude+'&callback=?'

				$.getJSON(weatherAPI, function(response){

					// Запис в кеш
					localStorage.weatherCache = JSON.stringify({
						timestamp:(new Date()).getTime(),	// час в мілісекундах
						data: response
					});

					// Повторний виклик функції
					locationSuccess(position);
				});
			}

		}
		catch(e){
			showError("We can't find information about your city!");
			window.console && console.error(e);
		}
	}

	function addWeather(icon, day, condition, temp, press){
		var markup = '<tr>'+'<td>'+ day +'</td>'+
            '<td>'+ '<img src="../images/icons/'+ icon +'.png" />'+'</td>'+
			'<td>'+ condition +'</td>'+
            '<td>'+ temp +'</td>'+
            '<td>'+ press +'</td>' +'</tr>';
		weatherTable.append(markup);
	}

	/* Функція обробки помилок */
	function locationError(error){
		switch(error.code) {
			case error.TIMEOUT:
				showError("A timeout occured! Please try again!");
				break;
			case error.POSITION_UNAVAILABLE:
				showError('We can\'t detect your location. Sorry!');
				break;
			case error.PERMISSION_DENIED:
				showError('Please allow geolocation access for this to work.');
				break;
			case error.UNKNOWN_ERROR:
				showError('An unknown error occured!');
				break;
		}

	}
    /* Функція конвертування температури */
	function convertTemperature(kelvin){
		return Math.round(DEG == 'C' ? (kelvin - 273.15) : (kelvin*9/5 - 459.67));
	}

	function showError(msg){
		weatherError.html(msg);
	}

});