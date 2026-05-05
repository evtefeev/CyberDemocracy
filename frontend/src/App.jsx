import './App.css'
import { useState, useEffect } from 'react'
import LawViewer from "./components/LawViewer"
import Team from "./components/Team";
import { useRef } from "react"

export default function App() {
  const [page, setPage] = useState('landing')
  const [lawData, setLawData] = useState(null)
  const problemsRef = useRef(null)

  const scrollToProblems = () => {
    problemsRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // useEffect(() => {
  //   if (page === 'viewer') {
  //     fetch('/law.json')
  //       .then(res => res.json())
  //       .then(data => setLawData(data))
  //       .catch(err => console.error('Error loading law.json:', err))
  //   }
  // }, [page])

  return (
    <div className="app">
      <Nav page={page} setPage={setPage} />

      {page === "landing" ? (
        <>
          <Hero
            onGetStarted={scrollToProblems}
            onDemo={() => setPage("viewer")}
            setPage={setPage}
          />

          <div ref={problemsRef}>
            <Problems />
          </div>

          <Solution />
          <Architecture />
          <Users />
          <TechStack />
          <Roadmap />
          <CTA />

        </>
      ) : page === "viewer" ? (
        <LawViewer data={lawData} />
      ) : page === "team" ? (
        <Team />
      ) : null}
      <Footer />
    </div>
  );
}

function Nav({ page, setPage }) {
  return (
    <nav>
      <div className="nav-logo" style={{ cursor: "pointer" }} onClick={(e) => { e.preventDefault(); setPage('landing') }}>
        <div className="dot"></div>

        CYBER_DEMOCRACY
      </div>
      <div className="nav-links">
        <a href="#" onClick={(e) => { e.preventDefault(); setPage('landing') }} style={{ color: page === 'landing' ? 'var(--green)' : 'var(--muted)' }}>Home</a>
        <a href="#" onClick={(e) => { e.preventDefault(); setPage('team') }} style={{ color: page === 'landing' ? 'var(--green)' : 'var(--muted)' }}>Team</a>
        {/* <a href="#" onClick={(e) => { e.preventDefault(); setPage('viewer') }} style={{ color: page === 'viewer' ? 'var(--green)' : 'var(--muted)' }}>Viewer</a> */}
      </div>
      <button
        className="nav-cta"
        onClick={(e) => {
          e.preventDefault()
          setPage('viewer')
        }}
      >
        [ DEMO ]
      </button>
    </nav>
  )
}

function Hero({ onGetStarted, onDemo, setPage }) {

  return (
    <section id="hero">
      <div className="hero-grid"></div>
      <div className="hero-glow"></div>
      <div className="hero-content">
        <div className="hero-badge">
          <div className="blink"></div>
          <span>// SYSTEM ACTIVE — BUILD 2026.1</span>
        </div>
        <h1>
          <div className="line1">CYBER</div>
          <div className="line2">
            DEMOCRACY<span className="cursor"></span>
          </div>
        </h1>
        <p className="hero-sub">
          Фреймворк для автоматизації аудиту державних установ та аналізу законодавства на
          базі штучного інтелекту.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={onGetStarted}>
            GET STARTED →
          </button>

          <button className="btn-sec" onClick={() => setPage("viewer")}>
            [ LIVE DEMO ]
          </button>
        </div>
      </div>
      <div className="hero-stats">
        <div className="stat-card">
          <div className="corner-tl"></div>
          <div className="corner-br"></div>
          <div className="stat-num">99.9%</div>
          <div className="stat-label">Uptime</div>
        </div>
        <div className="stat-card">
          <div className="corner-tl"></div>
          <div className="corner-br"></div>
          <div className="stat-num" style={{ color: 'var(--cyan)' }}>2ms</div>
          <div className="stat-label">Response</div>
        </div>
        <div className="stat-card">
          <div className="corner-tl"></div>
          <div className="corner-br"></div>
          <div className="stat-num" style={{ color: 'var(--purple)' }}>10K+</div>
          <div className="stat-label">Docs / sec</div>
        </div>
      </div>
    </section>
  )
}

function Problems() {
  const threats = [
    {
      code: 'VULN-001',
      severity: 'КРИТИЧНО',
      title: 'Низька прозорість',
      desc: 'Відсутність доступу до реальних даних держустанов та фінансових потоків',
      clr: 'var(--red)',
    },
    {
      code: 'VULN-002',
      severity: 'ВИСОКО',
      title: 'Ручний аудит',
      desc: 'Повільні та ненадійні процеси перевірки без автоматизації',
      clr: 'var(--orange)',
    },
    {
      code: 'VULN-003',
      severity: 'СЕРЕДНЬО',
      title: 'Складність законів',
      desc: 'Великий обсяг юридичних текстів без автоматичного аналізу та класифікації',
      clr: '#FFD700',
    },
    {
      code: 'VULN-004',
      severity: 'ВИСОКО',
      title: 'Немає інтеграцій',
      desc: 'Ізольовані системи без спільних API та уніфікованих даних',
      clr: 'var(--orange)',
    },
    {
      code: 'VULN-005',
      severity: 'КРИТИЧНО',
      title: 'Обмежений доступ',
      desc: 'Громадяни позбавлені зрозумілої аналітики та можливості контролю',
      clr: 'var(--red)',
    },
  ]

  return (
    <section id="problems">
      <div className="left-bar" style={{ background: 'var(--red)' }}></div>
      <div className="sec-tag">[ THREAT_ANALYSIS ]</div>
      <h2 className="sec-title">Виявлені проблеми</h2>
      <p className="sec-sub">
        Критичні вразливості державної системи, які потребують негайного усунення
      </p>
      <div className="threat-grid">
        {threats.map((threat) => (
          <div key={threat.code} className="threat-card" style={{ '--clr': threat.clr }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="threat-code">{threat.code}</div>
              <div className="sev-badge" style={{ borderColor: threat.clr, color: threat.clr }}>
                {threat.severity}
              </div>
            </div>
            <div className="threat-title">{threat.title}</div>
            <div className="threat-desc">{threat.desc}</div>
          </div>
        ))}
      </div>
      <div className="result-box">
        <h4>// НАСЛІДКИ</h4>
        <div className="result-items">
          <div className="result-item">Корупція та зловживання</div>
          <div className="result-item">Неефективність витрат</div>
          <div className="result-item">Втрата довіри громадян</div>
        </div>
      </div>
    </section>
  )
}

function Solution() {
  const modules = [
    {
      badge: 'AE / AUDIT',
      title: 'Audit Engine',
      desc: 'Автоматизований аудит держустанов із виявленням аномалій у реальному часі',
      items: ['Аналіз фінансових потоків', 'Виявлення аномалій', 'Корупційний ризик-скор', 'Моніторинг ефективності'],
      clr: 'var(--green)',
    },
    {
      badge: 'LA / LAW',
      title: 'Law Analysis',
      desc: 'AI-аналіз законодавства із семантичним розбором та пошуком ризиків',
      items: ['Семантичний розбір', 'Пошук суперечностей', 'Виявлення «лазівок»', 'Порівняння між країнами'],
      clr: 'var(--cyan)',
    },
    {
      badge: 'AM / ANALYTICS',
      title: 'Analytics Module',
      desc: 'Дашборди, KPI та AI-рекомендації в реальному часі для всіх рівнів',
      items: ['Real-time дашборди', 'KPI держструктур', 'Візуалізація процесів', 'AI-рекомендації'],
      clr: 'var(--purple)',
    },
    {
      badge: 'IL / INTEGRATION',
      title: 'Integration Layer',
      desc: 'REST API, Webhooks та SDK для підключення до будь-яких систем',
      items: ['REST API v2', 'Webhooks', 'SDK (Python/JS)', 'Telegram / Discord Bot'],
      clr: 'var(--orange)',
    },
  ]

  return (
    <section id="solution">
      <div className="left-bar" style={{ background: 'var(--green)' }}></div>
      <div className="sec-tag">[ SOLUTION_OVERVIEW ]</div>
      <h2 className="sec-title">Рішення</h2>
      <p className="sec-sub">
        CyberDemocracy — фреймворк, що автоматизує аудит, аналізує законодавство та перетворює дані
        на дію
      </p>
      <div className="modules-grid">
        {modules.map((mod, idx) => (
          <div key={idx} className="module-card" style={{ '--clr': mod.clr }}>
            <div className="mod-badge">{mod.badge}</div>
            <div className="mod-title">{mod.title}</div>
            <div className="mod-desc">{mod.desc}</div>
            <div className="mod-items">
              {mod.items.map((item, i) => (
                <div key={i} className="mod-item">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Architecture() {
  const layers = [
    {
      label: 'INTEGRATION LAYER',
      clr: 'var(--green)',
      chips: ['REST API', 'Webhooks', 'SDK', 'Telegram Bot', 'Mobile Apps'],
      chipClr: 'rgba(0,255,136,.35)',
    },
    {
      label: 'CORE ENGINE',
      clr: 'var(--cyan)',
      chips: ['Audit Engine', 'Law Analysis Engine', 'Analytics Engine'],
      chipClr: 'rgba(0,212,255,.35)',
    },
    {
      label: 'PROCESSING LAYER',
      clr: 'var(--purple)',
      chips: ['NLP Transformers', 'ML Models', 'Rule Engine', 'Graph DB'],
      chipClr: 'rgba(139,92,246,.35)',
    },
    {
      label: 'DATA LAYER',
      clr: 'var(--orange)',
      chips: ['Відкриті реєстри', 'API держсистем', 'Документи', 'Бази даних'],
      chipClr: 'rgba(255,140,0,.35)',
    },
  ]

  return (
    <section id="arch">
      <div className="left-bar" style={{ background: 'var(--purple)' }}></div>
      <div className="sec-tag">[ SYSTEM_ARCHITECTURE ]</div>
      <h2 className="sec-title">Архітектура</h2>
      <p className="sec-sub">Чотирирівнева модульна система з чіткою розв'язкою компонентів</p>
      <div className="arch-layers">
        {layers.map((layer, idx) => (
          <div key={idx}>
            <div className="arch-layer" style={{ borderColor: `rgba(0,255,136,.3)` }}>
              <div className="arch-label" style={{ color: layer.clr }}>
                {layer.label}
              </div>
              <div className="arch-chips">
                {layer.chips.map((chip, i) => (
                  <div
                    key={i}
                    className="arch-chip"
                    style={{
                      '--clr': layer.clr,
                      borderColor: layer.chipClr,
                      color: layer.clr,
                    }}
                  >
                    {chip}
                  </div>
                ))}
              </div>
            </div>
            {idx < layers.length - 1 && (
              <div className="arch-arrow" style={{ color: 'var(--cyan)' }}>
                ▼
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function Users() {
  const users = [
    {
      role: 'GOV / ДЕРЖАВА',
      clr: 'var(--green)',
      items: [
        'Контроль ефективності',
        'Зменшення корупції',
        'Прозорість процесів',
        'Рішення на основі даних',
      ],
    },
    {
      role: 'BIZ / БІЗНЕС',
      clr: 'var(--cyan)',
      items: [
        'Аналіз регуляцій',
        'Оцінка ризиків',
        'Compliance-перевірка',
        'Стратегічне планування',
      ],
    },
    {
      role: 'CIT / ГРОМАДЯНИ',
      clr: 'var(--purple)',
      items: [
        'Зрозуміла аналітика',
        'Контроль влади',
        'Участь у демократії',
        'Доступ до реальних даних',
      ],
    },
  ]

  return (
    <section id="users">
      <div className="left-bar" style={{ background: 'var(--cyan)' }}></div>
      <div className="sec-tag">[ ACCESS_MATRIX ]</div>
      <h2 className="sec-title">Для кого?</h2>
      <p className="sec-sub">Система надає різні рівні доступу залежно від ролі користувача</p>
      <div className="users-grid">
        {users.map((user, idx) => (
          <div key={idx} className="user-card" style={{ '--clr': user.clr }}>
            <div className="user-role">{user.role}</div>
            <div className="user-items">
              {user.items.map((item, i) => (
                <div key={i} className="user-item">
                  <span className="user-arrow">→</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function TechStack() {
  const techs = [
    {
      name: 'Python / FastAPI',
      pct: 92,
      desc: 'Backend та високопродуктивні API сервери',
      clr: 'var(--green)',
    },
    {
      name: 'NLP Transformers',
      pct: 88,
      desc: 'Обробка та семантичний аналіз текстів',
      clr: 'var(--cyan)',
    },
    {
      name: 'Graph Databases',
      pct: 78,
      desc: 'Neo4j — зв\'язки між даними та сутностями',
      clr: 'var(--purple)',
    },
    {
      name: 'ClickHouse / BigQuery',
      pct: 85,
      desc: 'Аналітика Big Data — мільярди рядків за секунди',
      clr: 'var(--orange)',
    },
    {
      name: 'Docker / Cloud',
      pct: 95,
      desc: 'Оркестрація, CI/CD та автоскейлінг',
      clr: 'var(--red)',
    },
  ]

  const deps = [
    { label: 'Cloud Native', clr: 'var(--green)' },
    { label: 'Microservices', clr: 'var(--cyan)' },
    { label: 'Containerized', clr: 'var(--purple)' },
    { label: 'Auto-scaling', clr: 'var(--orange)' },
    { label: '99.9% Uptime', clr: 'var(--green)' },
    { label: 'GDPR / SOC2', clr: 'var(--cyan)' },
  ]

  return (
    <section id="tech" style={{ position: 'relative' }}>
      <div className="left-bar" style={{ background: 'var(--green)' }}></div>
      <div className="sec-tag">[ TECH_STACK ]</div>
      <h2 className="sec-title">Технології</h2>
      <p className="sec-sub">Сучасний стек для обробки великих даних та AI-аналізу</p>
      <div className="tech-rows">
        {techs.map((tech, idx) => (
          <div key={idx} className="tech-row">
            <div className="tech-header">
              <div className="tech-name">{tech.name}</div>
              <div className="tech-pct" style={{ '--clr': tech.clr }}>
                {tech.pct}%
              </div>
            </div>
            <div className="tech-desc">{tech.desc}</div>
            <div className="bar-bg">
              <div className="bar-fill" style={{ '--clr': tech.clr, width: `${tech.pct}%` }}></div>
            </div>
          </div>
        ))}
      </div>
      <div className="tech-side">
        {deps.map((dep, idx) => (
          <div key={idx} className="dep-chip" style={{ '--clr': dep.clr }}>
            {dep.label}
          </div>
        ))}
      </div>
    </section>
  )
}

function Roadmap() {
  const phases = [
    {
      label: 'PHASE_01',
      title: 'MVP',
      period: 'Q3–Q4 2025',
      status: '✓ COMPLETE',
      items: ['Аналіз законів', 'Базовий аудит', 'API v1', 'Демо дашборд'],
      clr: 'var(--green)',
    },
    {
      label: 'PHASE_02',
      title: 'GROWTH',
      period: 'Q3–Q4 2026',
      status: '▶ IN PROGRESS',
      items: ['AI-рекомендації', 'Повні дашборди', 'Telegram Bot', 'Beta API'],
      clr: 'var(--cyan)',
    },
    {
      label: 'PHASE_03',
      title: 'SCALE',
      period: 'Q1–Q2 2027',
      status: '○ PLANNED',
      items: ['Держ. інтеграція', 'Публічні API', 'SDK v2', 'Enterprise tier'],
      clr: 'var(--purple)',
      opacity: 0.7,
    },
  ]

  return (
    <section id="roadmap">
      <div className="left-bar" style={{ background: 'var(--cyan)' }}></div>
      <div className="sec-tag">[ DEPLOYMENT_ROADMAP ]</div>
      <h2 className="sec-title">Roadmap</h2>
      <p className="sec-sub">
        Три фази розгортання від MVP до повної інтеграції з державними системами
      </p>
      <div className="timeline">
        <div className="phase-progress"></div>
        <div className="phases">
          {phases.map((phase, idx) => (
            <div key={idx}>
              <div
                className="phase-dot"
                style={{
                  '--clr': phase.clr,
                  boxShadow: phase.opacity ? 'none' : `0 0 12px ${phase.clr}`,
                  opacity: phase.opacity || 1,
                }}
              ></div>
              <div className="phase-card" style={{ '--clr': phase.clr, opacity: phase.opacity || 1 }}>
                <div className="phase-label">{phase.label}</div>
                <div className="phase-title">{phase.title}</div>
                <div className="phase-period">{phase.period}</div>
                <div className="phase-status">{phase.status}</div>
                <div className="phase-items">
                  {phase.items.map((item, i) => (
                    <div key={i} className="phase-item">
                      <span>◆</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section id="cta">
      <div className="cta-frame">
        <div className="cta-tl"></div>
        <div className="cta-tr"></div>
        <div className="cta-bl"></div>
        <div className="cta-br"></div>
        <div className="cta-tag">[ MISSION_STATEMENT ]</div>
        <div className="cta-title">Почніть сьогодні</div>
        <div className="cta-sub">
          Перетворіть державу на прозору, керовану та підзвітну систему через технології та AI.
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary">REQUEST ACCESS →</button>
          <button className="btn-sec">[ VIEW DOCS ]</button>
        </div>
        <div className="cta-motto">// Transparency. Accountability. Technology.</div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer>
      <div className="footer-logo">CYBERDEMOCRACY FRAMEWORK © 2026</div>
      <div className="footer-status">SYSTEM ONLINE</div>
    </footer>
  )
}

function TreeNode({ node, level = 0, keyName = "" }) {
  const [open, setOpen] = useState(level < 2)

  if (typeof node === "string" || typeof node === "number") {
    return <div style={{ marginLeft: '16px', paddingY: '4px', color: 'var(--text)', fontSize: '13px' }}>{node}</div>
  }

  if (Array.isArray(node)) {
    return (
      <div style={{ marginLeft: '16px', borderLeft: '1px solid rgba(0,255,136,.2)', paddingLeft: '12px' }}>
        {node.map((item, i) => (
          <TreeNode key={i} node={item} level={level + 1} keyName={keyName} />
        ))}
      </div>
    )
  }

  const keys = Object.keys(node || {})
  const label = node.title || node.number || node.text || keyName || ""

  return (
    <div style={{ marginLeft: '16px', borderLeft: '1px solid rgba(0,255,136,.2)', paddingLeft: '12px', marginBottom: '8px' }}>
      <div
        style={{
          cursor: 'pointer',
          userSelect: 'none',
          paddingY: '4px',
          fontWeight: '600',
          color: 'var(--green)',
          fontSize: '13px'
        }}
        onClick={() => setOpen(!open)}
      >
        {open ? "▼" : "▶"} {label}
      </div>

      {open && (
        <div style={{ marginLeft: '8px' }}>
          {keys.map((key) => {
            const value = node[key]
            if (key === "title" || key === "number") return null
            return (
              <div key={key} style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '10px', color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>
                  {key}
                </div>
                <TreeNode node={value} level={level + 1} keyName={key} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}