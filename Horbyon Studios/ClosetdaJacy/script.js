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
function updateStockStatus() {
  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  const totalVendido = {};
  carrinho.forEach(item => {
    totalVendido[item.nome] = (totalVendido[item.nome] || 0) + item.quantidade;
  });

  document.querySelectorAll('.produto[data-product-name]').forEach(produto => {
    const nome = produto.dataset.productName;
    const initialStock = parseInt(produto.dataset.initialStock);
    const vendido = totalVendido[nome] || 0;
    const precoEl = produto.querySelector('.preco .stock-status');
    const btn = produto.querySelector('.comprar-btn');
    
    if (vendido >= initialStock) {
      precoEl.textContent = '(Esgotado)';
      precoEl.style.color = '#999';
      precoEl.style.fontSize = '12px';
      btn.disabled = true;
      btn.textContent = 'Indisponível';
      btn.style.background = '#ccc';
      btn.style.cursor = 'not-allowed';
    } else {
      precoEl.textContent = '';
      btn.disabled = false;
      btn.textContent = 'Comprar';
      btn.style.background = '';
      btn.style.cursor = 'pointer';
    }
  });
}

document.querySelectorAll('.comprar-btn, .produto button').forEach((botao) => {
  botao.addEventListener('click', () => {
    const produtoDiv = botao.closest('.produto');
    const nome = produtoDiv.dataset.productName || produtoDiv.querySelector('h3').textContent;
    const initialStock = parseInt(produtoDiv.dataset.initialStock) || 99;
    
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const vendido = carrinho.filter(item => item.nome === nome).reduce((acc, item) => acc + item.quantidade, 0);
    
    if (vendido >= initialStock) {
      alert('Produto esgotado!');
      return;
    }
    
    const precoTexto = produtoDiv.querySelector('p:not(.descricao) b').textContent.replace('R$ ', '').replace(',', '.');
    const preco = parseFloat(precoTexto);
    const imagem = produtoDiv.querySelector('img').src;
    const descricaoEl = produtoDiv.querySelector('.descricao');
    const descricao = descricaoEl ? descricaoEl.textContent : '';

    const itemExistente = carrinho.find(item => item.nome === nome);
    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      carrinho.push({ nome, preco, quantidade: 1, imagem, descricao });
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContador();
    updateStockStatus(); // Update após compra

    // Feedback
    const originalText = botao.textContent;
    botao.textContent = 'Adicionado!';
    botao.style.backgroundColor = '#4CAF50';
    setTimeout(() => {
      botao.textContent = originalText;
      botao.style.backgroundColor = '';
    }, 1500);
  });
});

// Search Filter Avançada (estilo Shein/Mercado Livre) + Sem Resultados
const searchInput = document.getElementById('searchInput');
const noResults = document.getElementById('noResults');
if (searchInput && noResults) {
  let timeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const termo = e.target.value.toLowerCase().trim();
      if (termo.length < 2) {
        document.querySelectorAll('.produto').forEach(p => p.style.display = '');
        noResults.style.display = 'none';
        return;
      }
      
      let encontrou = 0;
      document.querySelectorAll('.produto').forEach(produto => {
        const h3 = produto.querySelector('h3').textContent.toLowerCase();
        const desc = (produto.querySelector('.descricao')?.textContent || '').toLowerCase();
        const match = h3.includes(termo) || desc.includes(termo);
        produto.style.display = match ? '' : 'none';
        if (match) encontrou++;
      });
      
      noResults.style.display = encontrou === 0 ? '' : 'none';
      
      // Feedback input
      if (encontrou === 0) {
        searchInput.style.backgroundColor = '#fee';
        setTimeout(() => searchInput.style.backgroundColor = '', 1500);
      }
    }, 250); // Debounce
  });
}

// Atualiza o contador no carregamento da página
atualizarContador();


