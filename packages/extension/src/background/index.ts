import { storage } from '../utils/storage';
import { api } from '../utils/api';

// Message types
interface Message {
  type: string;
  payload?: unknown;
}

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch(error => {
      console.error('Background message error:', error);
      sendResponse({ success: false, error: error.message });
    });
  
  // Return true to indicate async response
  return true;
});

async function handleMessage(message: Message, _sender: chrome.runtime.MessageSender) {
  switch (message.type) {
    case 'GET_AUTH_STATUS':
      return getAuthStatus();
    
    case 'LOGIN':
      return handleLogin(message.payload as { token: string });
    
    case 'LOGIN_WITH_API_KEY':
      return handleLoginWithApiKey(message.payload as { apiKey: string });
    
    case 'LOGOUT':
      return handleLogout();
    
    case 'GET_PROFILE':
      return getProfile();
    
    case 'CREATE_PRODUCT':
      return createProduct(message.payload);
    
    case 'SAVE_PRODUCT':
      return saveProduct(message.payload);
    
    case 'GENERATE_CONTENT':
      return generateContent(message.payload);
    
    case 'QUICK_GENERATE':
      return quickGenerate(message.payload);
    
    case 'GET_USAGE':
      return getUsage();
    
    case 'GET_SETTINGS':
      return getSettings();
    
    case 'UPDATE_SETTINGS':
      return updateSettings(message.payload);
    
    case 'OPEN_WEBAPP':
      return openWebApp(message.payload as { path?: string });
    
    default:
      return { success: false, error: 'Unknown message type' };
  }
}

// Auth handlers
async function getAuthStatus() {
  const isLoggedIn = await storage.isLoggedIn();
  const userData = await storage.getUserData();
  return { success: true, data: { isLoggedIn, user: userData } };
}

async function handleLogin(payload: { token: string }) {
  const { token } = payload;
  
  // Save token
  await storage.setAuthToken(token);
  
  // Verify and get user data
  const result = await api.verifyToken();
  
  if (result.success && result.data) {
    await storage.setUserData({
      id: result.data.id,
      email: result.data.email,
      name: result.data.name,
      planCode: result.data.plan.code,
    });
    return { success: true, data: result.data };
  } else {
    // Clear invalid token
    await storage.clearAuthToken();
    return { success: false, error: result.error || 'Invalid token' };
  }
}

async function handleLoginWithApiKey(payload: { apiKey: string }) {
  const { apiKey } = payload;
  
  // Verify API key first
  const result = await api.verifyApiKey(apiKey);
  
  if (result.success && result.data) {
    // Save API key after verification
    await storage.setApiKey(apiKey);
    await storage.setUserData({
      id: result.data.id,
      email: result.data.email,
      name: result.data.name,
      planCode: result.data.plan.code,
    });
    return { 
      success: true, 
      data: {
        id: result.data.id,
        email: result.data.email,
        name: result.data.name,
        planCode: result.data.plan.code,
      }
    };
  } else {
    return { success: false, error: result.error || 'Invalid API Key' };
  }
}

async function handleLogout() {
  await storage.clearAll();
  return { success: true };
}

async function getProfile() {
  const result = await api.getProfile();
  if (result.success && result.data) {
    // Update cached user data
    await storage.setUserData({
      id: result.data.id,
      email: result.data.email,
      name: result.data.name,
      planCode: result.data.plan.code,
    });
  }
  return result;
}

// Product handlers
async function createProduct(payload: unknown) {
  const result = await api.createProduct(payload as Parameters<typeof api.createProduct>[0]);
  
  if (result.success && result.data) {
    // Add to recent products
    await storage.addRecentProduct({
      id: result.data.id,
      title: result.data.title,
      source: result.data.source,
      createdAt: result.data.createdAt,
    });
  }
  
  return result;
}

// Save product only (without generating content)
async function saveProduct(payload: unknown) {
  const { product } = payload as { product: Parameters<typeof api.saveProduct>[0] };
  
  const result = await api.saveProduct(product);
  
  if (result.success && result.data) {
    // Add to recent products
    await storage.addRecentProduct({
      id: result.data.id,
      title: result.data.title,
      source: result.data.source,
      createdAt: result.data.createdAt,
    });
    
    return {
      success: true,
      data: {
        id: result.data.id,
        title: result.data.title,
        source: result.data.source,
        sourceUrl: result.data.sourceUrl,
      }
    };
  }
  
  return result;
}

// Generation handlers
async function generateContent(payload: unknown) {
  return api.generateContent(payload as Parameters<typeof api.generateContent>[0]);
}

async function quickGenerate(payload: unknown) {
  const { product, options } = payload as {
    product: Parameters<typeof api.quickGenerate>[0];
    options: Parameters<typeof api.quickGenerate>[1];
  };
  
  const result = await api.quickGenerate(product, options);
  
  if (result.success && result.data) {
    // Add to recent products
    await storage.addRecentProduct({
      id: result.data.product.id,
      title: result.data.product.title,
      source: result.data.product.source,
      createdAt: result.data.product.createdAt,
    });
  }
  
  return result;
}

async function getUsage() {
  return api.getUsage();
}

// Settings handlers
async function getSettings() {
  const settings = await storage.getSettings();
  const apiUrl = await storage.getApiUrl();
  const webAppUrl = apiUrl.replace('/api/v1', '').replace('/api', '');
  return { success: true, data: { ...settings, apiUrl, webAppUrl } };
}

async function updateSettings(payload: unknown) {
  const data = payload as { apiUrl?: string; [key: string]: unknown };
  
  if (data.apiUrl) {
    await storage.setApiUrl(data.apiUrl);
  }
  
  const { apiUrl, ...otherSettings } = data;
  if (Object.keys(otherSettings).length > 0) {
    await storage.setSettings(otherSettings as Parameters<typeof storage.setSettings>[0]);
  }
  
  const settings = await storage.getSettings();
  const currentApiUrl = await storage.getApiUrl();
  const webAppUrl = currentApiUrl.replace('/api/v1', '').replace('/api', '');
  return { success: true, data: { ...settings, apiUrl: currentApiUrl, webAppUrl } };
}

// Open web app
async function openWebApp(payload: { path?: string }) {
  const apiUrl = await storage.getApiUrl();
  // Extract base URL from API URL
  const baseUrl = apiUrl.replace('/api/v1', '').replace('/api', '');
  const url = payload?.path ? `${baseUrl}${payload.path}` : baseUrl;
  
  await chrome.tabs.create({ url });
  return { success: true };
}

// Handle extension install/update
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('Extension installed');
    // Set default API URL
    await storage.setApiUrl('http://localhost:3000/api/v1');
  } else if (details.reason === 'update') {
    console.log('Extension updated');
  }
});

// Handle browser action click (when popup is not defined)
chrome.action.onClicked.addListener(async (tab) => {
  // This won't fire if popup is defined, but keeping for reference
  if (tab.id) {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'],
    });
  }
});

// Context menu for quick actions
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'generate-content',
    title: 'Generate TikTok Content',
    contexts: ['page'],
    documentUrlPatterns: [
      'https://*.aliexpress.com/*',
      'https://*.amazon.com/*',
      'https://*.amazon.co.uk/*',
      'https://*.amazon.de/*',
      'https://*.amazon.fr/*',
      'https://*.amazon.ae/*',
      'https://*.amazon.sa/*',
    ],
  });
  
  chrome.contextMenus.create({
    id: 'save-product',
    title: 'Save Product to Dashboard',
    contexts: ['page'],
    documentUrlPatterns: [
      'https://*.aliexpress.com/*',
      'https://*.amazon.com/*',
      'https://*.amazon.co.uk/*',
      'https://*.amazon.de/*',
      'https://*.amazon.fr/*',
      'https://*.amazon.ae/*',
      'https://*.amazon.sa/*',
      'https://*.ebay.com/*',
      'https://*.etsy.com/*',
      'https://*.walmart.com/*',
      'https://*.temu.com/*',
      'https://*.shein.com/*',
    ],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;
  
  try {
    if (info.menuItemId === 'generate-content') {
      // Send message to content script to extract product
      const result = await chrome.tabs.sendMessage(tab.id, { type: 'GET_EXTRACTED_PRODUCT' });
      
      if (result.success && result.data) {
        // Open popup
        await chrome.action.openPopup();
      }
    } else if (info.menuItemId === 'save-product') {
      // Extract and save product
      const extractResult = await chrome.tabs.sendMessage(tab.id, { type: 'GET_EXTRACTED_PRODUCT' });
      
      if (extractResult.success && extractResult.data) {
        const saveResult = await api.saveProduct(extractResult.data);
        
        if (saveResult.success && saveResult.data) {
          // Show notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Product Saved!',
            message: `${saveResult.data.title.substring(0, 50)}... saved to Dashboard`,
          });
          
          // Add to recent products
          await storage.addRecentProduct({
            id: saveResult.data.id,
            title: saveResult.data.title,
            source: saveResult.data.source,
            createdAt: saveResult.data.createdAt,
          });
        }
      }
    }
  } catch (error) {
    console.error('Context menu action error:', error);
  }
});

console.log('TikTok Content Generator background service worker started');
