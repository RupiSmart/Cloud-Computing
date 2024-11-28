class MoneyClassifier {
  constructor() {
      // Mapping nominal uang
      this.moneyClasses = [
          { nominal: 100, isKoin: true },
          { nominal: 500, isKoin: true },
          { nominal: 1000, isKoin: true },
          { nominal: 1000, isKoin: false },
          { nominal: 2000, isKoin: false },
          { nominal: 5000, isKoin: false },
          { nominal: 10000, isKoin: false },
          { nominal: 20000, isKoin: false },
          { nominal: 50000, isKoin: false },
          { nominal: 100000, isKoin: false }
      ];
  }

  // Simulasi deteksi
  async predict(imageBuffer) {
      // Simulasi processing time
      await new Promise(resolve => setTimeout(resolve, 500));

      // Random hasil untuk testing
      const randomIndex = Math.floor(Math.random() * this.moneyClasses.length);
      const result = this.moneyClasses[randomIndex];

      return {
          ...result,
          confidence: 0.85 + (Math.random() * 0.14), // 0.85 - 0.99
          isReal: Math.random() > 0.1 // 90% chance asli
      };
  }

  // Check posisi
  checkPosition(imageBuffer) {
      // Simulasi check posisi
      const position = Math.random();
      return {
          position,
          isValid: position >= 0.5
      };
  }
}

module.exports = MoneyClassifier;