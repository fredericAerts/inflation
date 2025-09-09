import { useDispatch } from 'react-redux';
import { setAboutModalSection } from '../../NavMenu/navMenu.redux.actions';
import './story.styl';

function Story() {
  const dispatch = useDispatch();

  const handleReadingLinkClick = () => {
    dispatch(setAboutModalSection('reading'));
  };

  return (
    <article className="story"><section className="story__section">
        <p className="story__paragraph">
          Inflation is a persistent feature of the modern global economy. For billions of people, wages struggle to keep pace with rising prices, and saving for the future becomes an increasingly uphill task. Even in developed nations, individuals and businesses face uncertainty when making long-term financial plans, while in many developing nations, citizens contend with periods of sharp devaluation or even hyperinflation.
        </p>
        <p className="story__paragraph">
          Money is not just another economic tool; it is the foundation upon which contracts, trade, and savings rest. When that foundation is unstable, the result is a widespread difficulty in planning for the future. Families cannot reliably save, businesses cannot confidently invest, and governments accumulate debts that are prone to volatility. The result is an economic treadmill that forces constant adaptation, but rarely allows stability.
        </p>
        <p className="story__paragraph">
          Our monetary system, rather than serving as a reliable base for cooperation and long-term problem-solving, increasingly acts as a source of friction. It is an engineered system—one that has evolved over centuries—but it is now showing signs of being outdated, fragile, and misaligned with the challenges societies must confront.
        </p>
      </section>

      <section className="story__section">
        <h2 className="story__section-title">A Brief History of Money</h2>
        <p className="story__paragraph">
          The earliest forms of money emerged as ledgers: community records of who owed what to whom. Over time, this evolved into physical tokens—objects like shells, beads, or metals that held value because of scarcity and broad acceptance. Among these, gold and silver emerged as dominant forms of commodity money, prized for durability, divisibility, and universal recognition.
        </p>
        <p className="story__paragraph">
          As trade expanded, banking systems arose to make the movement of money more efficient. Banks issued notes as claims on gold and silver deposits, and these gradually evolved into widely accepted forms of exchange in their own right. National governments formalized this system, tying their currencies to precious metals in arrangements like the classical gold standard.
        </p>
        <p className="story__paragraph">
          The 20th century, however, brought successive transformations. After the disruptions of two world wars, the Bretton Woods system established the U.S. dollar as the global reserve currency, pegged to gold. That system lasted until 1971, when the dollar's direct link to gold was severed. Since then, the global economy has operated on fiat money: currencies backed not by commodities but by government decree, with value enforced through taxation, regulation, and trust in institutions. The U.S. dollar, reinforced by its role in global energy markets, became the linchpin of the international monetary order.
        </p>
      </section>

      <section className="story__section">
        <h2 className="story__section-title">Consequences of the Current System</h2>
        <p className="story__paragraph">
          While fiat money provides flexibility for governments and central banks, it also creates structural imbalances. Reserve currencies like the U.S. dollar can be issued in virtually unlimited quantities, giving their issuing countries an outsized degree of influence. Meanwhile, nations without such currencies face persistent instability, particularly when their debts are denominated in foreign money.
        </p>
        <p className="story__paragraph">
          This asymmetry means that economic volatility is not evenly distributed. Developed countries are able to export instability outward, while developing nations absorb its full impact. Inflation, currency crises, and reliance on external institutions such as the International Monetary Fund become recurring obstacles for billions of people.
        </p>
        <p className="story__paragraph">
          The result is a world where many cannot trust their local banks or currencies, and where even relatively stable jurisdictions struggle to provide citizens with savings instruments that keep pace with inflation. Far from offering a stable foundation, the global monetary system amplifies inequality and perpetuates cycles of dependency and volatility.
        </p>
      </section>

      <section className="story__section">
        <h2 className="story__section-title">Conclusion: A System That No Longer Serves</h2>
        <p className="story__paragraph">
          The global monetary system is not a neutral backdrop—it is a central piece of the puzzle behind many of today's most pressing challenges. With approximately 160 currencies in circulation, most of them fragile and confined to their own jurisdictions, the international financial order is fragmented and prone to crisis. A handful of reserve currencies dominate, but they too erode in value over time and offer little protection for savers. For those born into weaker monetary systems, the struggle to preserve value becomes a lifelong battle.
        </p>
        <p className="story__paragraph">
          The consequences ripple outward. An unstable foundation makes it harder to confront shared challenges such as climate change, rising inequality, persistent conflict, and resource overconsumption. Instead of fostering cooperation and long-term planning, the monetary order often undermines them. Inflation encourages short-term consumption over sustainability. Financial asymmetries entrench geopolitical rivalries. Debt structures prolong wars and crises rather than resolving them.
        </p>
        <p className="story__paragraph">
          The system is outdated, increasingly fragile, and misaligned with the needs of a globalized world. As past centuries have shown, monetary orders do not last forever. They evolve, collapse, and are rebuilt in response to imbalances, technological shifts, and geopolitical change. The system established in the 1970s is showing signs of strain, and the choices societies make in the coming years will determine whether its successor offers greater stability and fairness—or deeper division and fragility.
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