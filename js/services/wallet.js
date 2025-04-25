// WalletService: handles connection to Bitcoin extension wallets (Xverse & Magic Eden)
// and checks for ownership of a specific Ordinal inscription.

const WalletService = {
  provider: null,
  address: null,
  connected: false,
  // Ordinal inscription(s) that unlock the feature – replace with real IDs as needed
  requiredIds: [
    'e3d53…a2i0' // TODO: set real inscription IDs
  ],

  // Connect using Xverse via direct provider API
  async connectXverse() {
    if (!window.btc) {
      console.warn('Xverse wallet not found');
      return null;
    }

    try {
      console.log('🔑 Attempting Xverse connection via direct provider');
      // Use direct provider API - CSP safe, no external libraries needed
      let accounts;
      try {
        // Modern method first
        accounts = await window.btc.request({ method: 'getAccounts' });
      } catch (e) {
        // Some older wallets may use requestAccounts instead
        console.log('🔑 Fallback to requestAccounts');
        accounts = await window.btc.request({ method: 'requestAccounts' });
      }

      if (accounts && accounts.length > 0) {
        console.log('🔑 Xverse connected, account:', accounts[0]);
        return accounts[0];
      }
    } catch (err) {
      console.error('Xverse connect error:', err);
    }
    return null;
  },

  // Connect using Magic Eden Wallet
  async connectMagic() {
    // Check for Magic Eden provider (either direct or via magicEden namespace)
    const provider = window.bitcoin || (window.magicEden && window.magicEden.bitcoin);
    
    if (!provider) {
      console.warn('Magic Eden wallet not found');
      return null;
    }

    try {
      console.log('🔑 Attempting Magic Eden connection');
      let accounts;
      
      // Try modern method (connect API) first
      if (typeof provider.connect === 'function') {
        try {
          console.log('🔑 Using modern Magic Eden connect API');
          const response = await provider.connect({
            purposes: ['payment', 'ordinals'],
            message: 'Connect to Cockroach Run',
          });
          console.log('🔑 Magic Eden connect response:', response);
          return response.addresses?.ordinals || response.addresses?.payment;
        } catch (e) {
          console.warn('Modern connect failed:', e);
          // Fall through to basic API
        }
      }
      
      // Try standard Bitcoin Provider API
      console.log('🔑 Using standard API');
      try {
        accounts = await provider.request({ method: 'getAccounts' });
      } catch (e) {
        // Try legacy method as last resort
        accounts = await provider.request({ method: 'requestAccounts' });
      }
      
      if (accounts && accounts.length > 0) {
        console.log('🔑 Magic Eden connected, account:', accounts[0]);
        return accounts[0];
      }
    } catch (err) {
      console.error('Magic Eden connect error:', err);
    }
    return null;
  },

  // Main connect method that tries available wallets
  async connect() {
    try {
      // Reset state
      this.address = null;
      this.connected = false;
      
      // Detailed environment info for troubleshooting
      const location = window.location.toString();
      const isLocalhost = location.includes('localhost') || location.includes('127.0.0.1');
      const protocol = window.location.protocol;
      const isIframe = window !== window.top;
      const isExtensionsAllowed = !document.hasStorageAccess;
      
      console.log('🧩 Environment diagnostics:', {
        location,
        isLocalhost,
        protocol,
        isIframe,
        isExtensionsAllowed,
        'navigator.userAgent': navigator.userAgent
      });
      
      // Print ALL window properties to find alternative provider objects
      console.log('🔍 Available global objects that might be wallet providers:');
      const possibleWalletKeys = Object.getOwnPropertyNames(window).filter(key => 
        /wallet|btc|bitcoin|xverse|magic|unisat|hiro|leather/i.test(key)
      );
      console.log('Potential wallet globals:', possibleWalletKeys);
      
      // Check for wallet providers with detailed logging
      console.log('Looking for wallet providers:', {
        'window.SatsConnect': !!window.SatsConnect,
        'window.btc': !!window.btc, 
        'window.btc?.request': window.btc && typeof window.btc.request === 'function',
        'window.bitcoin': !!window.bitcoin,
        'window.bitcoin?.request': window.bitcoin && typeof window.bitcoin.request === 'function',
        'window.magicEden': !!window.magicEden,
        'window.ethereum': !!window.ethereum  // Some wallet extensions inject ethereum too
      });

      // Try direct and fallback detection methods
      let btcProvider = null;
      
      // More aggressive Xverse detection - it should inject as window.btc
      if (window.btc) {
        console.log('🔍 Found window.btc:', window.btc);
        btcProvider = window.btc;
      } else {
        console.log('🔍 No window.btc found');
      }
      
      // Some wallet providers inject under window.bitcoin
      let bitcoinProvider = null;
      if (window.bitcoin) {
        console.log('🔍 Found window.bitcoin:', typeof window.bitcoin);
        bitcoinProvider = window.bitcoin;
      } else if (window.magicEden && window.magicEden.bitcoin) {
        console.log('🔍 Found window.magicEden.bitcoin');
        bitcoinProvider = window.magicEden.bitcoin;
      }
      
      const hasXverse = !!btcProvider;
      const hasMagic = !!bitcoinProvider;
      console.log('Wallet availability:', { hasXverse, hasMagic });
      
      if (!hasXverse && !hasMagic) {
        // Special direct case for localhost
        if (isLocalhost && protocol === 'http:') {
          alert('Wallet extensions may be blocked in http:// localhost. Try using https:// or install the extension if not already done.');
        } else {
          alert('No Bitcoin wallet detected. Please install Xverse or Magic Eden Wallet extension and refresh. If already installed, check browser extension permissions.');
        }
        return false;
      }

      // Try to connect to wallets in order of preference
      let address = null;
      // Try Xverse first if it's detected
      if (hasXverse) {
        console.log('🔑 Attempting Xverse connection first');
        address = await this.connectXverse();
      }
      
      // If Xverse failed or not present, try Magic Eden
      if (!address && hasMagic) {
        console.log('🔑 Falling back to Magic Eden connection');
        address = await this.connectMagic();
      }
      
      // Try Xverse even if not detected (sometimes window.btc comes later)
      if (!address && window.btc) {
        console.log('🔑 Last attempt with window.btc that may have appeared late');
        address = await this.connectXverse();
      }

      if (!address) {
        alert('Wallet connection failed or was cancelled by user.');
        return false;
      }

      // Save connected address
      this.address = address;
      this.connected = true;
      
      // Update UI to show connected state
      this.updateUI();
      
      // Check for required ordinal
      const hasUnlockToken = await this.checkOrdinalOwnership();
      if (hasUnlockToken) {
        this.unlockFeatures();
      }
      
      return true;
    } catch (err) {
      console.error('Wallet connect error', err);
      alert('Failed to connect wallet: ' + (err.message || 'Unknown error'));
      return false;
    }
  },

  async checkOrdinalOwnership() {
    if (!this.address) return false;
    try {
      const url = `https://ordapi.xyz/address/${this.address}/inscriptions`;
      const list = await fetch(url).then(r => r.json());
      return list.some(i => this.requiredIds.includes(i.id));
    } catch (e) {
      console.warn('Ordinal lookup failed', e);
      return false;
    }
  },

  unlockFeatures() {
    // Simple global flag; expand as needed
    window.FeatureFlags = window.FeatureFlags || {};
    window.FeatureFlags.ordinalUnlocked = true;
    localStorage.setItem('ordinalUnlocked', '1');
    this.updateUI();
    console.log('Special features unlocked!');
  },

  isFeatureUnlocked() {
    return !!(window.FeatureFlags && window.FeatureFlags.ordinalUnlocked);
  },

  updateUI() {
    const btn = document.getElementById('connect-wallet-button');
    if (!btn) return;

    if (this.connected) {
      const short = this.address.slice(0, 6) + '…' + this.address.slice(-4);
      btn.classList.add('connected');
      btn.textContent = short;
      if (this.isFeatureUnlocked()) {
        btn.textContent += ' ✓';
      }
    } else {
      btn.classList.remove('connected');
      btn.textContent = 'CONNECT WALLET';
    }
  }
};

// Export to window
window.WalletService = WalletService;

// Self-test to see if wallet.js is loaded correctly
console.log('🔑 WalletService loaded successfully!');

// Wire up event handlers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔑 WalletService DOM ready handler');
  const btn = document.getElementById('connect-wallet-button');
  console.log('🔑 WalletService found button:', !!btn);
  if (btn) {
    btn.addEventListener('click', () => {
      console.log('🔑 WalletService direct button click');
      WalletService.connect();
    });
  }

  // Restore unlock flag from storage
  if (localStorage.getItem('ordinalUnlocked') === '1') {
    window.FeatureFlags = window.FeatureFlags || {};
    window.FeatureFlags.ordinalUnlocked = true;
  }
  
  WalletService.updateUI();
});

// Add fallback connect method to global scope for direct testing
window.testConnectWallet = function() {
  console.log('🔑 Direct connect test');
  if (!window.WalletService) {
    alert('WalletService not found!');
    return;
  }
  WalletService.connect();
};