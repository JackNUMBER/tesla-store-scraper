// source: https://codepen.io/AlejoFab/pen/WLbBQr

function convert(input) {
  let output = languageSelector(input);

  const hoursDateStrings = monthsYearsDecisionMaker(output);
  let dateString = '';
  if (hoursDateStrings.length === 2) {
    dateString = hoursDateStrings[1];
    output = hoursDateStrings[0];
  }

  output = colonDecisionMaker(output);
  output = wrongTimeDecisionMaker(output);

  output = output.replace(/\s-\s/g, '-');
  output = output.replace(/,\s/g, ',');
  output = output.replace(/\s\s/g, ' ');

  output = outputSwitch(output, dateString);

  return output;
}

// Decides which of the different outputs are suitable.
function outputSwitch(output, dateString) {
  const onlyTimePattern =
    /^(((([0-1]?[0-9]|2[0-4]):[0-5][0-9]-([0-1]?[0-9]|2[0-4]):[0-5][0-9])(,\s|,|\s))?((([0-1]?[0-9]|2[0-4]):[0-5][0-9]-)?([0-1]?[0-9]|2[0-4]):[0-5][0-9]\+?))(;\s[A-Z][A-Z]\soff)?/g;
  const dayTimePattern =
    /([A-Z][a-z]([-,]))?([A-Z][a-z]([-,]))?[A-Z]([A-Z]|[a-z])\s((([0-1]?[0-9]|2[0-4]):[0-5][0-9]-([0-1]?[0-9]|2[0-4]):[0-5][0-9])(,\s|,|\s))?(((([0-1]?[0-9]|2[0-4]):[0-5][0-9]-)?([0-1]?[0-9]|2[0-4]):[0-5][0-9]\+?)|off)/g;
  const longerDayTimePattern =
    /([A-Z][a-z]([-,]))?([A-Z][a-z]([-,]))?[A-Z]([A-Z]|[a-z])\s((([0-1]?[0-9]|2[0-4]):[0-5][0-9]-([0-1]?[0-9]|2[0-4]):[0-5][0-9])(,\s|,|\s))((([0-1]?[0-9]|2[0-4]):[0-5][0-9]-([0-1]?[0-9]|2[0-4]):[0-5][0-9])(,\s|,|\s))(((([0-1]?[0-9]|2[0-4]):[0-5][0-9]-)?([0-1]?[0-9]|2[0-4]):[0-5][0-9]\+?)|off)/g;

  if (output.match(longerDayTimePattern) !== null) {
    output = output.match(longerDayTimePattern);
    output = output.join('; ');
    return output;
  } else if (output === '24/7') {
    return output;
  } else if (output.match(onlyTimePattern) !== null) {
    output = output.match(onlyTimePattern);
    output = output.toString();
    return output;
  } else if (output.match(dayTimePattern) !== null) {
    output = output.match(dayTimePattern);
    output = timeSummariser(output);
    output = daySummariser(output);
    output = output.join('; ');
    output = output.replace('; ', '; ' + dateString);
    output = dateString.concat(output);
    return output;
  } else {
    return '';
  }
}

//This function checks which language has been selected on the website.
function languageSelector(initInput) {
  initInput = frequentRegExEnglish(initInput);
  initInput = amDecisionMaker(initInput);
  initInput = pmDecisionMaker(initInput);
  return initInput;
}

// The most frequently used symbols of an ordinary opening-hours expression are replaced into OSM-compliant format.
function regexForCharacters(formatted) {
  formatted = formatted.replace(/\//g, ',');
  formatted = formatted.replace(/\*/g, '');
  formatted = formatted.replace(/\./g, ':');
  formatted = formatted.replace(/:-/g, ' - ');
  formatted = formatted.replace(/\s,/g, ',');
  formatted = formatted.replace(/:\s/g, ' ');
  formatted = formatted.replace(/\s+/g, ' ');
  formatted = formatted.replace(/:\+/g, '-');
  formatted = formatted.replace(/\s-\s|\s–\s|\s-|-\s|–|-/g, ' - ');
  formatted = formatted.replace(/\s\|\s/g, ',');
  formatted = formatted.replace(/^\s|\s$/g, '');
  formatted = formatted.replace(/\s&\s|&/g, ' - ');
  return formatted;
}

// The most frequently used words in english of an ordinary opening-hours expression are replaced into OSM-compliant format.
function frequentRegExEnglish(input) {
  let formatted = input.replace(/\bMondays?\b|\bMon?\b|\bM\b/gi, 'Mo');
  formatted = formatted.replace(/\bTuesdays?\b|\bTue?s?\b/gi, 'Tu');
  formatted = formatted.replace(/\bWednesdays?\b|\bWed?\b|\bW\b/gi, 'We');
  formatted = formatted.replace(/\bThursdays?\b|\bThu?r?s?\b/gi, 'Th');
  formatted = formatted.replace(/\bFridays?\b|\bFri?\b|\bF\b/gi, 'Fr');
  formatted = formatted.replace(/\bSaturdays?\b|\bSat,\s|\bSat?\b/gi, 'Sa ');
  formatted = formatted.replace(/\bSundays?\b|\bSun,\s|\bSun?\b/gi, 'Su ');
  formatted = formatted.replace(
    /\b(Public\s)?Holidays?\b|\bVacation\b/gi,
    'PH',
  );
  formatted = formatted.replace(/\bClosed\b/gi, 'off');
  formatted = formatted.replace(/\b(Open\s)?daily\b/gi, 'Mo-Su');
  formatted = regexForCharacters(formatted);
  return formatted;
}

// Decides whether the given String matches the days-month(s) and year(s) Pattern or not.
function monthsYearsDecisionMaker(output) {
  const monthsYearsPattern =
    /[0-3]?[0-9]\s[A-Z][a-z][a-z](\s2[0-9][0-9][0-9])?\s-\s[0-3]?[0-9]\s[A-Z][a-z][a-z](\s2[0-9][0-9][0-9])?/gi;

  if (output.match(monthsYearsPattern) !== null) {
    const monthsYearsIssues = output.match(monthsYearsPattern);
    const fixedMonthsYearsIssues = monthsYearsIssues.map((element) =>
      monthsYearsHandler(element),
    );
    output = output.replace(monthsYearsPattern, '');
    return [output, fixedMonthsYearsIssues.toString()];
  }
  return output;
}

// This handler fixes issues like "Wintersaison: 7. Dezember 2018 bis 21. April 2019 Mittwoch bis Montag ab 10 Uhr Dienstag = Ruhetag" -> "2018-2019: Dec 07-Apr 21: We-Mo 10:00+; 2018-2019: Dec 7-Apr 21: Tu off".
function monthsYearsHandler(monthsYearsString) {
  const yearPattern = /2[0-9][0-9][0-9]/g;
  const years = monthsYearsString.match(yearPattern);
  let yearStr = '';
  if (years !== null) {
    if (years.length === 2) {
      yearStr = years[0] + '-' + years[1];
    } else if (years.length === 1) {
      yearStr = years[0];
    }
  }

  const monthPattern = /[0-3]?[0-9]\s[A-Z][a-z][a-z]/gi;
  const months = monthsYearsString.match(monthPattern);
  const monthsDayStr = months.map((element) => {
    const month = element.match(/[A-Z][a-z][a-z]/gi).toString();
    const day = element.match(/[0-3]?[0-9]/g).toString();
    if (day.length === 1) {
      return month + ' ' + '0' + day;
    } else {
      return month + ' ' + day;
    }
  });

  if (years === null) {
    return monthsDayStr[0] + '-' + monthsDayStr[1] + ': ';
  } else {
    return yearStr + ': ' + monthsDayStr[0] + '-' + monthsDayStr[1] + ': ';
  }
}

// Decides whether the given String matches the pattern or not.
function amDecisionMaker(output) {
  const amIssuePattern = /(((0?[0-9]|1[0-2]):[0-5][0-9])|0?[0-9]|1[0-2])am/gi;

  if (output.match(amIssuePattern) !== null) {
    const amTimeIssues = output.match(amIssuePattern);
    const fixedAmTimeIssues = amTimeIssues.map((element) => amHandler(element));
    for (let i = 0; i < fixedAmTimeIssues.length; i++) {
      output = output.replace(
        /(((0?[0-9]|1[0-2]):[0-5][0-9])|0?[0-9]|1[0-2])am/i,
        fixedAmTimeIssues[i],
      );
    }
  }
  return output;
}

// This handler fixes issues like "9am-20:00" -> "09:00-20:00". It takes the am-time and replaces it by the correct format.
function amHandler(amTimeString) {
  if (amTimeString.match(/(0?[0-9]|1[0-2]):[0-5][0-9]am/i) !== null) {
    if (amTimeString.charAt(0) + amTimeString.charAt(1) === '12') {
      amTimeString = '00:' + amTimeString.charAt(3) + amTimeString.charAt(4);
      return amTimeString;
    } else {
      amTimeString = amTimeString.replace(/am/i, '');
      return amTimeString;
    }
  }
  if (amTimeString.match(/1[0-2]am/i) !== null) {
    amTimeString = amTimeString.replace(/10am/i, '10:00');
    amTimeString = amTimeString.replace(/11am/i, '11:00');
    amTimeString = amTimeString.replace(/12am/i, '00:00');
    return amTimeString;
  }
  if (amTimeString.match(/0[0-9]am/i) !== null) {
    amTimeString = amTimeString.replace(/am/i, ':00');
    return amTimeString;
  }
  if (amTimeString.match(/[0-9]am/i) !== null) {
    amTimeString = amTimeString.replace(/am/i, ':00');
    return amTimeString;
  }
}

// Decides whether the given String matches the pattern or not.
function pmDecisionMaker(output) {
  const pmIssuePattern =
    /(((0?[0-9]|1[0-2]):[0-5][0-9])|0?[0-9]|1[0-2])\s?pm/gi;

  if (output.match(pmIssuePattern) !== null) {
    const pmTimeIssues = output.match(pmIssuePattern);
    const fixedPmTimeIssues = pmTimeIssues.map((element) => pmHandler(element));
    for (let i = 0; i < fixedPmTimeIssues.length; i++) {
      output = output.replace(
        /(((0?[0-9]|1[0-2]):[0-5][0-9])|0?[0-9]|1[0-2])\s?pm/i,
        fixedPmTimeIssues[i],
      );
    }
  }
  return output;
}

// This handler fixes issues like "09:00-8pm" -> "09:00-20:00". It takes the pm-time and replaces it by the correct format.
function pmHandler(pmTimeString) {
  if (pmTimeString.match(/(0?[0-9]|1[0-2]):[0-5][0-9]\s?pm/i) !== null) {
    if (pmTimeString.match(/(0[0-9]|1[0-2]):[0-5][0-9]\s?pm/i) !== null) {
      let pmValue = pmTimeString.charAt(0) + pmTimeString.charAt(1);
      pmTimeString =
        pmConverter(pmValue) +
        pmTimeString.charAt(2) +
        pmTimeString.charAt(3) +
        pmTimeString.charAt(4);
      return pmTimeString;
    }
    if (pmTimeString.match(/[0-9]:[0-5][0-9]\s?pm/i) !== null) {
      let pmValue = pmTimeString.charAt(0);
      pmTimeString =
        pmConverter(pmValue) +
        pmTimeString.charAt(1) +
        pmTimeString.charAt(2) +
        pmTimeString.charAt(3);
      return pmTimeString;
    }
  }
  if (
    pmTimeString.match(/1[0-2]\s?pm/i) !== null ||
    pmTimeString.match(/0[0-9]\s?pm/i) !== null
  ) {
    let pmValue = pmTimeString.charAt(0) + pmTimeString.charAt(1);
    pmTimeString = pmConverter(pmValue) + ':00';
    return pmTimeString;
  }
  if (pmTimeString.match(/[0-9]\s?pm/i) !== null) {
    let pmValue = pmTimeString.charAt(0);
    pmTimeString = pmConverter(pmValue) + ':00';
    return pmTimeString;
  }
}

// Converts all pm-values to the correct format.
function pmConverter(pmValue) {
  if (pmValue === '1' || pmValue === '01') {
    pmValue = pmValue.replace(/0?1/i, '13');
    return pmValue;
  } else if (pmValue === '2' || pmValue === '02') {
    pmValue = pmValue.replace(/0?2/i, '14');
    return pmValue;
  } else if (pmValue === '3' || pmValue === '03') {
    pmValue = pmValue.replace(/0?3/i, '15');
    return pmValue;
  } else if (pmValue === '4' || pmValue === '04') {
    pmValue = pmValue.replace(/0?4/i, '16');
    return pmValue;
  } else if (pmValue === '5' || pmValue === '05') {
    pmValue = pmValue.replace(/0?5/i, '17');
    return pmValue;
  } else if (pmValue === '6' || pmValue === '06') {
    pmValue = pmValue.replace(/0?6/i, '18');
    return pmValue;
  } else if (pmValue === '7' || pmValue === '07') {
    pmValue = pmValue.replace(/0?7/i, '19');
    return pmValue;
  } else if (pmValue === '8' || pmValue === '08') {
    pmValue = pmValue.replace(/0?8/i, '20');
    return pmValue;
  } else if (pmValue === '9' || pmValue === '09') {
    pmValue = pmValue.replace(/0?9/i, '21');
    return pmValue;
  } else if (pmValue === '10' || pmValue === '10') {
    pmValue = pmValue.replace(/10/i, '22');
    return pmValue;
  } else if (pmValue === '11' || pmValue === '11') {
    pmValue = pmValue.replace(/11/i, '23');
    return pmValue;
  } else if (pmValue === '12' || pmValue === '12') {
    pmValue = pmValue.replace(/12/i, '12');
    return pmValue;
  }
}

// Decides whether the given String matches the pattern or not.
function colonDecisionMaker(output) {
  const colonIssuePattern = /([0-1]?[0-9]|2[0-4])[0-5][0-9]/g;

  if (output.match(colonIssuePattern) !== null) {
    const colonIssues = output.match(colonIssuePattern);
    const fixedColonIssues = colonHandler(colonIssues);
    for (let i = 0; i < fixedColonIssues.length; i++) {
      output = output.replace(
        /([0-1]?[0-9]|2[0-3])[0-5][0-9]/,
        fixedColonIssues[i],
      );
    }
  }
  return output;
}

// Decides whether the given String matches the pattern or not.
function wrongTimeDecisionMaker(output) {
  const wrongTimeSyntaxPattern =
    /\s[0-9](\s|$)|\s([0-1]?[0-9]|2[0-4])(\s|,|$)|\s[0-9]:/g;

  if (output.match(wrongTimeSyntaxPattern) !== null) {
    const wrongTimeIssues = output.match(wrongTimeSyntaxPattern);
    const fixedTimeIssues = wrongTimeIssues.map((element) =>
      timeSyntaxHandler(element),
    );
    for (let i = 0; i < fixedTimeIssues.length; i++) {
      output = output.replace(
        /\s[0-9](\s|$)|\s([0-1]?[0-9]|2[0-4])(\s|,|$)|\s[0-9]:/,
        fixedTimeIssues[i],
      );
    }
  }
  return output;
}

// This handler fixes issues like "1000-1230" -> "10:00-12:30". It inserts ":" between a number to format it into a time value.
function colonHandler(numbers) {
  return numbers.map(
    (element) =>
      element.charAt(0) +
      element.charAt(1) +
      ':' +
      element.charAt(2) +
      element.charAt(3),
  );
}

// This handler fixes issues like "8:00-17:00" -> "08:00-17:00" or "11-24" -> "11:00-24:00". It inserts a missing "0" or missing "00" where needed.
function timeSyntaxHandler(timeString) {
  if (timeString.match(/\s[0-9](\s|$|,)/) !== null) {
    return (
      timeString.charAt(0) +
      '0' +
      timeString.charAt(1) +
      ':00' +
      timeString.charAt(2)
    );
  }
  if (timeString.match(/\s([0-1]?[0-9]|2[0-4])(\s|,|$)/) !== null) {
    return (
      timeString.charAt(0) +
      timeString.charAt(1) +
      timeString.charAt(2) +
      ':00' +
      timeString.charAt(3)
    );
  }
  if (timeString.match(/\s[0-9]:/) !== null) {
    return (
      timeString.charAt(0) + '0' + timeString.charAt(1) + timeString.charAt(2)
    );
  }
}

// This handler fixes time issues like "Mo 07:30-18:30; Tu 07:30-18:30; We 07:30-18:30; Th 07:30-18:30; Fr 07:30-18:30; Sa 07:30-16:00" -> "Mo-Fr 07:30-18:30; Sa 07:30-16:00".
// Basically, it recognises same times values and summarises the days (e.g. Mo-Fr).
function timeSummariser(stringsToSum) {
  let tempElements;
  for (let i = 0; i < stringsToSum.length; i++) {
    if (
      stringsToSum[i].match(
        /([0-1]?[0-9]|2[0-4]):[0-5][0-9]-([0-1]?[0-9]|2[0-4]):[0-5][0-9],([0-1]?[0-9]|2[0-4]):[0-5][0-9]\+/,
      ) !== null
    ) {
      tempElements = stringsToSum[i];
    }
  }
  if (tempElements !== undefined) {
    return stringsToSum;
  }
  for (let i = 0; i < stringsToSum.length; i++) {
    let reg = stringsToSum[i].match(
      /(((([0-1]?[0-9]|2[0-4]):[0-5][0-9]-([0-1]?[0-9]|2[0-4]):[0-5][0-9],)?(([0-1]?[0-9]|2[0-4]):[0-5][0-9]-)?(([0-1]?[0-9]|2[0-4]):[0-5][0-9]\+?))|off)/g,
    );
    reg = reg.toString();
    if (i !== stringsToSum.length - 1) {
      let j = i;
      let counter = 0;
      if (stringsToSum[j + 1].includes(reg)) {
        if (
          stringsToSum[j + 1].match(
            /([0-1]?[0-9]|2[0-4]):[0-5][0-9]-([0-1]?[0-9]|2[0-4]):[0-5][0-9],([0-1]?[0-9]|2[0-4]):[0-5][0-9]-([0-1]?[0-9]|2[0-4]):[0-5][0-9]/,
          ) === null
        ) {
          while (stringsToSum[j + 1].includes(reg)) {
            counter++;
            if (j < stringsToSum.length - 2) {
              j++;
            } else {
              break;
            }
          }
          if (counter !== 0) {
            let expr = stringsToSum[i].match(
              /([A-Z][a-z]-)?[A-Z]([A-Z]|[a-z])/g,
            );
            let expr2 = stringsToSum[i + counter].match(
              /([A-Z][a-z]-)?[A-Z]([A-Z]|[a-z])/g,
            );
            expr = expr.toString();
            expr = expr.charAt(0) + expr.charAt(1);
            expr2 = expr2.toString();
            expr2 =
              expr2.charAt(expr2.length - 2) + expr2.charAt(expr2.length - 1);
            let newStr = '';
            if (expr2 !== 'PH') {
              newStr = expr + '-' + expr2 + ' ' + reg;
            } else {
              let expr3 = expr2;
              expr2 = stringsToSum[i + counter - 1].match(
                /([A-Z][a-z]-)?[A-Z][a-z]/g,
              );
              expr2 = expr2.toString();
              if (expr === expr2) {
                newStr = expr2 + ',' + expr3 + ' ' + reg;
              } else {
                newStr = expr + '-' + expr2 + ',' + expr3 + ' ' + reg;
                if (
                  newStr.charAt(0) + newStr.charAt(1) ===
                  newStr.charAt(3) + newStr.charAt(4)
                ) {
                  newStr = newStr.slice(3);
                }
              }
            }
            stringsToSum.splice(i, counter + 1, newStr);
          }
        } else {
          if (
            reg.match(
              /([0-1]?[0-9]|2[0-4]):[0-5][0-9]-([0-1]?[0-9]|2[0-4]):[0-5][0-9],([0-1]?[0-9]|2[0-4]):[0-5][0-9]-([0-1]?[0-9]|2[0-4]):[0-5][0-9]/,
            ) !== null
          ) {
            while (stringsToSum[j + 1].includes(reg)) {
              counter++;
              if (j < stringsToSum.length - 2) {
                j++;
              } else {
                break;
              }
            }
            if (counter !== 0) {
              let expr = stringsToSum[i].match(
                /([A-Z][a-z]-)?[A-Z]([A-Z]|[a-z])/g,
              );
              let expr2 = stringsToSum[i + counter].match(
                /([A-Z][a-z]-)?[A-Z]([A-Z]|[a-z])/g,
              );
              expr = expr.toString();
              expr = expr.charAt(0) + expr.charAt(1);
              expr2 = expr2.toString();
              expr2 =
                expr2.charAt(expr2.length - 2) + expr2.charAt(expr2.length - 1);
              let newStr = '';
              if (expr2 !== 'PH') {
                newStr = expr + '-' + expr2 + ' ' + reg;
              } else {
                let expr3 = expr2;
                expr2 = stringsToSum[i + counter - 1].match(
                  /([A-Z][a-z]-)?[A-Z][a-z]/g,
                );
                expr2 = expr2.toString();
                newStr = expr + '-' + expr2 + ',' + expr3 + ' ' + reg;
              }
              stringsToSum.splice(i, counter + 1, newStr);
            }
          }
        }
      }
    }
  }
  return stringsToSum;
}

// This handler fixes day issues like "Mo – Fr 10.00 Uhr - 13.00 Uhr Mo - Fr 14.00 Uhr – 18.30 Uhr Sa. 10.00 – 15.00 Uhr" -> "Mo-Fr 10:00-13:00,14:00-18:30; Sa 10:00-15:00"
function daySummariser(dayStrings) {
  for (let i = 0; i < dayStrings.length - 1; i++) {
    let dayString1;
    let dayString2;
    if (
      dayStrings[i].match(
        /([A-Z][a-z]([-,]))([A-Z][a-z]([-,]))[A-Z]([A-Z]|[a-z])/g,
      ) !== null &&
      dayStrings[i + 1].match(
        /([A-Z][a-z]([-,]))([A-Z][a-z]([-,]))[A-Z]([A-Z]|[a-z])/g,
      ) !== null
    ) {
      dayString1 = dayStrings[i].match(
        /([A-Z][a-z]([-,]))([A-Z][a-z]([-,]))[A-Z]([A-Z]|[a-z])/g,
      );
      dayString2 = dayStrings[i + 1].match(
        /([A-Z][a-z]([-,]))([A-Z][a-z]([-,]))[A-Z]([A-Z]|[a-z])/g,
      );
      dayString1 = dayString1.toString();
      dayString2 = dayString2.toString();
      if (dayString1 === dayString2) {
        dayStrings[i + 1] = dayStrings[i + 1].replace(
          /([A-Z][a-z]([-,]))([A-Z][a-z]([-,]))[A-Z]([A-Z]|[a-z])\s/g,
          ',',
        );
        dayStrings[i] = dayStrings[i].concat(dayStrings[i + 1]);
        dayStrings[i + 1] = dayStrings[i + 2];
        dayStrings.pop();
        return dayStrings;
      }
    }
    if (
      dayStrings[i].match(/([A-Z][a-z]([-,]))[A-Z]([A-Z]|[a-z])/g) !== null &&
      dayStrings[i + 1].match(/([A-Z][a-z]([-,]))[A-Z]([A-Z]|[a-z])/g) !== null
    ) {
      dayString1 = dayStrings[i].match(/([A-Z][a-z]([-,]))[A-Z]([A-Z]|[a-z])/g);
      dayString2 = dayStrings[i + 1].match(
        /([A-Z][a-z]([-,]))[A-Z]([A-Z]|[a-z])/g,
      );
      dayString1 = dayString1.toString();
      dayString2 = dayString2.toString();
      if (dayString1 === dayString2) {
        dayStrings[i + 1] = dayStrings[i + 1].replace(
          /([A-Z][a-z]([-,]))[A-Z]([A-Z]|[a-z])\s/g,
          ',',
        );
        dayStrings[i] = dayStrings[i].concat(dayStrings[i + 1]);
        dayStrings[i + 1] = dayStrings[i + 2];
        dayStrings.pop();
        return dayStrings;
      }
    }
    if (
      dayStrings[i].match(/[A-Z]([A-Z]|[a-z])/g) !== null &&
      dayStrings[i + 1].match(/[A-Z]([A-Z]|[a-z])/g) !== null
    ) {
      dayString1 = dayStrings[i].match(/[A-Z]([A-Z]|[a-z])/g);
      dayString2 = dayStrings[i + 1].match(/[A-Z]([A-Z]|[a-z])/g);
      dayString1 = dayString1.toString();
      dayString2 = dayString2.toString();
      if (dayString1 === dayString2) {
        dayStrings[i + 1] = dayStrings[i + 1].replace(
          /[A-Z]([A-Z]|[a-z])\s/g,
          ',',
        );
        dayStrings[i] = dayStrings[i].concat(dayStrings[i + 1]);
        dayStrings[i + 1] = dayStrings[i + 2];
        dayStrings.pop();
        return dayStrings;
      }
    }
  }
  return dayStrings;
}

exports.convert = convert;
