(function() {
  getAttendanceLog();
})();

function getAttendanceLog() {
  fetch()
  // Fetch API Here
    .then(a => a.json())
    .then(data => getAttendanceData(data));
}

function getAttendanceData(attendanceLog) {
  const avgWorkingDuration =
    attendanceLog.attendance_summary.avg_total_work_duration; // Average Working Duration

  const fixedWorkingHours = 9; // Fixed Working Hours
  const fixedWorkingMins = fixedWorkingHours * 60; // Fixed Working Mins

  const date = new Date(); // Today
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1); // First Day of Month
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0); // Last Day of Month
  const yesterDay = new Date(Date.now() - 864e5); // Yesterday

  const todayMorningEntry = attendanceLog.update[date.getDate() - 1][1]; // Morning Punch
  const todayEveningEntry = attendanceLog.update[date.getDate() - 1][2] || 0; // Evening Punch

  const todayCompleted = todayEveningEntry ? 1 : 0; // Check if today is completed or not

  const workingDays = getBusinessDatesCount(firstDay, lastDay) - 3; // Total Working Days
  const workingHours = workingDays * fixedWorkingHours; // Total Number of Working Hours

  const workingDaysLeft =
    getBusinessDatesCount(yesterDay, lastDay) - todayCompleted; // Working Days Left
  const workingDaysComplete =
    attendanceLog.attendance_summary.total_days_present; // Total Working Days Completed

  const entryTimeParts = todayMorningEntry.split(":");

  const minuteLeftForToday =
    fixedWorkingMins +
    (+entryTimeParts[0] * 60 + (+entryTimeParts[1] % 60)) -
    (date.getHours() * 60 + (date.getMinutes() % 60)); // Minutes left for today

  const timeLeftForToday = +entryTimeParts[0]
    ? minuteLeftForToday >= 0
      ? getTime(minuteLeftForToday)
      : `Done for today (+ ${getTime(Math.abs(minuteLeftForToday))})`
    : "Not Yet Punched"; // Hours left for today

  const [avgHours, avgMinutes] = avgWorkingDuration.split(":"); // Splitting Average Working Time
  const totalAvgMins = +avgHours * 60 + +avgMinutes; // Total Average minutes
  const workingHoursComplete = workingDaysComplete * totalAvgMins; // Working Hours Completed
  const workingMinutesLeft = workingHours * 60 - workingHoursComplete; // Working Minutes Left
  const workingHoursLeft = getTime(workingMinutesLeft); // Converting into Hours

  const timeLeftTillDate =
    attendanceLog.attendance_summary.total_days_present *
    (fixedWorkingMins - totalAvgMins); // Do extra Time to maintain average

  //Adding Data in DOM
  document.getElementById("avgHours").innerHTML = avgWorkingDuration;
  document.getElementById("timeLeftTillDate").innerHTML = `${
    timeLeftTillDate > 0 ? "+" : "-"
  } ${getTime(timeLeftTillDate)}`;

  //Today
  document.getElementById("timeLeftForToday").innerHTML = timeLeftForToday;
  document.getElementById("morningPunch").innerHTML = todayMorningEntry;

  //Month
  document.getElementById(
    "numberOfWorkingDaysLeft"
  ).innerHTML = workingDaysLeft;
  document.getElementById(
    "numberOfWorkingHoursLeft"
  ).innerHTML = workingHoursLeft;
  document.getElementById(
    "numberOfWorkingDaysCompleted"
  ).innerHTML = workingDaysComplete;

  //Exclusive
  document.getElementById("numberOfWorkingDays").innerHTML = workingDays;
  document.getElementById("numberOfWorkingHours").innerHTML = workingHours;
}

function getBusinessDatesCount(startDate, endDate) {
  var count = 0;
  var curDate = startDate;
  while (curDate <= endDate) {
    var dayOfWeek = curDate.getDay();
    if (!(dayOfWeek == 6 || dayOfWeek == 0)) count++;
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
}

function getTime(workingMinutesLeft) {
  const time = Math.abs(workingMinutesLeft);
  let hours = Math.floor(time / 60);
  if (hours < 0) {
    hours = hours % 24;
  }
  const minutes = time % 60;
  return `${preciseNumber(hours)}:${preciseNumber(minutes)}`;
}

function preciseNumber(data) {
  if (data.toString().length == 1) {
    data = "0" + data;
  }
  return data;
}
