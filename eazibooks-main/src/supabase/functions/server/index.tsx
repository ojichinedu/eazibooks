import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-db10586b/health", (c) => {
  return c.json({ status: "ok" });
});

// Authentication endpoints

// Signup endpoint
app.post("/make-server-db10586b/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true // Automatically confirm email since email server hasn't been configured
    });

    if (error) {
      console.log("Signup error:", error);
      return c.json({ error: error.message }, 400);
    }

    // Create a session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (sessionError) {
      console.log("Session creation error:", sessionError);
      return c.json({ error: sessionError.message }, 400);
    }

    return c.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name
      },
      access_token: sessionData.session.access_token
    });
  } catch (error) {
    console.log("Error during signup:", error);
    return c.json({ error: "Failed to create account", details: String(error) }, 500);
  }
});

// Login endpoint
app.post("/make-server-db10586b/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("Login error:", error);
      return c.json({ error: "Invalid email or password" }, 401);
    }

    return c.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name
      },
      access_token: data.session.access_token
    });
  } catch (error) {
    console.log("Error during login:", error);
    return c.json({ error: "Login failed", details: String(error) }, 500);
  }
});

// Session check endpoint
app.get("/make-server-db10586b/auth/session", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: "Invalid session" }, 401);
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata.name
      }
    });
  } catch (error) {
    console.log("Error checking session:", error);
    return c.json({ error: "Session check failed", details: String(error) }, 500);
  }
});

// Logout endpoint
app.post("/make-server-db10586b/auth/logout", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (accessToken) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
      );

      await supabase.auth.signOut();
    }

    return c.json({ success: true });
  } catch (error) {
    console.log("Error during logout:", error);
    return c.json({ error: "Logout failed", details: String(error) }, 500);
  }
});

// API configuration check endpoint
app.get("/make-server-db10586b/ai/status", (c) => {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  return c.json({ 
    openaiConfigured: !!openaiApiKey,
    keyPrefix: openaiApiKey ? `${openaiApiKey.substring(0, 7)}...` : null
  });
});

// AI Chat endpoint - Financial/Business Consultant
app.post("/make-server-db10586b/ai/chat", async (c) => {
  try {
    const { message, conversationId, context } = await c.req.json();
    
    if (!message) {
      return c.json({ error: "Message is required" }, 400);
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.log("AI Chat Error: OPENAI_API_KEY environment variable not set");
      return c.json({ error: "OpenAI API key not configured" }, 500);
    }

    // Retrieve conversation history
    const historyKey = `chat:${conversationId}`;
    let history = [];
    try {
      const stored = await kv.get(historyKey);
      history = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.log("Error retrieving chat history:", e);
      history = [];
    }

    // Build messages for OpenAI
    const systemPrompt = `You are an AI Financial and Business Consultant for EaziBook, a comprehensive ERP system by LifeisEazi Group Enterprises, designed for SMEs. 
You have expertise in:
- Financial management, accounting, and ledger management
- GST invoicing, tax compliance (GST, TDS, VAT)
- Inventory management and stock control
- Payroll processing and statutory compliance
- Business operations and strategic planning
- Multi-currency transactions and financial reporting
- Cash flow management and budgeting

Provide clear, actionable advice tailored for small and medium enterprises. 
Keep responses professional, concise, and practical. When discussing financial or tax matters, 
remind users to consult with certified professionals for final decisions.

${context ? `Current context: ${JSON.stringify(context)}` : ''}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message }
    ];

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.log(`OpenAI API error while processing chat message: ${response.status} - ${errorData}`);
      return c.json({ 
        error: "Failed to get AI response", 
        details: errorData,
        status: response.status,
        hint: response.status === 401 ? "Check your OpenAI API key" : "OpenAI API error"
      }, response.status);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.log('Invalid OpenAI response structure:', JSON.stringify(data));
      return c.json({ error: "Invalid response from OpenAI", details: JSON.stringify(data) }, 500);
    }
    
    const aiMessage = data.choices[0].message.content;

    // Update conversation history
    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: aiMessage });
    
    // Keep only last 20 messages to manage token limits
    if (history.length > 20) {
      history = history.slice(-20);
    }

    await kv.set(historyKey, JSON.stringify(history));

    return c.json({ 
      message: aiMessage, 
      conversationId 
    });

  } catch (error) {
    console.log("AI Chat Error:", error);
    return c.json({ error: "Internal server error processing AI chat", details: String(error) }, 500);
  }
});

// OCR Invoice/Receipt Processing endpoint
app.post("/make-server-db10586b/ai/ocr", async (c) => {
  try {
    const { imageBase64, imageUrl } = await c.req.json();
    
    if (!imageBase64 && !imageUrl) {
      return c.json({ error: "Image data (base64 or URL) is required" }, 400);
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.log("OCR Error: OPENAI_API_KEY environment variable not set");
      return c.json({ error: "OpenAI API key not configured" }, 500);
    }

    const imageContent = imageBase64 
      ? `data:image/jpeg;base64,${imageBase64}`
      : imageUrl;

    // Use OpenAI Vision to extract invoice/receipt data
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this invoice or receipt and extract the following information in JSON format:
{
  "documentType": "invoice" or "receipt",
  "vendorName": "vendor/supplier name",
  "vendorAddress": "vendor address if available",
  "vendorGSTIN": "GST number if available",
  "invoiceNumber": "invoice/receipt number",
  "date": "date in YYYY-MM-DD format",
  "items": [
    {
      "description": "item description",
      "quantity": number,
      "unitPrice": number,
      "amount": number,
      "taxRate": number (percentage)
    }
  ],
  "subtotal": number,
  "taxAmount": number,
  "totalAmount": number,
  "currency": "currency code",
  "paymentMethod": "payment method if mentioned",
  "category": "suggested category (e.g., Office Supplies, Travel, Utilities, Professional Services, Marketing, etc.)",
  "confidence": "high/medium/low"
}

If any field is not clearly visible or not applicable, use null. Be as accurate as possible.`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageContent
                }
              }
            ]
          }
        ],
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.log(`OpenAI Vision API error during OCR processing: ${response.status} - ${errorData}`);
      return c.json({ 
        error: "Failed to process image", 
        details: errorData,
        status: response.status,
        hint: response.status === 401 ? "Check your OpenAI API key" : "OpenAI Vision API error"
      }, response.status);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.log('Invalid OpenAI Vision response structure:', JSON.stringify(data));
      return c.json({ error: "Invalid response from OpenAI Vision", details: JSON.stringify(data) }, 500);
    }
    
    const extractedText = data.choices[0].message.content;

    // Parse the JSON response
    let extractedData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = JSON.parse(extractedText);
      }
    } catch (parseError) {
      console.log("JSON Parse Error during OCR:", parseError);
      return c.json({ 
        error: "Failed to parse extracted data", 
        rawText: extractedText 
      }, 500);
    }

    // Store the processed invoice/receipt
    const documentId = `ocr:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(documentId, JSON.stringify({
      ...extractedData,
      processedAt: new Date().toISOString(),
      id: documentId
    }));

    return c.json({ 
      success: true,
      data: extractedData,
      documentId
    });

  } catch (error) {
    console.log("OCR Processing Error:", error);
    return c.json({ error: "Internal server error during OCR processing", details: String(error) }, 500);
  }
});

// Get all OCR processed documents
app.get("/make-server-db10586b/ai/ocr/documents", async (c) => {
  try {
    const documents = await kv.getByPrefix("ocr:");
    
    const parsed = documents
      .map(doc => {
        try {
          return JSON.parse(doc);
        } catch (e) {
          console.log("Error parsing document:", e);
          return null;
        }
      })
      .filter(doc => doc !== null)
      .sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime());

    return c.json({ documents: parsed });
  } catch (error) {
    console.log("Error retrieving OCR documents:", error);
    return c.json({ error: "Failed to retrieve documents", details: String(error) }, 500);
  }
});

// AI-powered expense categorization suggestion
app.post("/make-server-db10586b/ai/categorize", async (c) => {
  try {
    const { description, amount, vendor } = await c.req.json();
    
    if (!description) {
      return c.json({ error: "Description is required" }, 400);
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.log("Categorization Error: OPENAI_API_KEY environment variable not set");
      return c.json({ error: "OpenAI API key not configured" }, 500);
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expense categorization assistant. Suggest appropriate accounting categories for expenses."
          },
          {
            role: "user",
            content: `Categorize this expense:
Description: ${description}
${amount ? `Amount: ${amount}` : ''}
${vendor ? `Vendor: ${vendor}` : ''}

Respond with JSON: { "category": "category name", "subcategory": "subcategory if applicable", "taxDeductible": true/false, "confidence": "high/medium/low" }`
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.log(`OpenAI API error during categorization: ${response.status} - ${errorData}`);
      return c.json({ error: "Failed to categorize", details: errorData }, response.status);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      const categorization = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
      return c.json(categorization);
    } catch (e) {
      console.log("Categorization JSON parse error:", e);
      return c.json({ error: "Failed to parse categorization", rawText: result }, 500);
    }

  } catch (error) {
    console.log("Categorization Error:", error);
    return c.json({ error: "Internal server error during categorization", details: String(error) }, 500);
  }
});

// Company settings endpoints
app.post("/make-server-db10586b/settings/company", async (c) => {
  try {
    const settings = await c.req.json();
    await kv.set("company:settings", JSON.stringify(settings));
    return c.json({ success: true });
  } catch (error) {
    console.log("Error saving company settings:", error);
    return c.json({ error: "Failed to save company settings", details: String(error) }, 500);
  }
});

app.get("/make-server-db10586b/settings/company", async (c) => {
  try {
    const settings = await kv.get("company:settings");
    if (!settings) {
      return c.json({ settings: null });
    }
    return c.json({ settings: JSON.parse(settings) });
  } catch (error) {
    console.log("Error retrieving company settings:", error);
    return c.json({ error: "Failed to retrieve company settings", details: String(error) }, 500);
  }
});

// Subscription plan endpoints
app.get("/make-server-db10586b/subscription/plan", async (c) => {
  try {
    const plan = await kv.get("subscription:plan");
    return c.json({ plan: plan || 'free' });
  } catch (error) {
    console.log("Error retrieving subscription plan:", error);
    return c.json({ plan: 'free' });
  }
});

app.post("/make-server-db10586b/subscription/plan", async (c) => {
  try {
    const { plan } = await c.req.json();
    await kv.set("subscription:plan", plan);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error saving subscription plan:", error);
    return c.json({ error: "Failed to save plan", details: String(error) }, 500);
  }
});

app.get("/make-server-db10586b/subscription/usage", async (c) => {
  try {
    const usage = await kv.get("subscription:usage");
    return c.json({ usage: usage ? JSON.parse(usage) : { invoices: 0, bills: 0 } });
  } catch (error) {
    console.log("Error retrieving usage:", error);
    return c.json({ usage: { invoices: 0, bills: 0 } });
  }
});

app.post("/make-server-db10586b/subscription/usage", async (c) => {
  try {
    const { usage } = await c.req.json();
    await kv.set("subscription:usage", JSON.stringify(usage));
    return c.json({ success: true });
  } catch (error) {
    console.log("Error saving usage:", error);
    return c.json({ error: "Failed to save usage", details: String(error) }, 500);
  }
});

// Logo upload endpoint
app.post("/make-server-db10586b/settings/logo", async (c) => {
  try {
    const { imageBase64, fileName } = await c.req.json();
    
    if (!imageBase64) {
      return c.json({ error: "Image data is required" }, 400);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log("Logo Upload Error: Supabase credentials not configured");
      return c.json({ error: "Supabase not configured" }, 500);
    }

    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create bucket if it doesn't exist
    const bucketName = "make-db10586b-logos";
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false
      });
    }

    // Convert base64 to buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Upload file
    const filePath = `logo-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: "image/png",
        upsert: true
      });

    if (uploadError) {
      console.log("Upload error:", uploadError);
      return c.json({ error: "Failed to upload logo", details: uploadError.message }, 500);
    }

    // Get signed URL (valid for 10 years)
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 315360000); // 10 years in seconds

    return c.json({ 
      success: true, 
      url: urlData?.signedUrl,
      path: filePath 
    });

  } catch (error) {
    console.log("Logo Upload Error:", error);
    return c.json({ error: "Internal server error during logo upload", details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);