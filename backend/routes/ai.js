console.log('AI routes initialized:');
console.log('POST /insights');
console.log('POST /ask');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const axios = require('axios'); // Add axios for HTTP requests

//const { Configuration, OpenAIApi } = require('openai');

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';


// Error handler function
const handleError = (res, error, status = 500) => {
  console.error(error.message);
  res.status(status).json({ 
    error: status === 500 ? 'Internal server error' : error.message 
  });
};


router.get('/test', (req, res) => {
  res.json({ message: 'AI route test successful!' });
});
// @route   POST /insights
// @desc    Get financial insights
router.post('/insights', auth, async (req, res) => {
  try {
    
    
    const { transactions } = req.body;
    
    if (!transactions || !Array.isArray(transactions)) {
      return handleError(res, new Error('Invalid transactions data'), 400);
    }

    // Calculate financial metrics
    let income = 0;
    let expenses = 0;
    const categoryTotals = {};

    transactions.forEach(transaction => {
      if (transaction.amount >= 0) {
        income += transaction.amount;
      } else {
        const amount = Math.abs(transaction.amount);
        expenses += amount;
        const category = transaction.category || 'Uncategorized';
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      }
    });

    const net = income - expenses;
    
    // Get top 3 spending categories
    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, amount]) => ({ name, amount }));

    // Prepare prompt for OpenAI
    const prompt = `
You are a financial advisor analyzing this budget data:
- Total Income: $${income.toFixed(2)}
- Total Expenses: $${expenses.toFixed(2)}
- Net Savings: $${net >= 0 ? '+' : ''}${net.toFixed(2)}
- Top Spending Categories: 
${topCategories.map((cat, i) => `  ${i+1}. ${cat.name}: $${cat.amount.toFixed(2)}`).join('\n')}
- Transactions Analyzed: ${transactions.length}

Provide 3-5 concise insights and recommendations based on this data. 
Focus on savings opportunities and spending patterns.
Use simple, actionable language. Max 200 words.
    `;

    // Get AI insights
   const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a helpful financial advisor" },
          { role: "user", content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );

    const insights = response.data.choices[0].message.content.trim();
    res.json({ insights });
  } catch (err) {
    handleError(res, err);
  }
});

// @route   POST /ask
// @desc    Answer financial questions
router.post('/ask', auth, async (req, res) => {
  try {
    if (!openai) throw new Error('OpenAI not initialized');
    
    const { question, transactions } = req.body;
    
    if (!question || typeof question !== 'string') {
      return handleError(res, new Error('Invalid question'), 400);
    }
    
    if (!transactions || !Array.isArray(transactions)) {
      return handleError(res, new Error('Invalid transactions data'), 400);
    }

    // Calculate financial context
    let income = 0;
    let expenses = 0;
    const categoryTotals = {};

    transactions.forEach(transaction => {
      if (transaction.amount >= 0) {
        income += transaction.amount;
      } else {
        const amount = Math.abs(transaction.amount);
        expenses += amount;
        const category = transaction.category || 'Uncategorized';
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      }
    });

    const net = income - expenses;
    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Prepare context for question
    const context = {
      income,
      expenses,
      net,
      topCategories,
      transactionCount: transactions.length
    };

    // Get AI answer
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: `You are a financial assistant. Use this context to answer questions:
          - Total Income: $${income.toFixed(2)}
          - Total Expenses: $${expenses.toFixed(2)}
          - Net Savings: $${net.toFixed(2)}
          - Top Spending Categories: ${topCategories.map(([name]) => name).join(', ')}
          - Transactions Analyzed: ${transactions.length}`
        },
        { role: "user", content: question }
      ],
      max_tokens: 300,
    });

    const answer = response.data.choices[0].message.content.trim();
    res.json({ answer });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;