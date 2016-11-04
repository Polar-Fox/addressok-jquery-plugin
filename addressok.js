// addressok.js
// jQuery-плагин для AddressOK.
// v0.1.0
// 2016-11-04
// (c) 2016 Ильдар Ахмадуллин

// Подключение:
// $('CSS_селектор_адресной_формы').AddressOK('/URL/для/AJAX/запросов');

(function ($) {
    jQuery.fn.AddressOK = function(server_url) {
        return this.each(function() {
            var form_element = $(this);

            // Input'ы
            var zip_input = $(this).find('input[type="text"][data-addressok-field="zip"]').eq(0);
            var region_input = $(this).find('input[type="text"][data-addressok-field="region"]').eq(0);
            var district_input = $(this).find('input[type="text"][data-addressok-field="district"]').eq(0);
            var place_input = $(this).find('input[type="text"][data-addressok-field="place"]').eq(0);
            var street_input = $(this).find('input[type="text"][data-addressok-field="street"]').eq(0);

            var stateOK = true;
            if (zip_input.length == 0) {
                stateOK = false;
                console.log('AddressOK: Error: Поле для ввода почтового индекса не найдено!');
            }
            if (region_input.length == 0) {
                stateOK = false;
                console.log('AddressOK: Error: Поле для ввода региона не найдено!');
            }
            if (district_input.length == 0) {
                stateOK = false;
                console.log('AddressOK: Error: Поле для ввода района не найдено!');
            }
            if (place_input.length == 0) {
                stateOK = false;
                console.log('AddressOK: Error: Поле для ввода населённого пункта не найдено!');
            }
            if (street_input.length == 0) {
                stateOK = false;
                console.log('AddressOK: Error: Поле для ввода улицы не найдено!');
            }

            if (stateOK) {
                if (server_url == 'clear') {
                    clearAddr();
                    getAddrData(false);
                    return;
                }

                if ($(this).data('addressok-server-url') == undefined) {
                    $(this).data('addressok-server-url', server_url);
                }

                var form_state = {};

                function save_form_state() {
                    form_state = {
                        'zip_code': zip_input.val(),
                        'region': region_input.val(),
                        'district': district_input.val(),
                        'place': place_input.val(),
                        'street': street_input.val()
                    };
                };

                function has_form_changed() {
                    if ((form_state['zip_code'] != zip_input.val())
                        || (form_state['region'] != region_input.val())
                        || (form_state['district'] != district_input.val())
                        || (form_state['place'] != place_input.val())
                        || (form_state['street'] != street_input.val())) {
                        return true;
                    }
                    else return false;
                }

                function clear_input_element(elem) {
                    elem.data('addressok-aoid', 0);
                    elem.data('addressok-label', '');
                    elem.val('');
                };

                function fill_input_element(input_elem, fill_data) {
                    if ((fill_data != undefined) && (fill_data['label'] != '')) {
                        input_elem.val(fill_data['label']);
                        input_elem.data('addressok-aoid', fill_data['value']);
                        input_elem.data('addressok-label', fill_data['label']);
                    }
                }

                function apply_autocomplete(input_elem, src) {
                    input_elem.autocomplete({
                        source: src,
                        minLength: 0,
                        delay: 0,
                        focus: function(event, ui) {
                            input_elem.val(ui.item.label);
                            return false;
                        },
                        select: function(event, ui) {
                            input_elem.val(ui.item.label);
                            input_elem.data('addressok-aoid', ui.item.value);
                            input_elem.data('addressok-label', ui.item.label);
                            return false;
                        }
                    });
                }

                function clearAddr() {
                    form_state = {
                        'zip_code': '',
                        'region': '',
                        'district': '',
                        'place': '',
                        'street': ''
                    };
                    clear_input_element(zip_input);
                    clear_input_element(region_input);
                    clear_input_element(district_input);
                    clear_input_element(place_input);
                    clear_input_element(street_input);
                };

                function fill_address_form(data) {
                    // Fill
                    zip_input.val(data['fill']['zip']);
                    fill_input_element(region_input, data['fill']['region']);
                    fill_input_element(district_input, data['fill']['district']);
                    fill_input_element(place_input, data['fill']['place']);
                    fill_input_element(street_input, data['fill']['street']);

                    // Suggest
                    apply_autocomplete(region_input, data['suggest']['region']);
                    apply_autocomplete(district_input, data['suggest']['district']);
                    apply_autocomplete(place_input, data['suggest']['place']);
                    apply_autocomplete(street_input, data['suggest']['street']);

                    save_form_state();
                }

                function getAddrDataByZIPCode() {
                    var zip_code = zip_input.val();
                    if (zip_code != '') {
                        var data = {
                            'request_type': 'zip',
                            'zip_code': zip_code
                        }

                        $.ajax({
                            type: 'POST',
                            url: form_element.data('addressok-server-url'),
                            data: data,
                            dataType: 'json',
                            success: function(data) {
                                fill_address_form(data);
                            },
                            error: function(data, textStatus, jqXHR) {
                                console.log('AddressOK: Error: Could not get address data. Error message: '+jqXHR);
                            }
                        });
                    }
                };

                function get_input_aoid(input_elem) {
                    if (input_elem.data('addressok-label') == input_elem.val()) {
                        return input_elem.data('addressok-aoid');
                    }
                    else return 0;
                }

                function getAddrDataByAllFields() {
                    var zip_code = zip_input.val();
                    var region_id = get_input_aoid(region_input);
                    var district_id = get_input_aoid(district_input);
                    var place_id = get_input_aoid(place_input);
                    var street_id = get_input_aoid(street_input);

                    var data = {
                        'request_type': 'all',
                        'zip_code': zip_code,
                        'region_id': region_id,
                        'district_id': district_id,
                        'place_id': place_id,
                        'street_id': street_id
                    }

                    $.ajax({
                        type: 'POST',
                        url: form_element.data('addressok-server-url'),
                        data: data,
                        dataType: 'json',
                        success: function(data) {
                            fill_address_form(data);
                        },
                        error: function(data, textStatus, jqXHR) {
                            console.log('AddressOK: Error: Could not get address data. Error message: '+jqXHR);
                        }
                    });
                }

                function getAddrData(get_by_zip) {
                    if (get_by_zip) {
                        getAddrDataByZIPCode();
                    }
                    else {
                        getAddrDataByAllFields();
                    }
                };

                clearAddr();

                zip_input.focusout(function() {
                    if (has_form_changed()) {
                        getAddrData(true);
                    }
                });
                region_input.focusout(function() {
                    if (has_form_changed()) {
                        getAddrData(false);
                    }
                });
                district_input.focusout(function() {
                    if (has_form_changed()) {
                        getAddrData(false);
                    }
                });
                place_input.focusout(function() {
                    if (has_form_changed()) {
                        getAddrData(false);
                    }
                });
                street_input.focusout(function() {
                    if (has_form_changed()) {
                        getAddrData(false);
                    }
                });

                getAddrData(false);
            }
        });
    }
}) (jQuery);
