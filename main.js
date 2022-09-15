const parse = require('node-html-parser').parse;
const axios = require('axios');
const fs = require('fs')
const Path = require('path')
const imagesToPdf = require("images-to-pdf")

const base = "http://viewcartoon.com/manga/"

const sleepTime = 500

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

		console.log({img})
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

async function packpdf(name) {
	const dir = `${__dirname}/images/${name}`

	if (!fs.existsSync(dir)) {
		console.log("not found")
		return
	}

	const packdir = `${__dirname}/pdf`
	const files = fs.readdirSync(dir).map(a => dir + "/" + a)
	pname = packdir + '/' + dname.split("/").join("-") + '.pdf'

	console.log(`start packing file ${files.length}`)

	await imagesToPdf(files, pname)
	console.log("done " + pname)
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

	console.log({ start, last })
	for (i = start; i <= last; i++) {
		console.log(`downloading ${i}/${last}`)

		const isLast = i == last
		await download(name, volume, i, isLast)
	}
}

async function main() {
	// for (volume = 9035; volume > 9002; volume--) {
		volume = 9003
		start = 1
		await startDownload("berserk", volume.toString(), start)
	// }
}

main()