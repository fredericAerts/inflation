import { useState, useEffect } from 'react';

import './news-banner.styl';

const NEWS_ITEMS = [
  'Federal Reserve signals potential rate cuts amid inflation concerns',
  'Bitcoin volatility reaches new highs as institutional adoption grows',
  'Financial repression policies transfer wealth from savers to debtors',
  'Fiat currency experiment enters sixth decade with mounting instability',
  'Gold prices surge as investors seek inflation hedges',
  'Housing markets face affordability crisis due to monetary expansion',
  'Lebanon banking crisis leaves millions without access to savings',
  'IMF approves emergency lending package for debt-distressed nation',
  'Developing nations struggle with dollar-denominated debt burdens',
  'Federal Reserve independence erodes under political pressure',
  'Commercial real estate bubble concerns grow with cheap money policies',
  'Pension obligations threaten government fiscal sustainability',
  'Food inflation hits vulnerable populations hardest worldwide',
  'Credit markets signal growing concern over sovereign debt sustainability',
  'Trade wars intensify monetary policy coordination challenges',
  'Asset-liability mismatches threaten banking sector stability',
  'Shadow banking growth complicates monetary policy transmission',
  'Bitcoin adoption accelerates in hyperinflation-hit countries',
  'Emerging market capital flight accelerates amid Fed policy shifts',
  'International remittances disrupted by payment system fragmentation',
  'Monetary financing of government deficits raises inflation expectations',
  'Exchange rate volatility hampers international trade agreements',
  'Offshore dollar markets grow beyond regulatory oversight',
  'Insurance industry struggles with long-term liability matching',
  'Real estate speculation fueled by monetary accommodation policies',
  'Income inequality widens as asset prices inflate faster than wages',
  'International development aid effectiveness undermined by currency volatility',
  'Cantillon effect widens wealth gap as new money flows to asset holders first',
  'Time preference distortion leads to malinvestment in unproductive sectors',
  'Sound money advocates propose return to commodity-backed currencies',
  'Debt monetization accelerates as governments face fiscal constraints',
  'Currency debasement forces citizens into speculative investments',
  'Gresham\'s law in action as bad money drives out good globally',
  'Monetary imperialism enables developed nations to export inflation',
  'Triffin dilemma exposes fundamental flaw in reserve currency system',
  'Unit of account instability makes long-term contracts impossible',
  'Economic calculation problems emerge from price signal distortion',
  'Soft money abundance fuels consumption over capital formation',
  'Intergeneration wealth transfer through inflation hits retirement savings',
  'Substitution bias in inflation calculations understates real burden',
  'Asset price inflation ignored in official monetary policy targets',
  'Financial engineering replaces productive economic activity',
  'Too big to fail doctrine socializes losses while privatizing gains',
  'Zero lower bound forces central banks into unconventional measures',
  'Competitive currency systems emerge in response to monopoly failures',
  'Barter systems resurface in countries with failed currencies',
  'Decentralized finance protocols challenge traditional banking intermediation',
];

function NewsBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % NEWS_ITEMS.length);
        
        setTimeout(() => {
          setIsAnimating(false);
        }, 100);
      }, 400);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="news-banner">
      <div className="news-banner__container">
        <div className="news-banner__label">
          NEWS
        </div>
        <div className="news-banner__content">
          <div 
            className={`news-banner__item ${isAnimating ? 'news-banner__item--sliding' : ''}`}
          >
            {NEWS_ITEMS[currentIndex]}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsBanner;
