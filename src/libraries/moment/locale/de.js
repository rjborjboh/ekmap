//! moment.js locale configuration

;(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined'
       && typeof require === 'function' ? factory(require('moment')) :
   typeof define === 'function' && define.amd ? define(['moment'], factory) :
   factory(global.moment)
}(this, (function (moment) { 'use strict';
    //! locale : German [de]
    function processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            'm': ['eine Minute', 'einer Minute'],
            'h': ['eine Stunde', 'einer Stunde'],
            'd': ['ein Tag', 'einem Tag'],
            'dd': [number + ' Tage', number + ' Tagen'],
            'M': ['ein Monat', 'einem Monat'],
            'MM': [number + ' Monate', number + ' Monaten'],
            'y': ['ein Jahr', 'einem Jahr'],
            'yy': [number + ' Jahre', number + ' Jahren']
        };
        return withoutSuffix ? format[key][0] : format[key][1];
    }
    module.exports = moment.defineLocale('de', {
        months : 'Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
        monthsShort : 'Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
        monthsParseExact : true,
        weekdays : 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
        weekdaysShort : 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
        weekdaysMin : 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
        weekdaysParseExact : true,
        longDateFormat : {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY HH:mm',
            LLLL : 'dddd, D. MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[heute um] LT [Uhr]',
            sameElse: 'L',
            nextDay: '[morgen um] LT [Uhr]',
            nextWeek: 'dddd [um] LT [Uhr]',
            lastDay: '[gestern um] LT [Uhr]',
            lastWeek: '[letzten] dddd [um] LT [Uhr]'
        },
        relativeTime : {
            future : 'in %s',
            past : 'vor %s',
            s : 'ein paar Sekunden',
            m : processRelativeTime,
            mm : '%d Minuten',
            h : processRelativeTime,
            hh : '%d Stunden',
            d : processRelativeTime,
            dd : processRelativeTime,
            M : processRelativeTime,
            MM : processRelativeTime,
            y : processRelativeTime,
            yy : processRelativeTime
        },
        dayOfMonthOrdinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
    /* datetimepicker language tooltips */
    moment.prototype.tooltip = moment.prototype.tooltip || {};
    moment.prototype.tooltip['de'] = {
        ignoreReadonly: true,
        useCurrent: false,
        showClear: true,//清除按钮
        showTodayButton: true,//今日按钮
        showClose: true,//关闭按钮
        allowInputToggle: true, // input输入框取得焦点时显示控件
        tooltips: { // tool tips
            today: 'Heute',
            clear: 'Die auswahl',
            close: 'Geschlossen',
            selectMonth: 'Wählen sie im monat',
            prevMonth: 'Ein monat',
            nextMonth: 'Nächsten monat',
            selectYear: 'Wählen sie ein Jahr',
            prevYear: 'Ein Jahr',
            nextYear: 'Nächste Jahr',
            selectDecade: 'Zehn Jahre',
            prevDecade: 'Vor zehn Jahren',
            nextDecade: 'Zehn Jahre nach der',
            prevCentury: 'Im vorigen jahrhundert.',
            nextCentury: 'Das nächste jahrhundert',
            pickHour: 'Zeitpunkt der Wahl',
            incrementHour: 'Nach einer stunde',
            decrementHour: 'Eine stunde vor',
            pickMinute: 'Wählen sie minuten',
            incrementMinute: 'Nach einer minute',
            decrementMinute: 'Vor einer minute',
            pickSecond: 'Die Wahl der sekunden',
            incrementSecond: 'Nach dem Zweiten',
            decrementSecond: 'Vor ein paar sekunden',
            togglePeriod: 'Die Zeit',
            selectTime: 'Wählen sie Die Zeit'
        }
    };
})));
