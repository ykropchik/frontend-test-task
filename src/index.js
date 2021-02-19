let numberInput;
let nameInput;
let days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
let months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
let phoneMask = IMask.createMask({
    mask: '+7(000) 000-00-00',
    lazy: false
});
let freeDates = [];

$(document).ready(function() {
    init();

    // --- Number and name masked forms --- //
    numberInput = IMask($('#number')[0], phoneMask);
    nameInput = IMask($('#name')[0], {
        mask: /^[А-яA-z ]+$/
    });

    $('#number').on('focusin', function() {
        $(this).css({ 'color': '#000' });
        $('#invalid-number').hide();
        $(this).removeClass();
        $(this).addClass('complete');
    });

    $('#number').on('focusout', function() {
        if (numberInput.unmaskedValue.length !== 10) {
            $('#invalid-number').show();
            $(this).removeClass();
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
        $(this).removeClass();
        $(this).addClass('complete');
    });

    $('#name').on('focusout', function() {
        if (nameInput.unmaskedValue.length === 0) {
            $('#invalid-name').show();
            $(this).removeClass();
            $(this).addClass('invalid');
        }
    });

    $('#date').on('focusin', function() {
        $('#invalid-date').hide();
        $(this).removeClass();
        $(this).addClass('complete');
    });

    $('#date').on('focusout', function() {
        if ($(this).val() === null) {
            $('#invalid-date').show();
            $(this).removeClass();
            $(this).addClass('invalid');
        }
    });

    $('#time').on('focusin', function() {
        $('#invalid-time').hide();
        $(this).removeClass();
        $(this).addClass('complete');
    });

    $('#time').on('focusout', function() {
        if ($(this).val() === null) {
            $('#invalid-time').show();
            $(this).removeClass();
            $(this).addClass('invalid');
        }
    });
    // --- --- //

    // --- Update changed info --- // 
    $('#cities').on('change', function() {
        $(this).blur();
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
        $(this).blur();
        insertTime($(this).val());
        $('#time').removeClass();
        $('#time').addClass('empty');
    });

    $('#time').on('change', function() {
        $(this).blur();
    });
    // --- --- //

    // --- Button activation --- //
    $('select, input').on('change', function() {
        if ($('.empty, .invalid').length === 0) {
            $('#accept-btn').prop('disabled', false);
        } else {
            $('#accept-btn').prop('disabled', true);
        }
    });
    // --- --- //

    // --- Simple router --- //
    window.addEventListener('load', routing);
    window.addEventListener('hashchange', routing);
    // --- --- //

    $('#accept-btn').on('click', function() {
        showLoadScreen();
        writeOrder({
            city: $('#cities option:selected').text(),
            date: $('#time').val(),
            tel: numberInput.value,
            name: nameInput.value
        });
        setTimeout(showSuccess, 1000);
    });

    $('#success-btn').on('click', function() {
        hideSuccess();
    });
})

function init() {
    getCitiesList((cities) => {
        insertCities(cities);
        insertInfo(cities[0]);
        getDates(cities[0].id, (dates) => {
            getFreeDates(dates);
            insertDates();
        });
    });
}

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
    $('#phones').empty('');


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
    $('#date').empty();
    $('#date').append('<option value disabled selected>Дата</option>');

    Object.keys(freeDates).forEach(dateStr => {
        let date = new Date(dateStr.split('-'));
        $('#date').append('<option value="' + dateStr + '">' + days[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + '</option>');
    });

    $('#date').removeClass();
    $('#date').addClass('empty');

    $('#time').empty();
    $('#time').append('<option value disabled selected>Время</option>');
    $('#time').prop('disabled', true);
    $('#time').removeClass();
    $('#time').addClass('empty');
}

function insertTime(date) {
    $('#time').empty();
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

function clearForms() {
    $('#cities').empty();

    $('#date').empty();
    $('#date').append('<option value disabled selected>Дата</option>');
    $('#date').removeClass();
    $('#date').addClass('empty');

    $('#time').empty();
    $('#time').append('<option value disabled selected>Время</option>');
    $('#time').prop('disabled', true);
    $('#time').removeClass();
    $('#time').addClass('empty');

    numberInput.unmaskedValue = '';
    $('#number').removeClass();
    $('#number').addClass('empty');

    nameInput.unmaskedValue = '';
    $('#name').removeClass();
    $('#name').addClass('empty');

    init();
}

function writeOrder(info) {
    localStorage.setItem(Object.entries(localStorage).length, JSON.stringify(info));
}

function insertOrders() {
    $('#orders-table').empty();
    Object.keys(localStorage).forEach(key => {
        let order = JSON.parse(localStorage.getItem(key));
        $('#orders-table').append(
            `<div class="table-item" orderId="` + key + `"><span>` + order.city + `</span>
                <span>` + order.date.split(' ')[0] + `</span>
                <span>` + order.date.split(' ')[1] + `</span>
                <span>` + order.name + `</span>
                <span>` + order.tel + `</span>
                <button class="del-btn" onClick=deleteOrder(this)>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="#db001b" height="24" viewBox="0 0 24 24" width="24">
                        <path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            </div>`);
    });

}

function deleteOrder(data) {
    let elem = $(data).parent();
    localStorage.removeItem(elem.attr('orderId'));
    elem.remove();
}

function routing() {
    if (window.location.hash === '#/orders') {
        window.history.pushState({}, 'orders', window.location.pathname + '#/orders');
        $('#orders-wrap').show();
        insertOrders();
    }
}

function showSuccess() {
    hideLoadScreen();
    $('#success-wrap').show();
}

function hideSuccess() {
    clearForms();
    $('#accept-btn').prop('disabled', true);
    $('#success-wrap').hide();
}