const fs = require('fs')
const imagesToPdf = require("images-to-pdf")

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

module.exports.packpdf = packpdf
