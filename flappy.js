function novoElemento(tagName, className){
    const elemento = document.createElement(tagName)
    elemento.className = className
    return elemento
}

function Barreira(reversa = false){
    this.elemento = novoElemento('div','barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')

    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

function ParDeBarreira(altura, abertura, x){
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.barreiraSuperior = new Barreira(true)
    this.barreiraInferior = new Barreira(false)

    this.elemento.appendChild(this.barreiraSuperior.elemento)
    this.elemento.appendChild(this.barreiraInferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.barreiraSuperior.setAltura(alturaSuperior)
        this.barreiraInferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

// const b = new ParDeBarreira(700, 350, 400)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function Barreiras(altura, largura, abertura, espaco, notificarPonto){
    this.pares = [
        new ParDeBarreira(altura, abertura, largura),
        new ParDeBarreira(altura, abertura, largura + espaco),
        new ParDeBarreira(altura, abertura, largura + 2 * espaco),
        new ParDeBarreira(altura, abertura, largura + 3 * espaco),
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            //quando o elemento sair da área de jogo
            if(par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio
                                && par.getX() < meio
             cruzouOMeio && notificarPonto()
        })
    }
}

function Passaro(alturaJogo){
    let voando = false

    this.elemento = new novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true    
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if(novoY <= 0)
            this.setY(0)
        else if(novoY >= alturaMaxima){
            console.log('altura max '+this.elemento.clientHeight)
            console.log(this.getY())
            this.setY(alturaMaxima)
        }
        else
            this.setY(novoY)   
    }
    this.setY(alturaJogo / 2)
}

function Progresso(){
    this.elemento = novoElemento('span','progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function estaoSobresposto(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()
    
    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

function colidiu(passaro, barreiras){
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if(!colidiu){
            const superior = parDeBarreiras.barreiraSuperior.elemento
            const inferior = parDeBarreiras.barreiraInferior.elemento
            colidiu = estaoSobresposto(passaro.elemento, superior) 
                   || estaoSobresposto(passaro.elemento, inferior)
        }
    })

    return colidiu
}

function FlappyBird(){
    let pontos = 0 

    const areaDoJogo = document.querySelector('[wm-flappy')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()     
    const barreiras = new Barreiras(altura, largura, 300, 400, () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
    
    this.start = () => {
        const temporizador = setInterval(()=>{
            barreiras.animar()
            passaro.animar()

            if(colidiu(passaro,barreiras)){
                clearInterval(temporizador)
            }
        },20)
    }
}

new FlappyBird().start()
