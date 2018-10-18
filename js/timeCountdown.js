var timeRemain = null; // global

function timeCountdown() {
    var timeNode = [];
    timeNode[0] = [0, 1]; // 00:01 NightMoon starts (monthly, first Sunday)
    timeNode[1] = [23, 59]; // 23:59 NightMoon ends (monthly, the Saturday after first Sunday)
    timeNode[2] = [3, 0]; // daily quest (daily)
    timeNode[3] = [7, 0]; // weekly events starts (weekly, Thursday)
                          // raid CD; Mythic(+) CD/box (weekly, Thursday)
                          // world quest 1; Chanmpions of Azeroth, opposite (daily)
                          // 5H (daily)
    timeNode[4] = [15, 0]; // world quest 2 (daily)
    timeNode[5] = [19, 0]; // world quest 3; opposite (daily)
    timeNode[6] = [23, 0]; // world quest 4 (daily)
    timeNode[7] = [4, 0]; // weekly events ends (weekly, Thursday)

    var loadTime = new Date(); // get current time (full information)
    var cur = {
        // cur is short for 'current (time)', actually same as 'Date'
        // toNextHour -- time to next hour [hrs,mins,secs]
        year: loadTime.getFullYear(),
        month: loadTime.getMonth(), // 0~11
        date: loadTime.getDate(), // 1~31
        day: loadTime.getDay(), // 0~6 Sun~Sat
        hour: loadTime.getHours(), // 0~23
        min: loadTime.getMinutes(), // 0~59
        Seconds: loadTime.getSeconds(), // 0~59
        toNextHour: function () {
            mCur = loadTime.getMinutes();
            sCur = loadTime.getSeconds();
            s = (3600 - mCur * 60 - sCur) % 60;
            m = (3600 - mCur * 60 - sCur - s) / 60;
            h = 0;
            if (m === 60) {
                h = 1;
                m = 0;
            }
            return [h, m, s];
        }
    };

    timeRemain = {
        // return a string -- (days) hrs:mins:secs
        // daily: dailyQuest | worldQuest(cOA, opposite) | 5H
        // weekly: weekly events | raid CD; Mythic(+) CD/box
        // monthly: NightMoon

        dailyQuest: function () {
            var h = (timeNode[2][0] + 23 - cur.hour) % 24;
            h += cur.toNextHour()[0];
            var m = cur.toNextHour()[1];
            var s = cur.toNextHour()[2];
            [h, m, s] = checkTime([h, m, s]);

            return h + ":" + m + ":" + s;
        },
        worldQuest: {
            // norm: 0700 1500 1900 2300 | cOA(Chanmpions of Azeroth) with 5H: 0700 | opposite: 0700 1900
            norm: function () {
                if (cur.hour >= timeNode[3][0] && cur.hour < timeNode[4][0]) {
                    var h = timeNode[4][0] - cur.hour - 1;
                }
                else if (cur.hour >= timeNode[4][0] && cur.hour < timeNode[5][0]) {
                    var h = timeNode[5][0] - cur.hour - 1;
                }
                else if (cur.hour >= timeNode[5][0] && cur.hour < timeNode[6][0]) {
                    var h = timeNode[6][0] - cur.hour - 1;
                }
                else {
                    var h = (timeNode[3][0] + 23 - cur.hour) % 24;
                }

                [h, m, s] = checkTime([h + cur.toNextHour()[0],
                    cur.toNextHour()[1],
                    cur.toNextHour()[2]]);

                return h + ":" + m + ":" + s;
            },
            cOA: function () {
                var h = (timeNode[3][0] + 23 - cur.hour) % 24;
                [h, m, s] = checkTime([h + cur.toNextHour()[0], cur.toNextHour()[1], cur.toNextHour()[2]]);
                return h + ":" + m + ":" + s;
            },
            opposite: function () {
                if (cur.hour >= timeNode[3][0] && cur.hour < timeNode[5][0]) {
                    var h = timeNode[5][0] - cur.hour - 1;
                }
                else {
                    var h = (timeNode[3][0] + 23 - cur.hour) % 24;
                }
                [h, m, s] = checkTime([h + cur.toNextHour()[0], cur.toNextHour()[1], cur.toNextHour()[2]]);
                return h + ":" + m + ":" + s;
            }
        },
        weeklyThu: function () {
            var h = (timeNode[3][0] + 23 - cur.hour) % 24;
            var d = (10 - cur.day) % 7 + (timeNode[3][0] + 23 - cur.hour - h) / 24;
            h += cur.toNextHour()[0];
            if (h === 24) {
                d += 1;
                h = 0;
            }
            [h, m, s] = checkTime([h, cur.toNextHour()[1], cur.toNextHour()[2]]);

            return d + "天 " + h + ":" + m + ":" + s;
        },
        weeklyEvents: function () {
            if (cur.day == 4 && cur.hour >= timeNode[7][0] && cur.hour < timeNode[3][0]) {
                var h = timeNode[3][0] - cur.hour - 1;
                [h, m, s] = checkTime([h + cur.toNextHour()[0], cur.toNextHour()[1], cur.toNextHour()[2]]);
                return h + ":" + m + ":" + s + "-";
            }
            else {
                var h = (timeNode[7][0] + 23 - cur.hour) % 24;
                var d = (10 - cur.day) % 7 + (timeNode[7][0] + 23 - cur.hour - h) / 24;
                h += cur.toNextHour()[0];
                if (h == 24) {
                    d += 1;
                    h = 0;
                }
                [h, m, s] = checkTime([h, cur.toNextHour()[1], cur.toNextHour()[2]]);

                return d + "天 " + h + ":" + m + ":" + s + "+";
            }
        },
        nightMoon: function () {
            var startDate = (7 - cur.day + cur.date) % 7;
            if (startDate == 0) {
                startDate = 7;
            }
            var endDate = startDate + 7;

            // the actual duaration is Sun.000100~Sat.235859, but I make it Sun.000000~Sat.235959 here, may cause tiny error
            if (cur.date >= startDate && cur.date < endDate) {
                var d = endDate - cur.date - 1;
                var h = (23 - cur.hour) % 24;
                h += cur.toNextHour()[0];
                if (h == 24) {
                    d += 1;
                    h = 0;
                }
                [h, m, s] = checkTime([h, cur.toNextHour()[1], cur.toNextHour()[2]]);

                return d + "天 " + h + ":" + m + ":" + s + "+";
            }
            else if (cur.date < startDate) {
                var d = startDate - cur.date - 1;
                var h = (23 - cur.hour) % 24;
                h += cur.toNextHour()[0];
                if (h == 24) {
                    d += 1;
                    h = 0;
                }
                [h, m, s] = checkTime([h, cur.toNextHour()[1], cur.toNextHour()[2]]);

                return d + "天 " + h + ":" + m + ":" + s + "-";
            }
            else {
                var nextMon1st = new Date(cur.year, cur.month + 1, 1);
                var curMonlast = new Date(cur.year, cur.month + 1, 0);
                var nextStartDate = (8 - nextMon1st.getDay()) % 7;
                if (nextStartDate == 0) {
                    nextStartDate = 7;
                }
                var d = curMonlast.getDate() - cur.date + nextStartDate - 1;
                var h = (23 - cur.hour) % 24;
                h += cur.toNextHour()[0];
                if (h == 24) {
                    d += 1;
                    h = 0;
                }
                [h, m, s] = checkTime([h, cur.toNextHour()[1], cur.toNextHour()[2]]);

                return d + "天 " + h + ":" + m + ":" + s + "-";
            }
        }
    }

    document.getElementById("world-Quest").innerHTML = timeRemain.worldQuest.norm();
    document.getElementById("wQ-cOA-5H").innerHTML = timeRemain.worldQuest.cOA();
    document.getElementById("wQ-oppo").innerHTML = timeRemain.worldQuest.opposite();
    document.getElementById("daily-Quest").innerHTML = timeRemain.dailyQuest();

    document.getElementById("weekly-Thu").innerHTML = timeRemain.weeklyThu();
    if (timeRemain.weeklyEvents().charAt(timeRemain.weeklyEvents().length - 1) == "-") {
        document.getElementById("weekly-Events-Txt").innerHTML = "周常活动即将开始";
        document.getElementById("weekly-Events-Time").innerHTML = timeRemain.weeklyEvents().slice(0, -1);
    }
    else {
        document.getElementById("weekly-Events-Txt").innerHTML = "周常活动剩余时间 ";
        document.getElementById("weekly-Events-Time").innerHTML = timeRemain.weeklyEvents().slice(0, -1);
    }

    if (timeRemain.nightMoon().charAt(timeRemain.nightMoon().length - 1) == "-") {
        document.getElementById("night-Moon-Txt").innerHTML = "暗月马戏团下次到达 ";
        document.getElementById("night-Moon-Time").innerHTML = timeRemain.nightMoon().slice(0, -1);
    }
    else {
        document.getElementById("night-Moon-Txt").innerHTML = "暗月马戏团剩余时间 ";
        document.getElementById("night-Moon-Time").innerHTML = timeRemain.nightMoon().slice(0, -1);
    }

    setTimeout('timeCountdown()', 500);
}

function checkTime(arr) {
    // add front 0 for numbers less than 10
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] < 10) {
            arr[i] = "0" + arr[i];
        }
    }
    return arr;
}