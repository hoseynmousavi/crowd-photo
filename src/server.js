import bodyParser from "body-parser"
import express from "express"
import font2base64 from "node-font2base64"
import nodeHtmlToImage from "node-html-to-image"
import fs from "node:fs"
import path from "path"
import showNumber from "./showNumber.js"

const server = express()

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({extended: true}))
// TODO: should refactor this code and separated routing from server
server.route("/health/")
    .all((req, res) => {
        res.status(200).send({message: "ok"})
    })

server.route("/")
    .post((req, res) => {
        const {platform, title, expected_profit, duration_month, company, minimum_amount} = req.body || {}
        if (platform && title && expected_profit && duration_month && company && minimum_amount) {
            const logoImgExists = fs.existsSync(path.resolve(`./files/logos/${platform}.png`))
            if (logoImgExists) {
                const html = fs.readFileSync(path.resolve(`./files/index.html`)).toString()
                const fontSource = font2base64.encodeToDataUrlSync(path.resolve(`./files/font.woff2`))
                const templateImg = fs.readFileSync(path.resolve(`./files/template.png`))
                const templateSource = "data:image/jpeg;base64," + Buffer.from(templateImg).toString("base64")
                const logoImg = fs.readFileSync(path.resolve(`./files/logos/${platform}.png`))
                const logoSource = "data:image/jpeg;base64," + Buffer.from(logoImg).toString("base64")
                nodeHtmlToImage({
                    html,
                    content: {
                        templateSource,
                        logoSource,
                        fontSource,
                        platform,
                        title,
                        expected_profit,
                        duration_month,
                        company,
                        minimum_amount: showNumber(minimum_amount.toString()),
                    },
                    puppeteerArgs: {
                        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser",
                        args: ["--no-sandbox", "--disable-setuid-sandbox"],
                    },
                })
                    .then(image => {
                        res.writeHead(200, {"Content-Type": "image/png"})
                        res.end(image, "binary")
                    })
                    .catch(err => {
                        res.status(500).send({message: err?.message ?? "i just shut the fuck up.", err})
                        console.error(err?.message, err)
                    })
            }
            else {
                res.status(400).send({message: "no file for platform!"})
            }
        }
        else {
            res.status(400).send({message: "shit!"})
        }
    })

server.listen(6500, () => {
    console.log(`server is running on port ${6500}`)
})
