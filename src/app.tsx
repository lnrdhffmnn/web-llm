import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";
import { useEffect, useState } from "react";

export function App() {
  const [engine, setEngine] = useState<MLCEngine>();
  const [progress, setProgress] = useState(0);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (engine) return;

    CreateMLCEngine("Llama-3.2-1B-Instruct-q4f16_1-MLC", {
      initProgressCallback: ({ progress }) => setProgress(progress),
    }).then(setEngine);
  }, [engine]);

  async function chat() {
    if (!engine) return;

    setGenerating(true);
    setOutput("");

    const chunks = await engine.chat.completions.create({
      messages: [
        { role: "system", content: "Responda de forma clara e objetiva sempre em português brasileiro" },
        { role: "user", content: input },
      ],
      temperature: 1,
      stream: true,
      stream_options: { include_usage: true },
    });

    for await (const chunk of chunks) {
      setOutput((prev) => prev + (chunk.choices[0]?.delta.content || ""));
      if (chunk.usage) console.log(chunk.usage);
    }

    setGenerating(false);
    setInput("");
  }

  if (!engine) return <p>Carregando {(progress * 100).toFixed(2)}%</p>;

  return (
    <main>
      <form action={chat} autoComplete="off">
        <label>
          Input:
          <input type="text" name="input" value={input} onChange={(e) => setInput(e.target.value)} disabled={generating} />
        </label>
        <button type="submit" disabled={generating}>
          Enviar
        </button>
      </form>
      <pre dangerouslySetInnerHTML={{ __html: output }}></pre>
    </main>
  );
}
