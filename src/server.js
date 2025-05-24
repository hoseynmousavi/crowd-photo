import bodyParser from "body-parser"
import express from "express"
import multer from "multer"
import font2base64 from "node-font2base64"
import nodeHtmlToImage from "node-html-to-image"
import fs from "node:fs"
import path from "path"

const server = express()
const upload = multer()

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({extended: true}))

server.route("/health/")
    .all((req, res) => {
        res.status(200).send({message: "ok"})
    })

server.post("/", upload.single("bg_img"), (req, res) => {
    const {platform, expected_profit, warranty_type, duration_month} = req.body || {}
    const bg_img = req?.file
    if (platform && expected_profit && warranty_type && duration_month && bg_img) {
        const logoImgExists = fs.existsSync(path.resolve(`./files/logos/${platform}.png`))
        if (logoImgExists) {
            const html = fs.readFileSync(path.resolve(`./files/index.html`)).toString()
            const fontSource = font2base64.encodeToDataUrlSync(path.resolve(`./files/DanaVF.woff2`))
            const templateImg = fs.readFileSync(path.resolve(`./files/template.png`))
            const templateSource = "data:image/png;base64," + Buffer.from(templateImg).toString("base64")
            const bgSource = "data:image/png;base64," + Buffer.from(bg_img.buffer).toString("base64")
            const logoImg = fs.readFileSync(path.resolve(`./files/logos/${platform}.png`))
            const logoSource = "data:image/png;base64," + Buffer.from(logoImg).toString("base64")
            const medal = warranty_type.includes("بانک") ? "gold" : warranty_type.includes("صندوق") ? "silver" : "bronze"
            const medalImg = fs.readFileSync(path.resolve(`./files/${medal}.png`))
            const medalSource = "data:image/png;base64," + Buffer.from(medalImg).toString("base64")
            const warranty =
                warranty_type.includes("بانک") ?
                    "ضمانت نامه بانک"
                    :
                    warranty_type.includes("صندوق") ?
                        "ضمانت نامه صندوق"
                        :
                        warranty_type
            nodeHtmlToImage({
                html,
                content: {
                    templateSource,
                    logoSource,
                    fontSource,
                    bgSource,
                    platform,
                    expected_profit,
                    duration_month,
                    warranty,
                    medalSource,
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
