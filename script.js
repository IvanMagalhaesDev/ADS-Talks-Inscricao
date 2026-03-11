

'use strict';

/* ── Estado ── */
let participantes = []; // array de objetos participante
let proximoId = 1;

/* ── Objeto participante ── */
function criarParticipante(dados) {
  return {
    id:       proximoId++,
    nome:     dados.nome.trim(),
    email:    dados.email.trim().toLowerCase(),
    presenca: dados.presenca,
    ingresso: dados.ingresso,
    topicos:  dados.topicos,
  };
}

/* ── Relógio ── */
function iniciarRelogio() {
  const el = document.getElementById('datetime');
  if (!el) return;
  const atualizar = () => {
    el.textContent = new Date().toLocaleString('pt-BR', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };
  atualizar();
  setInterval(atualizar, 1000);
}

/* ── Boas-vindas ── */
function boasVindas() {
  const el = document.getElementById('welcome');
  if (!el) return;
  const h = new Date().getHours();
  const s = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  el.textContent = `${s}! Bem-vindo ao ADSTalks — garanta sua vaga! 🎤`;
  el.hidden = false;
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = '0.5s'; }, 5000);
  setTimeout(() => el.remove(), 5500);
}

/* ── Validação ── */
function validar(dados) {
  let ok = true;

  // Limpa erros anteriores
  ['nome', 'email', 'ingresso'].forEach(id => {
    document.getElementById(id).classList.remove('invalido');
    document.getElementById('erro-' + id).textContent = '';
  });

  if (dados.nome.length < 2) {
    document.getElementById('nome').classList.add('invalido');
    document.getElementById('erro-nome').textContent = 'Informe seu nome completo.';
    ok = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
    document.getElementById('email').classList.add('invalido');
    document.getElementById('erro-email').textContent = 'Informe um e-mail válido.';
    ok = false;
  }
  if (!dados.ingresso) {
    document.getElementById('ingresso').classList.add('invalido');
    document.getElementById('erro-ingresso').textContent = 'Selecione o tipo de ingresso.';
    ok = false;
  }

  return ok;
}

/* ── Renderizar lista ── */
function renderizar() {
  const lista    = document.getElementById('lista');
  const vazio    = document.getElementById('vazio');
  const contador = document.getElementById('contador');

  contador.textContent = `(${participantes.length})`;
  vazio.style.display  = participantes.length ? 'none' : 'block';
  lista.innerHTML      = '';

  participantes.forEach(p => {
    const li = document.createElement('li');
    li.className = 'card';

    // Destaque CSS aplicado via JavaScript para VIP e Convidado
    if (p.ingresso === 'vip')       li.classList.add('vip');
    if (p.ingresso === 'convidado') li.classList.add('convidado');

    const labels = { padrao: 'Padrão', vip: 'VIP', convidado: 'Convidado' };

    li.innerHTML = `
      <div>
        <span class="card-nome">${esc(p.nome)}</span>
        <span class="badge badge-${p.ingresso}">${labels[p.ingresso]}</span>
        <span class="badge ${p.presenca ? 'badge-presente' : 'badge-ausente'}">${p.presenca ? '✓ Presente' : '— Pendente'}</span>
      </div>
      <p class="card-info">✉️ ${esc(p.email)}</p>
      ${p.topicos.length ? `<p class="card-info">📌 ${p.topicos.join(', ')}</p>` : ''}
      <button class="btn-remover" aria-label="Remover ${esc(p.nome)}">Remover</button>
    `;

    li.querySelector('.btn-remover').addEventListener('click', () => {
      li.style.transition = 'opacity 0.3s';
      li.style.opacity    = '0';
      setTimeout(() => {
        participantes = participantes.filter(x => x.id !== p.id);
        console.log('🗑️ Removido ID', p.id, '| Lista:', participantes);
        renderizar();
      }, 300);
    });

    lista.appendChild(li);
  });
}

/* ── Escape HTML (evita XSS) ── */
function esc(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

/* ── Submit ── */
function handleSubmit(e) {
  e.preventDefault(); // Progressive Enhancement: intercepta envio com JS

  const dados = {
    nome:     document.getElementById('nome').value,
    email:    document.getElementById('email').value,
    ingresso: document.getElementById('ingresso').value,
    presenca: document.getElementById('presenca').checked,
    topicos:  [...document.querySelectorAll('input[name="topico"]:checked')].map(c => c.value),
  };

  // Log dos dados no console (requisito da atividade)
  console.log('📋 Tentativa de inscrição:', dados);

  if (!validar(dados)) return;

  const p = criarParticipante(dados);
  participantes.push(p);

  console.log('✅ Inscrito:', p, '| Array:', participantes);

  renderizar();
  e.target.reset();
  document.getElementById('topicos').hidden = true;
}

/* ── Tópicos dinâmicos ── */
function configurarTopicos() {
  document.getElementById('novidades').addEventListener('change', function () {
    const bloco = document.getElementById('topicos');
    bloco.hidden = !this.checked;
    bloco.setAttribute('aria-hidden', String(!this.checked));
    if (!this.checked) {
      bloco.querySelectorAll('input').forEach(c => { c.checked = false; });
    }
  });
}

/* ── Inicialização ── */
document.addEventListener('DOMContentLoaded', () => {
  iniciarRelogio();
  boasVindas();
  configurarTopicos();
  document.getElementById('form').addEventListener('submit', handleSubmit);
  renderizar();
  console.log('🚀 ADSTalks inicializado!');
});