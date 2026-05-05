import { useState, useEffect } from "react"


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


export default function LawViewer() {
    const [jsonInput, setJsonInput] = useState("")
    const [parsed, setParsed] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [apiInput, setApiInput] = useState("https://cyberdemocracy-production.up.railway.app/link_to_json")
    const [linkInput, setLinkInput] = useState("https://zakon.rada.gov.ua/laws/show/2145-19#Text") // <-- ссылка из input


    const [toast, setToast] = useState("")
    const isMobile = window.innerWidth < 768

    const getFileName = () => {
        const parsedData = parseJson()
        const title = parsedData?.title?.trim()

        return title ? `${title}.json` : "data.json"
    }

    const handleFetch = async () => {
        try {
            setLoading(true)
            setError(null)

            const res = await fetch(apiInput, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    link: linkInput,
                }),
            })

            if (!res.ok) throw new Error("Request failed")

            const data = await res.json()
            setJsonInput(JSON.stringify(data, null, 2))
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!jsonInput) return
        parseJson()
    }, [jsonInput])

    const parseJson = () => {
        try {
            const parsedData = JSON.parse(jsonInput)
            setParsed(parsedData)
            setError(null)
            return parsedData
        } catch {
            setError("Invalid JSON")
            return null
        }
    }

    const handleParse = () => {
        parseJson()
    }

    const handleCopy = async () => {
        const parsedData = parseJson()
        if (!parsedData) return

        try {
            await navigator.clipboard.writeText(JSON.stringify(parsedData, null, 2))
            setToast("Copied")

            setTimeout(() => setToast(""), 2000)
        } catch (e) {
            setToast("Error")
            setTimeout(() => setToast(""), 2000)
        }
    }

    const handleSave = () => {
        const parsedData = parseJson()
        if (!parsedData) return

        const jsonString = JSON.stringify(parsedData, null, 2)

        const blob = new Blob([jsonString], { type: "application/json" })
        const url = URL.createObjectURL(blob)

        const a = document.createElement("a")
        a.href = url
        a.download = getFileName()
        a.click()

        URL.revokeObjectURL(url)
    }

    const titleStyle = {
        fontWeight: "700",
        marginBottom: "12px",
        color: "var(--green)",
        fontSize: "18px",
        fontFamily: "'Share Tech Mono', monospace",
        letterSpacing: "2px",
    }

    const inputStyle = {
        padding: "10px",
        marginBottom: "10px",
        border: "1px solid rgba(0,255,136,.2)",
        background: "var(--bg2)",
        color: "var(--text)",
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: "12px",
        width: "100%",
    }

    const buttonStyle = {
        marginBottom: "16px",
        background: "var(--cyan)",
        color: "var(--bg)",
        padding: "10px 20px",
        border: "none",
        fontFamily: "'Share Tech Mono', monospace",
        fontWeight: "700",
        cursor: "pointer",
    }

    const buttonGreenStyle = {
        marginLeft: "24px",
        background: "var(--green)",
        color: "var(--bg)",
        padding: "10px 20px",
        border: "none",
        fontFamily: "'Share Tech Mono', monospace",
        fontWeight: "700",
        cursor: "pointer",
    }

    const textareaStyle = {
        width: "100%",
        height: "100%",
        border: "1px solid rgba(0,255,136,.2)",
        padding: "16px",
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: "12px",
        background: "var(--bg2)",
        color: "var(--text)",
        resize: "none",
    }

    return (

        <div
            style={{
                marginTop: "40px",
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                padding: isMobile ? "16px" : "60px",
                gap: "24px",
                background: "var(--bg)",
            }}
        >
            <div
                style={{
                    maxWidth: "720px",
                    // lineHeight: "0.8",
                    fontSize: "14px",
                    padding: "20px",
                }}
            >
                {/* <h2 style={{ marginBottom: "18px" }}>
                    SASS-парсер законів Верховної Ради
                </h2> */}

                <p style={{ marginBottom: "14px" }}>
                    Це інструмент для автоматичного перетворення офіційних сторінок
                    законодавства у структурований JSON.
                </p>

                <p style={{ marginBottom: "14px" }}>
                    Просто вставте посилання на закон із сайту Верховної Ради, натисніть{" "}
                    <b>Fetch</b>, і система витягне та розкладе текст у зручну
                    ієрархічну структуру.
                </p>

                <p style={{ marginBottom: "10px" }}>Після обробки ви можете:</p>

                <ul style={{ margin: "10px 0 16px 20px", paddingLeft: "18px" }}>
                    <li style={{ marginBottom: "6px" }}>зберегти результат у JSON-файл</li>
                    <li style={{ marginBottom: "6px" }}>скопіювати JSON у буфер обміну</li>
                    <li>переглянути структуроване дерево даних у правій панелі</li>
                </ul>

                <p>
                    Інструмент дозволяє швидко отримувати чисті, придатні для подальшої
                    обробки дані з юридичних текстів без ручного парсингу та очищення HTML.
                </p>
            </div>
            {/* ================= API INPUT ================= */}
            <div>
                <h2 style={titleStyle}>[ API INPUT ]</h2>

                <input
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    placeholder="Enter link or query..."
                    style={{ ...inputStyle, width: "100%" }}
                />

                <button
                    onClick={handleFetch}
                    disabled={loading}
                    style={{ ...buttonStyle, marginTop: "12px", width: "100%" }}
                >
                    {loading ? "LOADING..." : "FETCH FROM API"}
                </button>

                {error && (
                    <div style={{ color: "var(--red)", marginTop: "8px" }}>
                        {error}
                    </div>
                )}
            </div>

            {toast && <div className="toast">{toast}</div>}

            {/* ================= BOTTOM SPLIT ================= */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: "24px",
                }}
            >
                {/* JSON INPUT */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: "8px",
                            alignItems: "center",
                        }}
                    >
                        <h2 style={titleStyle}>[ JSON INPUT ]</h2>

                        <button onClick={handleParse} style={buttonGreenStyle}>
                            PARSE
                        </button>
                        <button onClick={handleCopy} style={buttonGreenStyle}>
                            COPY
                        </button>
                        <button onClick={handleSave} style={buttonGreenStyle}>
                            SAVE
                        </button>
                    </div>

                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        style={{
                            ...textareaStyle,
                            minHeight: isMobile ? "250px" : "100%",
                            width: "100%",
                        }}
                    />
                </div>

                {/* VIEWER */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <h2 style={{ ...titleStyle, color: "var(--cyan)" }}>
                        [ VIEWER ]
                    </h2>

                    <div
                        style={{
                            overflowY: "auto",
                            border: "1px solid rgba(0,255,136,.2)",
                            padding: "16px",
                            background: "var(--bg2)",
                            minHeight: isMobile ? "300px" : "100%",
                        }}
                    >
                        {parsed ? (
                            <TreeNode node={parsed} keyName="root" />
                        ) : (
                            <div style={{ color: "var(--muted)" }}>
                                No data loaded
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}