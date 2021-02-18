let days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
let months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
let phoneMask = IMask.createMask({
    mask: '+7(000) 000-00-00',
    lazy: false
});
let freeDates = [];

$(document).ready(function() {
    getCitiesList((cities) => {
        insertCities(cities);
        insertInfo(cities[0]);
        getDates(cities[0].id, (dates) => {
            getFreeDates(dates);
            insertDates();
        });
    });


    // --- Number and name masked forms --- //
    let numberInput = IMask($('#number')[0], phoneMask);
    let nameInput = IMask($('#name')[0], {
        mask: /^[а-яА-я]+$/
    });

    $('#number').on('focusin', function() {
        $(this).css({ 'color': '#000' });
        $('#invalid-number').hide();
        $(this).removeClass('invalid');
    });

    $('#number').on('focusout', function() {
        if (numberInput.unmaskedValue.length !== 10) {
            $('#invalid-number').show();
            $(this).addClass('invalid');
        }

        if (numberInput.unmaskedValue.length === 0) {
            $(this).css({ 'color': '#8b8b8b' });
        }
    });
    // --- --- //

    // --- Validation --- //
    $('#name').on('focusin', function() {
        $('#invalid-name').hide();
        $(this).removeClass('invalid');
    });

    $('#name').on('focusout', function() {
        if (nameInput.unmaskedValue.length === 0) {
            $('#invalid-name').show();
            $(this).addClass('invalid');
        }
    });

    $('#date').on('focusin', function() {
        $('#invalid-date').hide();
        $(this).removeClass('invalid');
    });

    $('#date').on('focusout', function() {
        if ($(this).val() === null) {
            $('#invalid-date').show();
            $(this).addClass('invalid');
        }
    });

    $('#time').on('focusin', function() {
        $('#invalid-time').hide();
        $(this).removeClass('invalid');
    });

    $('#time').on('focusout', function() {
        if ($(this).val() === null) {
            $('#invalid-time').show();
            $(this).addClass('invalid');
        }
    });
    // --- --- //

    // --- Update changed info --- // 
    $('#cities').on('change', function() {
        getCitiesList((cities) => {
            let city = cities.filter(city => {
                return city.id === this.value;
            })[0]
            insertInfo(city);
            getDates(city.id, (dates) => {
                getFreeDates(dates);
                insertDates();
            });
        })
    })

    $('#date').on('change', function() {
        insertTime($(this).val());
    });
    // --- --- //
})

function getCitiesList(callback) {
    $.ajax({
        type: 'GET',
        url: 'https://www.mocky.io/v2/5b34c0d82f00007400376066',
        dataType: 'json',
        data: 'mocky-delay=700ms',
        beforeSend: showLoadScreen(),
        success: function(response) {
            callback(response.cities);
        },
        error: function(response) {
            console.log(response);
        }
    });
}

function insertCities(cities) {
    cities.forEach(city => {
        $('#cities').append('<option value=' + city.id + '>' + city.name + '</option>');
    });
}

function insertInfo(info) {
    $('#address').text(info.address);
    $('#phones').text('');


    if (info.phones.length !== 0) {
        info.phones.forEach(phone => {
            $('#phones').append('<a href="tel:' + phone + '">' + phoneMask.resolve(phone) + '</a> ')
        });

        phoneMask.resolve('');
    }

    $('#price').text(info.price);
}

function getFreeDates(allDates) {
    let result = {};
    Object.keys(allDates).forEach(dateKey => {
        let freeTimes = [];

        Object.keys(allDates[dateKey]).forEach(timeKey => {
            if (allDates[dateKey][timeKey]['is_not_free'] != true) {
                freeTimes.push(allDates[dateKey][timeKey]);
            }
        })

        if (freeTimes.length !== 0) {
            result[dateKey] = freeTimes;
        }

    })

    freeDates = result;
}

function getDates(cityId, callback) {
    $.ajax({
        type: 'GET',
        url: 'https://www.mocky.io/v2/' + cityId,
        dataType: 'json',
        data: 'mocky-delay=700ms',
        success: function(response) {
            callback(response.data);
            hideLoadScreen();
        },
        error: function(response) {
            console.log(response);
        }
    });
}

function insertDates() {
    $('#date').text('');
    $('#date').append('<option value disabled selected>Дата</option>');

    Object.keys(freeDates).forEach(dateStr => {
        let date = new Date(dateStr.split('-'));
        $('#date').append('<option value="' + dateStr + '">' + days[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + '</option>');
    });
}

function insertTime(date) {
    $('#time').text('');
    $('#time').append('<option value disabled selected>Время</option>');

    freeDates[date].forEach(time => {
        $('#time').append('<option value="' + time.date + '">' + time.begin + '-' + time.end + '</option>')
    });

    $('#time').prop('disabled', false);
}

function showLoadScreen() {
    $('#load-screen').show();
    $('#logo').addClass('animation');
}

function hideLoadScreen() {
    $('#load-screen').hide();
    $('#logo').removeClass('animation');
}

function showSuccess() {

}