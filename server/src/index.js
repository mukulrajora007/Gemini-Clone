import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Gemini AI Clone Server is running at http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(
    `🔑 Server API Key: ${
      process.env.GEMINI_API_KEY ? 'Configured ✅' : 'Not set (clients must pass header) ⚠️'
    }`
  );
});

export default app;
