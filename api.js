const GEMINI_API_KEY = ""; // Replace with actual key

const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  const data = await res.json();
  if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  } else {
    console.error("Gemini API Error:", data);
    throw new Error("❌ Gemini API Error or empty response.");
  }
}

export async function summarizeText(text) {
  const prompt = `Summarize this blog/article in simple language,break down in bullet points, your summary should depend upon length of blog/article.Do not write anyhting before and after just straight away response\n\n${text}`;
  return await callGemini(prompt);
}

export async function explainCode(code) {
  const prompt = `
Please explain the following code **line by line**, in this format:

<code>
line of code // explanation in simple terms
</code>

Only output the explanation in code format. Do not write anything before or after.

Here is the code:
${code}
`;

  return await callGemini(prompt);
}

