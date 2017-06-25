const lineLabels = ['Seconds',
  'Anger',
  'Contempt',
  'Disgust',
  'Fear',
  'Happiness',
  // 'Neutral',
  'Sadness',
  'Surprise' ]
const lineOptions = {
  title: 'Audience Reaction',
  curveType: 'function',
  legend: { position: 'right' },
  chartArea: {width: '60%'},
  crosshair: { trigger: 'both', color: 'grey'},
  vAxis: {
   title: "Average ",
    // viewWindowMode:'explicit',
    viewWindow:{
      min:0,
    },
  },
  animation: {
    duration: 1000,
    easing: 'out',
  },
}
const barLabels = lineLabels.slice(1);
const barOptions =  {
  title: 'BARS, YO!',
  chartArea: {width: '50%'},
  is3D: true,
  animation: {
    duration: 1000,
    easing: 'out',
  }
}

let lineChart, lineData, barChart, barData;

google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(createCharts);

function createCharts() {
  lineChart = new google.visualization.LineChart(document.getElementById('time-series'));
  barChart = new google.visualization.BarChart(document.getElementById('bar-chart'));
  google.visualization.events.addListener(lineChart, 'select', lineSelect);
}

function drawCharts() {
  const lineFormatted = lineFormat(imageData);
  const barFormatted = barFormat(lineFormatted);
  lineData = google.visualization.arrayToDataTable(lineFormatted);
  barData = google.visualization.arrayToDataTable(barFormatted);
  lineChart.draw(lineData, lineOptions);
  barChart.draw(barData, barOptions);
}

function lineSelect() {
  const selected = lineChart.getSelection()[0];
  if (selected && selected.row) {
    let idx = selected.row;
    $('.framePictureCanvas img').attr('src', `photos/${idx}.png`)
    // display prev and next text snippets
    let snippet = [];
    const next = phrases.indexOf(imageData[idx].time);
    if (next > 0) {
      snippet.push(phrases.slice(next - 1, next + 1))
    } else if (next === 0) {
      snippet.push(phrases[0])
    } else if (next === -1 && phrases.lenght) {
      snippet.push(phrases[phrases.length - 1]);
    }
    console.log('SNIP: ', snippet)
  }
}

// if equal or over
  // grab curr (if exists) and prev snippets

function lineFormat(imgData) {
  const data = [lineLabels];
  _.each(imgData, pic => {
    const faceScores = pic.emotions.map(face => face.scores);
    if (faceScores.length > 0) {
      const emotesTotal = faceScores.reduce((acc, face) => ({
        anger: face.anger + acc.anger,
        contempt: face.contempt + acc.contempt,
        disgust: face.disgust + acc.disgust,
        fear: face.fear + acc.fear,
        happiness: face.happiness + acc.happiness,
        // neutral: face.neutral + acc.neutral,
        sadness: face.sadness + acc.sadness,
        surprise: face.surprise + acc.surprise,
      }));
      emotesTotal.neutral !== undefined && delete emotesTotal.neutral;
      const emotesAvg = _.map(emotesTotal, emote => emote / pic.emotions.length);
      let time = millisToMinutesAndSeconds(pic.time)
      const result = [time, ...emotesAvg];
      data.push(result);
    }
  })
  return data;
}

function barFormat(lineData) {
  const frameCount = lineData.length - 1;
  const totals = lineData.slice(1)
                          .map(frame => frame.slice(1))
                          .reduce((acc, frame) => frame.map((emote, i) => emote + acc[i]))
  const averages = totals.map(emote => emote / frameCount);
  const formatted = averages.map((avg, i) => [barLabels[i], avg]);
  const sorted = formatted.sort((a, b) => b[1] - a[1])
  return [['y', 'x'], ...sorted];
}
