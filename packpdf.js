const fs = require('fs')
const imagesToPdf = require("images-to-pdf")

function capitalize(word) {
	return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

async function packpdf(name) {
	const dir = `${__dirname}/images/${name}`

	if (!fs.existsSync(dir)) {
		console.log("not found")
		return
	}

	const packdir = `${__dirname}/pdf`
	const files = fs.readdirSync(dir).map(a => dir + "/" + a)
	pname = packdir + '/' + dname.split("/").map(a => capitalize(a)).join(" ") + '.pdf'

	console.log(`\nstart packing file ${files.length}`)

	await imagesToPdf(files, pname)
	fs.rmSync(dir, {force: true, recursive: true})
	console.log("Done: " + pname)
}

module.exports.packpdf = packpdf
