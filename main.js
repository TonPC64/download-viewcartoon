const parse = require('node-html-parser').parse;
const axios = require('axios');
const fs = require('fs')
const Path = require('path')
const { packpdf } = require('./packpdf.js')
const cliProgress = require('cli-progress');
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);


const base = "http://viewcartoon.com/manga/"
let sleepTime = 500

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function downloadImage(url, filename) {
	dname = filename.split("/")
	dname.pop()
	dname = dname.join("/")

	const dir = `${__dirname}/images/${dname}`
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	const path = Path.resolve(__dirname, 'images', filename)
	const writer = fs.createWriteStream(path)

	const response = await axios({
		url,
		method: 'GET',
		responseType: 'stream'
	})

	response.data.pipe(writer)

	return new Promise((resolve, reject) => {
		writer.on('finish', resolve)
		writer.on('error', reject)
	})
}

async function download(name, volume, page, last) {
	const input = `${base}view.php?nme=${name}&vol=${volume}`
	const uri = `${input}&pg=${page}`

	const res = await axios.get(uri)
	if (res.status == 200) {
		const root = parse(res.data)

		let img
		if (last) {
			img = root.childNodes[2].childNodes[3].childNodes[2].childNodes[0].attrs.src
		} else {
			img = root.childNodes[2].childNodes[3].childNodes[2].childNodes[0].childNodes[0].attrs.src
		}

		// console.log({ img })
		if (!img) {
			return
		}

		const filepath = `${__dirname}/images/${img}`
		if (!fs.existsSync(filepath)) {
			await downloadImage(base + img, img)

			await sleep(sleepTime);
		}

		if (last) {
			dname = img.split("/")
			dname.pop()
			dname = dname.join("/")

			await packpdf(dname)
		}
	} else {
		console.log(`statusCode: ${res.status}`);
	}
}

async function startDownload(name, volume, s) {
	const uri = `${base}view.php?nme=${name}&vol=${volume}`

	let start = s
	let last
	if (!last) {
		res = await axios.get(uri)
		if (res.status == 200) {
			const root = parse(res.data)
			const tag = root.childNodes[2].childNodes[3].childNodes[1].childNodes[0].text

			let tt = tag.toString().split(" | ")
			last = +tt[1].split("/")[1]
		}
	}

	// console.log({ start, last })

	bar1.start(last, start);
	for (let i = start; i <= last; i++) {
		bar1.update(i);

		const isLast = i == last
		await download(name, volume, i, isLast)
	}
	bar1.stop();
}

async function main() {
	let name = ""
	let volume = ""
	let volumeEnd = ""
	let start = 1

	var args = process.argv.slice(2);

	if (args[0]) {
		name = args[0]
	}
	if (args[1]) {
		v = args[1]
		vv = v.split("-")
		volume = +vv[0]
		volumeEnd = volume
		if (vv[1]) {
			volumeEnd = +vv[1]
			console.log({ volume, volumeEnd })
		}
	}
	if (args[2]) {
		start = +args[2]
	}

	if (name == "" && volume == "") {
		console.log("no name and volume");
		return;
	}

	for (let vl = volume; vl <= volumeEnd; vl++) {
		console.log({ name, vl: vl.toString(), start })
		await startDownload(name, vl.toString(), start)
	}
}

main()