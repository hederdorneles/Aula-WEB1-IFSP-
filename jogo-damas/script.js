/*
  Jogo de Damas (Internacional) - Regras implementadas:

  - Tabuleiro 8x8 com casas pretas e brancas.
  - Peças brancas iniciam nas três primeiras linhas, peças pretas nas três últimas.
  - Movimento simples em diagonal para frente (peças normais).
  - Captura obrigatória: se houver peça inimiga adjacente com casa livre após ela, a captura é permitida.
  - Capturas múltiplas são permitidas, mas a peça só continua se ainda puder capturar.
  - Dama: quando uma peça chega à última linha adversária, é promovida a dama.
    - A dama se move e captura em qualquer direção diagonal, por quantas casas forem possíveis.
  - O turno só passa ao adversário se a peça capturadora não puder mais capturar.
  - Suporte a arrastar e soltar (drag and drop) para mover peças.
*/

const tabuleiro = document.querySelector('.tabuleiro');
const linhas = tabuleiro.querySelectorAll('.linha');
let vez = 'branca';
let emCapturaMultipla = false;
let pecaSelecionada = null;

document.getElementById('vez').textContent = 'Brancas';

for (let i = 0; i < 3; i++) {
    const casas = linhas[i].children;
    for (let j = 0; j < casas.length; j++) {
        if (casas[j].classList.contains('preta')) {
            const peca = document.createElement('div');
            peca.classList.add('peca', 'branca');
            peca.setAttribute('draggable', true);
            casas[j].appendChild(peca);
        }
    }
}
for (let i = 5; i < 8; i++) {
    const casas = linhas[i].children;
    for (let j = 0; j < casas.length; j++) {
        if (casas[j].classList.contains('preta')) {
            const peca = document.createElement('div');
            peca.classList.add('peca', 'preta');
            peca.setAttribute('draggable', true);
            casas[j].appendChild(peca);
        }
    }
}

function getCasa(i, j) {
    return linhas[i]?.children[j] || null;
}

function caminhoLivre(origem, destino, peca) {
    const i0 = Array.from(tabuleiro.children).indexOf(origem.parentElement);
    const j0 = Array.from(origem.parentElement.children).indexOf(origem);
    const i1 = Array.from(tabuleiro.children).indexOf(destino.parentElement);
    const j1 = Array.from(destino.parentElement.children).indexOf(destino);

    const di = Math.sign(i1 - i0);
    const dj = Math.sign(j1 - j0);

    let i = i0 + di;
    let j = j0 + dj;
    let encontrou = 0;
    let pecaAlvo = null;

    while (i !== i1 && j !== j1) {
        const casa = getCasa(i, j);
        const meio = casa?.querySelector('.peca');
        if (meio) {
            const cor = meio.classList.contains('branca') ? 'branca' : 'preta';
            const corAtual = peca.classList.contains('branca') ? 'branca' : 'preta';
            if (cor === corAtual) return false;
            if (pecaAlvo) return false;
            pecaAlvo = meio;
            encontrou++;
        }
        i += di;
        j += dj;
    }

    return true;
}

function posicaoValida(origem, destino, peca) {
    const i0 = Array.from(tabuleiro.children).indexOf(origem.parentElement);
    const j0 = Array.from(origem.parentElement.children).indexOf(origem);
    const i1 = Array.from(tabuleiro.children).indexOf(destino.parentElement);
    const j1 = Array.from(destino.parentElement.children).indexOf(destino);

    const linhaDelta = i1 - i0;
    const colunaDelta = j1 - j0;

    const destinoVazio = destino.children.length === 0;
    if (!destinoVazio) return false;

    const ehDama = peca.classList.contains('dama');
    if (ehDama) {
        return Math.abs(linhaDelta) === Math.abs(colunaDelta) && caminhoLivre(origem, destino, peca);
    }

    if (Math.abs(linhaDelta) === 1 && Math.abs(colunaDelta) === 1) {
        if (peca.classList.contains('branca')) return linhaDelta === 1;
        if (peca.classList.contains('preta')) return linhaDelta === -1;
    }

    if (Math.abs(linhaDelta) === 2 && Math.abs(colunaDelta) === 2) {
        const iMeio = (i0 + i1) / 2;
        const jMeio = (j0 + j1) / 2;
        const casaMeio = getCasa(iMeio, jMeio);
        const pecaAlvo = casaMeio?.querySelector('.peca');
        if (!pecaAlvo) return false;

        const cor = peca.classList.contains('branca') ? 'branca' : 'preta';
        const corAlvo = pecaAlvo.classList.contains('branca') ? 'branca' : 'preta';

        return cor !== corAlvo;
    }

    return false;
}

function podeCapturarMais(casaAtual, peca) {
    const i = Array.from(tabuleiro.children).indexOf(casaAtual.parentElement);
    const j = Array.from(casaAtual.parentElement.children).indexOf(casaAtual);
    const cor = peca.classList.contains('branca') ? 'branca' : 'preta';
    const inimigo = cor === 'branca' ? 'preta' : 'branca';

    const direcoes = [
        [-1, -1], [-1, 1],
        [1, -1], [1, 1]
    ];

    for (const [di, dj] of direcoes) {
        let ni = i + di;
        let nj = j + dj;
        while (ni >= 0 && ni < 8 && nj >= 0 && nj < 8) {
            const casa = getCasa(ni, nj);
            const pecaMeio = casa?.querySelector('.peca');
            if (pecaMeio && pecaMeio.classList.contains(inimigo)) {
                let ii = ni + di;
                let jj = nj + dj;
                while (ii >= 0 && ii < 8 && jj >= 0 && jj < 8) {
                    const destino = getCasa(ii, jj);
                    if (destino && destino.children.length === 0) {
                        return true;
                    } else if (destino?.querySelector('.peca')) {
                        break;
                    }
                    if (!peca.classList.contains('dama')) break;
                    ii += di;
                    jj += dj;
                }
                break;
            } else if (pecaMeio) {
                break;
            }
            if (!peca.classList.contains('dama')) break;
            ni += di;
            nj += dj;
        }
    }

    return false;
}

function promoverSeNecessario(peca, destino) {
    const linha = destino.parentElement;
    const i = Array.from(tabuleiro.children).indexOf(linha);
    if (peca.classList.contains('branca') && i === 7) {
        peca.classList.add('dama');
    } else if (peca.classList.contains('preta') && i === 0) {
        peca.classList.add('dama');
    }
}

function habilitarDragAndDrop() {
    document.querySelectorAll('.peca').forEach(peca => {
        peca.addEventListener('dragstart', e => {
            const cor = peca.classList.contains('branca') ? 'branca' : 'preta';
            if (cor !== vez && !emCapturaMultipla) return e.preventDefault();
            if (emCapturaMultipla && peca !== pecaSelecionada) return e.preventDefault();
            e.dataTransfer.setData('text/plain', '');
            peca.classList.add('dragging');
        });

        peca.addEventListener('dragend', e => {
            e.target.classList.remove('dragging');
            document.querySelectorAll('.destino-valido').forEach(c => c.classList.remove('destino-valido'));
        });
    });

    document.querySelectorAll('.casa.preta').forEach(casa => {
        casa.addEventListener('dragover', e => {
            e.preventDefault();
            const dragging = document.querySelector('.dragging');
            const origem = dragging.parentElement;
            if (posicaoValida(origem, casa, dragging)) {
                casa.classList.add('destino-valido');
            } else {
                casa.classList.remove('destino-valido');
            }
        });

        casa.addEventListener('dragleave', e => {
            e.target.classList.remove('destino-valido');
        });

        casa.addEventListener('drop', e => {
            e.preventDefault();
            const dragging = document.querySelector('.dragging');
            const origem = dragging.parentElement;
            const destino = e.target.classList.contains('casa') ? e.target : e.target.closest('.casa');

            if (!posicaoValida(origem, destino, dragging)) return;

            const i0 = Array.from(tabuleiro.children).indexOf(origem.parentElement);
            const j0 = Array.from(origem.parentElement.children).indexOf(origem);
            const i1 = Array.from(tabuleiro.children).indexOf(destino.parentElement);
            const j1 = Array.from(destino.parentElement.children).indexOf(destino);

            const di = Math.sign(i1 - i0);
            const dj = Math.sign(j1 - j0);

            let i = i0 + di;
            let j = j0 + dj;
            let pecaCapturada = null;

            while (i !== i1 && j !== j1) {
                const casa = getCasa(i, j);
                const alvo = casa.querySelector('.peca');
                if (alvo) {
                    pecaCapturada = alvo;
                    break;
                }
                i += di;
                j += dj;
            }

            if (pecaCapturada) pecaCapturada.remove();

            destino.appendChild(dragging);
            promoverSeNecessario(dragging, destino);

            if (pecaCapturada && podeCapturarMais(destino, dragging)) {
                emCapturaMultipla = true;
                pecaSelecionada = dragging;
            } else {
                vez = vez === 'branca' ? 'preta' : 'branca';
                document.getElementById('vez').textContent = vez === 'branca' ? 'Brancas' : 'Pretas';
                emCapturaMultipla = false;
                pecaSelecionada = null;
            }
        });
    });
}

habilitarDragAndDrop();
