// Menu Hamburguer
const abrirMenu = document.getElementById('abrir-menu');
const fecharMenu = document.getElementById('fechar-menu');
const menuLateral = document.getElementById('menu-lateral');

abrirMenu.addEventListener('click', () => {
  menuLateral.classList.add('ativo');
});

fecharMenu.addEventListener('click', () => {
  menuLateral.classList.remove('ativo');
});

// Dropdown Produtos
const dropbtn = document.querySelector('.dropbtn');
const dropdown = document.querySelector('.dropdown-content');

dropbtn.addEventListener('click', (e) => {
  e.preventDefault();
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

// Fecha dropdown ao clicar fora
document.addEventListener('click', (e) => {
  if (!dropbtn.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

// Carrinho de Compras
const abrirCarrinhoBtn = document.getElementById('abrir-carrinho');
const contadorCarrinho = document.getElementById('contador-carrinho');

let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// Função para formatar preço para R$
function formatarPreco(valor) {
  return valor.toFixed(2).replace('.', ',');
}

// Atualiza contador do carrinho no ícone
function atualizarContador() {
  let quantidadeTotal = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  if (quantidadeTotal > 0) {
    contadorCarrinho.style.display = 'inline-block';
    contadorCarrinho.textContent = quantidadeTotal;
  } else {
    contadorCarrinho.style.display = 'none';
  }
}

// Redireciona para carrinho.html ao clicar no ícone
abrirCarrinhoBtn.addEventListener('click', () => {
  window.location.href = 'carrinho.html';
});

// Adicionar produto ao carrinho
document.querySelectorAll('.produto button').forEach((botao) => {
  botao.addEventListener('click', () => {
    const produtoDiv = botao.closest('.produto');
    const nome = produtoDiv.querySelector('h3').textContent;
    const precoTexto = produtoDiv.querySelector('p:not(.descricao)').textContent.replace('R$ ', '').replace(',', '.');
    const preco = parseFloat(precoTexto);
    const imagem = produtoDiv.querySelector('img').src;

    // Pega a descrição do produto, se existir
    const descricaoEl = produtoDiv.querySelector('.descricao');
    const descricao = descricaoEl ? descricaoEl.textContent : "";

    const itemExistente = carrinho.find(item => item.nome === nome);
    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      carrinho.push({ nome, preco, quantidade: 1, imagem, descricao });
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContador();

    // Feedback visual
    const originalText = botao.textContent;
    botao.textContent = 'Adicionado!';
    botao.style.backgroundColor = '#4CAF50';
    setTimeout(() => {
      botao.textContent = originalText;
      botao.style.backgroundColor = ''; // retorna ao original (#b76e79)
    }, 1500);
  });
});

// Atualiza o contador no carregamento da página
atualizarContador();
