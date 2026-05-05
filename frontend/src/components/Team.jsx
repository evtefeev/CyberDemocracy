import React from "react";

export default function Team() {
    return (
        <div style={styles.wrapper}>
            <header style={styles.header}>
                <h1 style={styles.title}>Команда проєкту</h1>
                <p style={styles.subtitle}>
                    Ми будуємо платформу цифрової демократії, що поєднує прозорість,
                    дані та сучасні технології для суспільного впливу.
                </p>
            </header>

            <section style={styles.grid}>
                {/* Product / Vision */}
                <div style={styles.card}>
                    <h2 style={styles.role}>Product / Vision Lead</h2>
                    <p style={styles.text}>
                        Відповідає за стратегічний розвиток платформи, UX-логіку та
                        взаємодію користувача з політичними даними. Формує бачення
                        цифрової демократії як продукту.
                    </p>
                </div>

                {/* Frontend */}
                <div style={styles.card}>
                    <h2 style={styles.role}>Frontend Developer</h2>
                    <p style={styles.text}>
                        Розробляє інтерфейс платформи (React / Next.js), інтерактивні
                        дашборди, візуалізацію законів, аналітику та UX-компоненти.
                    </p>
                </div>

                {/* Backend */}
                <div style={styles.card}>
                    <h2 style={styles.role}>Backend Developer</h2>
                    <p style={styles.text}>
                        Будує API, систему обробки законів, структуру даних Верховної Ради,
                        авторизацію та інтеграції з зовнішніми джерелами.
                    </p>
                </div>

                {/* Data / AI */}
                <div style={styles.card}>
                    <h2 style={styles.role}>Data / AI Engineer</h2>
                    <p style={styles.text}>
                        Розробляє парсери законів, NLP-модулі для аналізу текстів,
                        класифікацію документів та автоматичне структурування законодавства.
                    </p>
                </div>

                {/* DevOps */}
                <div style={styles.card}>
                    <h2 style={styles.role}>DevOps / Infrastructure</h2>
                    <p style={styles.text}>
                        Відповідає за деплой, масштабування, CI/CD, стабільність сервісу та
                        роботу з cloud-інфраструктурою (Docker, Vercel, AWS/GCP).
                    </p>
                </div>

                {/* UI/UX */}
                <div style={styles.card}>
                    <h2 style={styles.role}>UI/UX Designer</h2>
                    <p style={styles.text}>
                        Проєктує інтерфейс платформи так, щоб складні політичні дані були
                        зрозумілі кожному користувачу.
                    </p>
                </div>

                <div style={styles.card}>
                    <h2 style={styles.role}>SMM / Community Manager</h2>
                    <p style={styles.text}>
                        Відповідає за розвиток спільноти, комунікацію з користувачами,
                        ведення соціальних мереж, формування публічного образу проєкту
                        та залучення нової аудиторії.
                    </p>
                </div>

                {/* Research */}
                <div style={styles.card}>
                    <h2 style={styles.role}>Research / Policy Analyst</h2>
                    <p style={styles.text}>
                        Аналізує законодавство, структурує політичні процеси та допомагає
                        перевести юридичні тексти у зрозумілі дані.
                    </p>
                </div>

                {/* Security */}
                <div style={styles.card}>
                    <h2 style={styles.role}>Security Engineer</h2>
                    <p style={styles.text}>
                        Забезпечує захист даних, безпечну взаємодію користувачів,
                        аудит системи та захист від атак і маніпуляцій.
                    </p>
                </div>
            </section>
        </div>
    );
}

const styles = {
    wrapper: {
        padding: "60px 20px",
        background: "#0b1020",
        color: "#fff",
        minHeight: "100vh",
    },
    header: {
        maxWidth: "900px",
        margin: "0 auto 40px auto",
        textAlign: "center",
    },
    title: {
        fontSize: "42px",
        marginBottom: "10px",
    },
    subtitle: {
        fontSize: "16px",
        opacity: 0.8,
        lineHeight: "1.6",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "20px",
        maxWidth: "1100px",
        margin: "0 auto",
    },
    card: {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px",
        padding: "20px",
        backdropFilter: "blur(10px)",
    },
    role: {
        fontSize: "18px",
        marginBottom: "10px",
        color: "#7dd3fc",
    },
    text: {
        fontSize: "14px",
        lineHeight: "1.6",
        opacity: 0.85,
    },
};