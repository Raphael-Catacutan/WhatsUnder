const READING_SPEED = 2
class Main {
    constructor() {
        console.log("Game INITIATED")
        customElements.define('card-block', this.Card, { extends: 'div' })
        this.docID("play").addEventListener("click", this.launchGame)
    }
    launchGame = () => {
        console.log("Game STARTED")
        this.docID("main").style.display = "none"
        this.docID("game").style.display = "block"
        this.startGame()
    }
    startGame = () => {
        this.dif = []
        this.sim = []
        this.flipped = undefined
        this.revealed = 0
        this.normal = 0
        while (this.dif.length < 10) {
            const element = Math.floor(Math.random() * 25)
            if (this.dif.includes(element)) continue
            this.dif.push(element)
        }
        while (this.sim.length < 10) {
            const element = Math.floor(Math.random() * 25)
            if (this.dif.includes(element) || this.sim.includes(element)) continue
            this.sim.push(element)
        }

        this.diffs = []
        this.simms = []
        const difDup = [...this.dif]
        const simDup = [...this.sim]
        while (difDup.length > 0) this.diffs.push(difDup.splice(0, 2));
        while (simDup.length > 0) this.simms.push(simDup.splice(0, 2));

        console.log(this.dif);
        console.log(this.sim);
        for (let x = 0; x < 25; x++) {
            const partner = this.getPartner(x)
            const type = this.dif.includes(x) ? "df" : this.sim.includes(x) ? "sm" : "normal"
            this.docID("grid").append(new this.Card(type, x, this.sords(x), partner));
        }
        Array.from(document.getElementsByClassName('cards')).forEach(card => {
            card.addEventListener('click', () => {
                if (card.id == this.flipped) return
                card.classList.add('flipping')
                if (this.flipped != undefined) {
                    this.docID("blocker").style.display = "block"
                    if (card.partner == this.flipped) {
                        console.log(this.flipped, card.id, card.partner)
                        let info;
                        ++this.revealed
                        if (card.type == "df") {
                            this.docID('info-title').innerHTML = "You've found a pair of contrasting cards "
                            info = "The Unlucky Winners: <br>" + this.docID(`c${card.partnerIndex + 1}`).children[0].innerHTML + "<hr>" + "My Freaking Alarm: <br>" + this.docID(`c${card.partnerIndex + 1}`).children[2].innerHTML
                            this.docID(`c${card.partnerIndex + 1}`).children[0].style.color = "white"
                            this.docID(`c${card.partnerIndex + 1}`).children[2].style.color = "white"
                            this.docID(`c${card.partnerIndex + 1}`).children[0].style.opacity = 1
                            this.docID(`c${card.partnerIndex + 1}`).children[2].style.opacity = 1
                        } else if (card.type == "sm") {
                            this.docID('info-title').innerHTML = "You've found a pair of similar cards"
                            info = "The Unlucky Winners & My Freaking Alarm: <br>" + this.docID(`c${card.partnerIndex + 1}`).children[1].innerHTML
                            this.docID(`c${card.partnerIndex + 1}`).children[1].style.color = "white"
                            this.docID(`c${card.partnerIndex + 1}`).children[1].style.opacity = 1
                        }

                        const stay = (info.split(' ').length + 4) / READING_SPEED
                        this.docID('info-content').innerHTML = info
                        document.documentElement.style.setProperty('--infoStay', `${stay}s`);
                        this.docID("info").classList.add('infoShow')
                        this.docID("info").addEventListener("animationend", () => {
                            this.docID("info").style.left = '-50%'
                            this.docID("info").classList.remove('infoShow')
                            Array.from(document.getElementsByClassName('flipping')).forEach(fl => fl.classList.add("hidden"))
                            setTimeout(() => {
                                Array.from(document.getElementsByClassName('flipping')).forEach(fl => fl.style.visibility = "hidden")
                                this.flipped = undefined
                                this.gameOver()
                                this.docID("blocker").style.display = "none"
                            }, 500)
                        })
                    } else {
                        setTimeout(() => {
                            Array.from(document.getElementsByClassName('flipping')).forEach(fl => fl.classList.remove("flipping"))
                            this.flipped = undefined
                            this.gameOver()
                            this.docID("blocker").style.display = "none"
                        }, 500)
                    }
                } else {
                    this.flipped = card.id
                }
            })
        })
    }
    gameOver = () => {
        if (this.revealed != 10) return
        this.docID("blocker").style.display = "none"
        setTimeout(() => {
            Array.from(document.getElementsByClassName('cards')).forEach(card => card.remove())
            location.reload()
        }, 1000)
    }
    getPartner = (id) => {
        for (const partner of this.diffs) {
            if (partner[0] == id) return [partner[1], this.diffs.indexOf(partner),partner.indexOf(id)]
            else if (partner[1] == id) return [partner[0], this.diffs.indexOf(partner),partner.indexOf(id)]
        }
        for (const partner of this.simms) {
            if (partner[0] == id) return [partner[1], this.simms.indexOf(partner),partner.indexOf(id)]
            else if (partner[1] == id) return [partner[0], this.simms.indexOf(partner),partner.indexOf(id)]
        }
        return [undefined, this.normal++, 0]
    }
    sords = (id) => {
        const iString = id.toString()
        const iLastIn = iString.length - 1
        const sorround = [
            (iString[iLastIn] == 0) ? false : id - 1,
            (iString[0] == 9 && iLastIn) ? false : id + 10,
            (iString[iLastIn] == 9) ? false : id + 1,
            (iLastIn == 0) ? false : id - 10
        ]
        return sorround.filter(v => typeof (v) == 'number')
    }
    docID = (id) => { return document.getElementById(id) }
    Card = class Block extends HTMLDivElement {
        constructor(type, id, sorround, partner) {
            super()
            this.blockID = id
            this.id = id
            this.isFlip = false
            this.sords = sorround
            this.classList.add(type)
            this.classList.add('cards')
            this.type = type
            this.partner = partner?.[0]
            this.partnerIndex = partner?.[1]
            this.typeIndex = type == "df" ? partner?.[2] : 0
            console.log(`img/${type}-${this.partnerIndex}.0.png`)
            // FIXME: Panget tingnan test lang muna
            this.innerHTML = 
            `<div class="cardInner">
                <div class="cardFront"><span class="id">${this.id}</span></div> 
                <div class="cardBack" style="background-image:url('img/${type}-${this.partnerIndex}.${this.typeIndex}.png')"> </div>
            </div>`
        }
    }
}
