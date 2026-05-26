import React, { useState } from 'react';

export default function ScreenPerfil() {
  const [activeTab, setActiveTab] = useState('visao-geral');

  // Dados fictícios simulando o usuário do NuckleO
  const user = {
    name: "Gamer NuckleO",
    tag: "@nuckleo_user",
    bio: "Organizando minhas ideias, aprendendo desenvolvimento e evoluindo um passo de cada vez. 🚀🎮",
    avatar: "./photos/logofaviconNuckleo.svg", // Substitua pela imagem real de perfil posterior
    stats: [
      { label: "Itens Criados", value: "42" },
      { label: "Espaços Ativos", value: "8" },
      { label: "Dias Seguidos", value: "15" }
    ],
    recentItems: [
      { id: 1, title: "Estudar Design Tokens CSS", type: "Estudo", date: "Hoje" },
      { id: 2, title: "Configurar Top Bar Component", type: "Dev", date: "Ontem" },
      { id: 3, title: "Análise de Gameplay Free Fire", type: "Gaming", date: "3 dias atrás" }
    ]
  };

  return (
    <div className="profile-container animate-fade-in">
      
      {/* 1. HEADER DO PERFIL (Banner e Foto) */}
      <div className="profile-header">
        <div className="profile-cover"></div>
        <div className="profile-info-bar">
          <div className="profile-avatar-wrapper">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="profile-avatar-img"
              onError={(e) => { e.target.src = "https://via.placeholder.com/150/1A1A1A/A7F24A?text=N" }}
            />
          </div>
          
          <div className="profile-user-details">
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-tag">{user.tag}</p>
            <p className="profile-bio">{user.bio}</p>
          </div>

          <div className="profile-actions">
            <button className="btn-edit-profile">Editar Perfil</button>
          </div>
        </div>
      </div>

      {/* 2. LINHA DE ESTATÍSTICAS (Métricas do Usuário) */}
      <div className="profile-stats-row">
        {user.stats.map((stat, index) => (
          <div key={index} className="profile-stat-card">
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* 3. ABAS DE NAVEGAÇÃO INTERNA */}
      <div className="profile-tabs-nav">
        <button 
          className={`tab-btn ${activeTab === 'visao-geral' ? 'active' : ''}`}
          onClick={() => setActiveTab('visao-geral')}
        >
          Visão Geral
        </button>
        <button 
          className={`tab-btn ${activeTab === 'conquistas' ? 'active' : ''}`}
          onClick={() => setActiveTab('conquistas')}
        >
          Conquistas
        </button>
      </div>

      {/* 4. CONTEÚDO DINÂMICO DAS ABAS */}
      <div className="profile-tab-content">
        {activeTab === 'visao-geral' && (
          <div className="overview-grid">
            <div className="overview-card">
              <h3>Atividades Recentes</h3>
              <div className="activity-list">
                {user.recentItems.map(item => (
                  <div key={item.id} className="activity-item">
                    <div className="activity-indicator"></div>
                    <div className="activity-details">
                      <p className="activity-title">{item.title}</p>
                      <span className="activity-tag">{item.type}</span>
                    </div>
                    <span className="activity-date">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="overview-card status-card">
              <h3>Nível de Evolução</h3>
              <div className="progress-wrapper">
                <div className="progress-info">
                  <span>Level 4</span>
                  <span>75% para o próximo nível</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: '75%' }}></div>
                </div>
              </div>
              <p className="status-tip">Dica: Complete mais 3 itens hoje para ganhar bônus de sequência!</p>
            </div>
          </div>
        )}

        {activeTab === 'conquistas' && (
          <div className="conquistas-grid">
            <div className="badge-card unlocked">
              <div className="badge-icon">🔥</div>
              <h4>Foco Total</h4>
              <p>Completou itens por 7 dias seguidos.</p>
            </div>
            <div className="badge-card unlocked">
              <div className="badge-icon">🛠️</div>
              <h4>Arquiteto</h4>
              <p>Criou seu primeiro espaço customizado.</p>
            </div>
            <div className="badge-card locked">
              <div className="badge-icon">👑</div>
              <h4>Mestre do NuckleO</h4>
              <p>Chegue ao nível 10 da plataforma.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}