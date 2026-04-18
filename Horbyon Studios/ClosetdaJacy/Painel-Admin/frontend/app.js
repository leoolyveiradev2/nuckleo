// Config
const API_BASE = 'http://localhost:8000';
let editingId = null;

class AdminPanel {
    constructor() {
        this.init();
    }

    async init() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/';
            return;
        }
        
        document.getElementById('logout-btn').onclick = () => this.logout();
        document.getElementById('add-new-btn').onclick = () => this.showForm();
        document.getElementById('cancel-edit').onclick = () => this.cancelEdit();
        document.getElementById('produto-form').onsubmit = (e) => this.saveProduto(e);
        
        await this.loadProdutos();
        await this.updateStockStatus(); // From previous system
    }

    async apiRequest(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': options.body instanceof FormData ? 'multipart/form-data' : 'application/json'
        };
        
        const res = await fetch(`${API_BASE}${endpoint}`, options);
        if (res.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        return res;
    }

    async loadProdutos() {
        try {
            this.showLoading(true);
            const res = await this.apiRequest('/produtos/');
            const produtos = await res.json();
            this.renderTable(produtos);
        } catch (err) {
            this.showMessage('Erro ao carregar produtos', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderTable(produtos) {
        const tbody = document.getElementById('produtos-tbody');
        tbody.innerHTML = produtos.map(p => `
            <tr>
                <td><img src="/uploads/${p.imagem || 'no-image.jpg'}" alt="${p.nome}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiNFRkVGRkYiLz4KPHRleHQgeD0iMjUiIHk9IjMyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTk5OTkiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K'"></td>
                <td>${p.nome}</td>
                <td>R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</td>
                <td>${p.estoque}</td>
                <td>${p.categoria || '-'}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="admin.edit(${p.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="admin.delete(${p.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async saveProduto(e) {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('nome', document.getElementById('nome').value);
            formData.append('descricao', document.getElementById('descricao').value);
            formData.append('preco', document.getElementById('preco').value);
            formData.append('estoque', document.getElementById('estoque').value);
            formData.append('categoria', document.getElementById('categoria').value);
            const imagemFile = document.getElementById('imagem').files[0];
            if (imagemFile) formData.append('imagem', imagemFile);

            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/produtos/${editingId}` : '/produtos/';
            
            const res = await this.apiRequest(url, { method, body: formData });
            if (res.ok) {
                this.showMessage(editingId ? 'Produto atualizado!' : 'Produto adicionado!', 'success');
                this.resetForm();
                await this.loadProdutos();
            }
        } catch (err) {
            this.showMessage('Erro ao salvar produto', 'error');
        }
    }

    async edit(id) {
        try {
            const res = await this.apiRequest(`/produtos/${id}`);
            const produto = await res.json();
            document.getElementById('produto-id').value = produto.id;
            document.getElementById('nome').value = produto.nome;
            document.getElementById('descricao').value = produto.descricao || '';
            document.getElementById('preco').value = produto.preco;
            document.getElementById('estoque').value = produto.estoque;
            document.getElementById('categoria').value = produto.categoria || '';
            document.getElementById('form-title').textContent = 'Editar Produto';
            document.getElementById('cancel-edit').style.display = 'block';
            editingId = id;
            document.getElementById('form-section').style.display = 'block';
            document.getElementById('lista-section').style.display = 'none';
        } catch (err) {
            this.showMessage('Erro ao carregar produto', 'error');
        }
    }

    async delete(id) {
        if (!confirm('Confirma exclusão do produto?')) return;
        try {
            const res = await this.apiRequest(`/produtos/${id}`, { method: 'DELETE' });
            if (res.ok) {
                this.showMessage('Produto deletado!', 'success');
                await this.loadProdutos();
            }
        } catch (err) {
            this.showMessage('Erro ao deletar', 'error');
        }
    }

    showForm() {
        this.resetForm();
        document.getElementById('form-title').textContent = 'Adicionar Produto';
        document.getElementById('cancel-edit').style.display = 'none';
        editingId = null;
        document.getElementById('form-section').style.display = 'block';
        document.getElementById('lista-section').style.display = 'none';
    }

    cancelEdit() {
        this.resetForm();
        document.getElementById('form-section').style.display = 'none';
        document.getElementById('lista-section').style.display = 'block';
    }

    resetForm() {
        document.getElementById('produto-form').reset();
        document.getElementById('produto-id').value = '';
        editingId = null;
    }

    logout() {
        localStorage.removeItem('token');
        window.location.href = '/';
    }

    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'flex' : 'none';
    }

    showMessage(text, type) {
        const msg = document.getElementById('message');
        msg.textContent = text;
        msg.className = `message ${type}`;
        msg.style.display = 'block';
        setTimeout(() => msg.style.display = 'none', 4000);
    }
}

const admin = new AdminPanel();

