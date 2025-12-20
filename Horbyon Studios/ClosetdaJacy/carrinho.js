// CARRINHO DE COMPRAS
// Carregar carrinho salvo ou vazio
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

// Função para formatar preço em R$
function formatarPreco(valor) {
  return valor.toFixed(2).replace(".", ",");
}

// Renderizar lista de produtos no carrinho
function renderizarCarrinho() {
  const lista = document.getElementById("lista-produtos");
  lista.innerHTML = "";

  if (carrinho.length === 0) {
    lista.innerHTML = "<p>Seu carrinho está vazio.</p>";
    atualizarTotais();
    return;
  }

  carrinho.forEach((item, index) => {
    const li = document.createElement("li");
    li.classList.add("item-carrinho");

    li.innerHTML = `
      <div class="produto-info">
        <img src="${item.imagem}" alt="${item.nome}">
        <div>
          <h3>${item.nome}</h3>
          <p class="descricao">${item.descricao || "Produto sem descrição."}</p>
          <p class="preco">R$ ${formatarPreco(item.preco)}</p>
        </div>
      </div>
      <div class="acoes">
        <button class="diminuir">-</button>
        <span>${item.quantidade}</span>
        <button class="aumentar">+</button>
        <button class="remover">Remover</button>
      </div>
    `;

    // Ações dos botões
    li.querySelector(".aumentar").addEventListener("click", () => {
      item.quantidade++;
      salvarCarrinho();
    });

    li.querySelector(".diminuir").addEventListener("click", () => {
      if (item.quantidade > 1) {
        item.quantidade--;
      } else {
        carrinho.splice(index, 1);
      }
      salvarCarrinho();
    });

    li.querySelector(".remover").addEventListener("click", () => {
      carrinho.splice(index, 1);
      salvarCarrinho();
    });

    lista.appendChild(li);
  });

  atualizarTotais();
}

// Atualizar totais no resumo
function atualizarTotais() {
  const quantidadeTotal = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  const subtotal = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  const total = subtotal; // sem taxa extra

  document.getElementById("quantidade-total").textContent = quantidadeTotal;
  document.getElementById("subtotal").textContent = formatarPreco(subtotal);
  document.getElementById("total-carrinho").textContent = formatarPreco(total);
}

// Salvar alterações no carrinho
function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  renderizarCarrinho();
}

// Finalizar compra via WhatsApp
document.getElementById("finalizar-compra").addEventListener("click", () => {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  let mensagem = "Olá, gostaria de finalizar a compra:%0A%0A";

  carrinho.forEach(item => {
    mensagem += `- ${item.nome} (R$ ${formatarPreco(item.preco)}) x ${item.quantidade}%0A`;
  });

  const subtotal = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  const total = subtotal; // total final correto

  mensagem += `%0ASubtotal: R$ ${formatarPreco(subtotal)}`;
  mensagem += `%0AFrete: Grátis`;
  mensagem += `%0ATotal: R$ ${formatarPreco(total)}`;

  const numeroWhatsapp = "5584997050106"; // número da sua irmã
  const urlWhatsApp = `https://wa.me/${numeroWhatsapp}?text=${mensagem}`;

  window.open(urlWhatsApp, "_blank");
});

// Inicializar carrinho ao carregar página
renderizarCarrinho();

document.querySelectorAll('.dropbtn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const dropdown = btn.nextElementSibling;
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  });
});
