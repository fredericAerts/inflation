import { useDispatch } from 'react-redux';
import { setAboutModalSection } from '../../NavMenu/navMenu.redux.actions';
import './story.styl';

function Story() {
  const dispatch = useDispatch();

  const handleReadingLinkClick = () => {
    dispatch(setAboutModalSection('reading'));
  };

  return (
    <article className="story">
      <section className="story__section">
        <p className="story__paragraph">
          <strong>Inflation</strong> is a persistent feature of the modern global economy. For <strong>billions of people</strong>, wages struggle to keep pace with rising prices, and saving for the future becomes an increasingly uphill task. Even in developed nations, individuals and businesses face uncertainty when making long-term financial plans, while in many developing nations, citizens contend with periods of <strong>sharp devaluation</strong> or even <strong>hyperinflation</strong>.
        </p>
        <p className="story__paragraph">
          Money is not just another economic tool; it is <strong>the foundation</strong> upon which contracts, trade, and savings rest. When that foundation is unstable, the result is a widespread difficulty in planning for the future. Families cannot reliably save, businesses cannot confidently invest, and governments accumulate debts that are prone to volatility. The result is an <strong>economic treadmill</strong> that forces constant adaptation, but rarely allows stability.
        </p>
        <p className="story__paragraph">
          Our monetary system, rather than serving as a reliable base for cooperation and long-term problem-solving, increasingly acts as <strong>a source of friction</strong>. It is an engineered system—one that has evolved over centuries—but it is now showing signs of being <strong>outdated, fragile, and misaligned</strong> with the challenges societies must confront.
        </p>
      </section>

      <div className="story__divider"></div>

      <section className="story__section">
        <h2 className="story__section-title">A Brief History of Money</h2>
        <p className="story__paragraph">
          The earliest forms of money emerged as <strong>ledgers</strong>: community records of who owed what to whom. Over time, this evolved into physical tokens—objects like shells, beads, or metals that held value because of scarcity and broad acceptance. Among these, <strong>gold and silver</strong> emerged as dominant forms of commodity money, prized for durability, divisibility, and universal recognition.
        </p>
        <p className="story__paragraph">
          As trade expanded, banking systems arose to make the movement of money more efficient. Banks issued notes as claims on gold and silver deposits, and these gradually evolved into widely accepted forms of exchange in their own right. National governments formalized this system, tying their currencies to precious metals in arrangements like the <strong>classical gold standard</strong>.
        </p>
        <p className="story__paragraph">
          The 20th century, however, brought successive transformations. After the disruptions of two world wars, the <strong>Bretton Woods system</strong> established the U.S. dollar as the global reserve currency, pegged to gold. That system lasted until <strong>1971</strong>, when the dollar's direct link to gold was severed. Since then, the global economy has operated on <strong>fiat money</strong>: currencies backed not by commodities but by government decree, with value enforced through taxation, regulation, and trust in institutions. The <strong>U.S. dollar</strong>, reinforced by its role in global energy markets, became the linchpin of the international monetary order.
        </p>
      </section>

      <div className="story__divider"></div>

      <section className="story__section">
        <h2 className="story__section-title">Consequences of the Current System</h2>
        <p className="story__paragraph">
          While fiat money provides flexibility for governments and central banks, it also creates <strong>structural imbalances</strong>. Reserve currencies like the U.S. dollar can be issued in <strong>virtually unlimited quantities</strong>, giving their issuing countries an outsized degree of influence. Meanwhile, nations without such currencies face persistent instability, particularly when their debts are denominated in foreign money.
        </p>
        <p className="story__paragraph">
          This asymmetry means that <strong>economic volatility is not evenly distributed</strong>. Developed countries are able to export instability outward, while developing nations absorb its full impact. <strong>Inflation, currency crises, and reliance on external institutions</strong> such as the International Monetary Fund become recurring obstacles for billions of people.
        </p>
        <p className="story__paragraph">
          The result is a world where many cannot trust their local banks or currencies, and where even relatively stable jurisdictions struggle to provide citizens with savings instruments that keep pace with inflation. Far from offering a stable foundation, the global monetary system <strong>amplifies inequality and perpetuates cycles of dependency and volatility</strong>.
        </p>
      </section>

      <div className="story__divider"></div>

      <section className="story__section">
        <h2 className="story__section-title">Conclusion: A System That No Longer Serves</h2>
        <p className="story__paragraph">
          The global monetary system is not a neutral backdrop—it is <strong>a central piece of the puzzle</strong> behind many of today's most pressing challenges. With approximately <strong>160 currencies</strong> in circulation, most of them fragile and confined to their own jurisdictions, the international financial order is fragmented and prone to crisis. A handful of reserve currencies dominate, but they too erode in value over time and offer little protection for savers. For those born into weaker monetary systems, <strong>the struggle to preserve value becomes a lifelong battle</strong>.
        </p>
        <p className="story__paragraph">
          The consequences ripple outward. An unstable foundation makes it harder to confront shared challenges such as <strong>climate change, rising inequality, persistent conflict, and resource overconsumption</strong>. Instead of fostering cooperation and long-term planning, the monetary order often undermines them. <strong>Inflation encourages short-term consumption over sustainability</strong>. Financial asymmetries entrench geopolitical rivalries. Debt structures prolong wars and crises rather than resolving them.
        </p>
        <p className="story__paragraph">
          The system is <strong>outdated, increasingly fragile, and misaligned</strong> with the needs of a globalized world. As past centuries have shown, <strong>monetary orders do not last forever</strong>. They evolve, collapse, and are rebuilt in response to imbalances, technological shifts, and geopolitical change. The system established in the 1970s is showing signs of strain, and the choices societies make in the coming years will determine whether its successor offers <strong>greater stability and fairness</strong>—or <strong>deeper division and fragility</strong>.
        </p>
      </section>
      
      <small className="disclaimer">
        If you're interested in learning more about this topic, head over to the{' '}
        <button 
          className="story__link" 
          onClick={handleReadingLinkClick}
          type="button"
        >
          Further Reading
        </button>{' '}
        section.
      </small>
    </article>
  );
}

export default Story;