// Next write this https://www.npmjs.com/package/csv-writer
var readline = require('readline');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
}

const THE_LAST_VALUE = 'THE_LAST_VALUE'

const randomString = () => Math.random().toString(36).substring(10)

const randomValue = () => {
	const randomVal = getRandomInt(5)
	if (randomVal === 0) {
		return Math.random()
	} else if (randomVal === 1) {
		return randomString()
	} else if (randomVal === 2) {
		return [Math.random()]
	} else if (randomVal === 3) {
		return {}
	} if (randomVal === 4) {
		return new Date()
	}
}

const sample = (arr) => arr[getRandomInt(arr.length)]

const generateRandomArray = (size) => new Array(size).fill(null).map(() => randomValue()).concat(THE_LAST_VALUE)
const generateRandomStringArray = (size) => new Array(size).fill(null).map(() => randomString()).concat(THE_LAST_VALUE)
const generateRandomObject = (size) => {
  return new Array(size)
    .fill(null)
    .reduce((obj) => {
      obj[randomString()] = randomString()
      return obj
    }, {})
}

function find(arr, lookup) {
	return arr.find((something) => THE_LAST_VALUE === lookup)
}

function includes(arr, lookup) {
	return arr.includes(lookup)
}

function lookupObj(obj, key) {
	return obj[key]
}

function profileFunc(label, func, generateData, generateLookup, size) {
  console.log('PROFILE_START')
	console.log(size)
	console.log(label)
  let data = generateData()
	for (var i = 0; i < 100; i++) {
    let lookup = generateLookup(data)
		console.time('time')
		func(data, lookup)
		console.timeEnd('time')
	}

  console.log('PROFILE_END')
}

function main() {
	[100, 1000, 10000].forEach((size) => {
		profileFunc('.find() on random item array', find, () => generateRandomArray(size), (data) => getRandomInt(data.length), size)
	  profileFunc('.find() on all string array', find, () => generateRandomStringArray(size), (data) => getRandomInt(data.length), size)
	  profileFunc('.includes() on random item array', includes, () => generateRandomArray(size), (data) => getRandomInt(data.length), size)
	  profileFunc('.includes() on all string array', includes, () => generateRandomStringArray(size), (data) => getRandomInt(data.length), size)
	  profileFunc('lookup key in object', lookupObj, () => generateRandomObject(size), (data) => {
	    const keys = Object.keys(data)
	    return keys[getRandomInt(keys.length)]
	  }, size)
	})
}

const last = (arr) => arr[arr.length - 1]

function median(values){
    values.sort(function(a,b){
    return a-b;
  });

  if(values.length ===0) return 0

  var half = Math.floor(values.length / 2);

  if (values.length % 2)
    return values[half];
  else
    return (values[half - 1] + values[half]) / 2.0;
}

function mean(values) {
  return values.reduce((a, b) => a + b, 0) / values.length
}

// HACK TO KEEP EVERYTHING IN ONE FILE.
// RUN THE FILE AND PIPE IT TO ITSELF
if (process.argv[2] === 'read-stdin') {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  const stats = []
  let lineType = null
  rl.on('line', function(line) {
    if (line === 'PROFILE_START') {
      stats.push({ label: null, datapoints: [] })
      lineType = 'size'
    } else if (line === 'PROFILE_END') {
			const precision = 2
      last(stats).mean = mean(last(stats).datapoints).toPrecision(precision)
      last(stats).median = median(last(stats).datapoints).toPrecision(precision)
      delete last(stats).datapoints
    } else if (lineType == 'size') {
			last(stats).size = line
			lineType = 'label'
		} else if (lineType == 'label') {
      last(stats).label = line
      lineType = 'data'
    } else if (lineType === 'data') {
      last(stats).datapoints.push(
        parseFloat(line.split(':')[1].trim())
      )
    }
  })

  rl.on('close', function(line) {
		writeCsv('./perf.csv', stats)
  })
} else {
  main()
}

function writeCsv(filepath, arr) {
	const csvWriter = createCsvWriter({
		path: filepath,
		header: Object.keys(arr[0]).map((key) => ({ id: key, title: key }))
	});

	csvWriter.writeRecords(arr).then(() => { console.log('Done Writing Csv') })
}
